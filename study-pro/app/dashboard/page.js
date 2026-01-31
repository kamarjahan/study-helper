"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, YAxis } from "recharts";
import { useStudySession } from "@/hooks/useStudySession";
import { format, subDays, startOfYear, isSameDay, differenceInDays } from "date-fns";
import { FaCalendarAlt, FaClock, FaChartLine } from "react-icons/fa";

export default function Dashboard() {
  const { getStats } = useStudySession();
  
  // --- STATE ---
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    totalRange: 0,
    dailyAverage: 0,
    todayTotal: 0,
    sessionsCount: 0
  });
  
  // Filter State
  const [filterType, setFilterType] = useState("30"); // 'today', '30', '365', 'custom'
  const [customRange, setCustomRange] = useState({
    start: format(subDays(new Date(), 7), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd")
  });
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      let start = new Date();
      let end = new Date();

      // Determine Date Range
      if (filterType === "today") {
        start = new Date(); // Start & End are today
      } else if (filterType === "30") {
        start = subDays(new Date(), 30);
      } else if (filterType === "365") {
        start = startOfYear(new Date());
      } else if (filterType === "custom") {
        start = new Date(customRange.start);
        end = new Date(customRange.end);
      }

      // Fetch from Firestore
      const sessions = await getStats(start, end);
      
      // --- CALCULATE METRICS ---
      
      // 1. Total Time Today (Always calculated regardless of filter for the "Today" KPI)
      // We fetch a separate quick list for "Today" if the main filter isn't today, 
      // but to save reads, let's just filter the sessions array if it includes today,
      // or assume 0 if out of range. 
      // *Better approach for accuracy:* Client-side filter of the main set is risky if range doesn't include today.
      // For simplicity in this demo, we calculate stats strictly based on the *fetched* range.
      
      const totalSeconds = sessions.reduce((acc, curr) => acc + curr.duration, 0);
      const totalHours = (totalSeconds / 3600);
      
      // Calculate "Today" specifically from the batch (if present)
      const todaySessions = sessions.filter(s => isSameDay(s.date.toDate(), new Date()));
      const todaySeconds = todaySessions.reduce((acc, curr) => acc + curr.duration, 0);

      // Average Daily (Total Time / Number of Days in Range)
      const diffDays = Math.max(1, differenceInDays(end, start) + 1);
      const dailyAvg = totalHours / diffDays;

      setStats({
        totalRange: totalHours.toFixed(1),
        dailyAverage: dailyAvg.toFixed(1),
        todayTotal: (todaySeconds / 3600).toFixed(1),
        sessionsCount: sessions.length
      });

      // --- FORMAT CHART DATA ---
      // Group by Date
      const grouped = {};
      // Initialize keys for the range (optional, fills gaps)
      // For simplicity, we just map actual data:
      sessions.forEach(s => {
        const dateKey = format(s.date.toDate(), "MMM dd");
        if (!grouped[dateKey]) grouped[dateKey] = 0;
        grouped[dateKey] += (s.duration / 3600);
      });

      const chartData = Object.keys(grouped).map(key => ({
        name: key,
        hours: parseFloat(grouped[key].toFixed(2))
      }));

      setData(chartData);
      setLoading(false);
    };

    fetchData();
  }, [filterType, customRange, getStats]);

  return (
    <div className="p-8 min-h-screen bg-slate-900 text-white">
      
      {/* --- HEADER & FILTERS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
           <h1 className="text-3xl font-bold flex items-center gap-2">
             <FaChartLine className="text-cyan-400"/> Performance Analytics
           </h1>
           <p className="text-slate-400 text-sm mt-1">Track your study sessions and habits.</p>
        </div>

        {/* Range Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
          {[
            { label: "Today", val: "today" },
            { label: "30 Days", val: "30" },
            { label: "This Year", val: "365" },
            { label: "Custom", val: "custom" }
          ].map(btn => (
            <button
              key={btn.val}
              onClick={() => setFilterType(btn.val)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filterType === btn.val 
                  ? "bg-cyan-600 text-white shadow-lg" 
                  : "hover:bg-slate-700 text-slate-300"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- CUSTOM DATE PICKER --- */}
      {filterType === "custom" && (
        <div className="flex gap-4 mb-8 bg-slate-800/50 p-4 rounded-xl border border-slate-700 inline-flex">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Start Date</label>
            <input 
              type="date" 
              value={customRange.start}
              onChange={(e) => setCustomRange({...customRange, start: e.target.value})}
              className="bg-slate-900 border border-slate-600 rounded p-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">End Date</label>
            <input 
              type="date" 
              value={customRange.end}
              onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
              className="bg-slate-900 border border-slate-600 rounded p-2 text-sm"
            />
          </div>
        </div>
      )}

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Today */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-cyan-400">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Studied Today</p>
              <h2 className="text-4xl font-bold text-white mt-2">{stats.todayTotal} <span className="text-lg text-slate-500">hrs</span></h2>
            </div>
            <FaClock className="text-cyan-900 text-4xl opacity-50" />
          </div>
        </div>

        {/* Card 2: Average */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-purple-400">
          <div>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Daily Average</p>
             <h2 className="text-4xl font-bold text-white mt-2">{stats.dailyAverage} <span className="text-lg text-slate-500">hrs</span></h2>
             <p className="text-xs text-slate-400 mt-1">Based on selected range</p>
          </div>
        </div>

        {/* Card 3: Total Range */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-blue-400">
          <div>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Volume</p>
             <h2 className="text-4xl font-bold text-white mt-2">{stats.totalRange} <span className="text-lg text-slate-500">hrs</span></h2>
             <p className="text-xs text-slate-400 mt-1">Total accumulated time</p>
          </div>
        </div>

        {/* Card 4: Sessions */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-green-400">
           <div>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Sessions</p>
             <h2 className="text-4xl font-bold text-white mt-2">{stats.sessionsCount}</h2>
             <p className="text-xs text-slate-400 mt-1">Completed Pomodoros</p>
          </div>
        </div>
      </div>

      {/* --- MAIN CHART --- */}
      <div className="glass-card p-6 rounded-2xl h-[500px]">
        <h3 className="text-xl font-bold mb-6 text-slate-200">Study Trends</h3>
        
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <FaCalendarAlt size={48} className="mb-4 opacity-20" />
            <p>No study data found for this period.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                tick={{fontSize: 12}} 
                minTickGap={30}
              />
              <YAxis stroke="#94a3b8" unit="h" />
              <Tooltip 
                cursor={{fill: '#334155', opacity: 0.2}}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
              />
              <Bar 
                dataKey="hours" 
                fill="#06b6d4" 
                radius={[4, 4, 0, 0]} 
                barSize={40}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}