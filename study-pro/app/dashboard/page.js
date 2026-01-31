"use client"; // <--- THIS LINE IS REQUIRED FOR RECHARTS
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

// Mock Data (Replace with Firestore data)
const data = [
  { name: 'Mon', hours: 4 },
  { name: 'Tue', hours: 6 },
  { name: 'Wed', hours: 2 },
  { name: 'Thu', hours: 8 },
  { name: 'Fri', hours: 5 },
];

export default function Dashboard() {
  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <h2 className="text-3xl font-bold mb-6">Study Analytics</h2>
      <div className="h-64 bg-slate-800 p-4 rounded-xl border border-slate-700">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
              cursor={{ fill: '#334155' }}
            />
            <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}