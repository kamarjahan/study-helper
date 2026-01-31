"use client";
import { useState, useEffect, useRef } from "react";
import { useHabits } from "@/hooks/useHabits";
import { FaTrash, FaCheck, FaEdit, FaPlus, FaClock, FaSave, FaTimes } from "react-icons/fa";

export default function HabitTracker() {
  const { habits, addHabit, updateHabit, toggleHabit, deleteHabit, loading } = useHabits();
  
  // Input State
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTime, setEditTime] = useState("");

  // Alarm State
  const audioRef = useRef(null);
  const notifiedRef = useRef(new Set()); // Prevents double-ringing in the same minute

  // --- 1. ALARM CHECKER ---
  useEffect(() => {
    // Request Notification Permission on load
    if (typeof window !== 'undefined' && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      
      habits.forEach(habit => {
        if (habit.time === currentTime && !habit.completedToday && !notifiedRef.current.has(habit.id + currentTime)) {
          triggerAlarm(habit);
          // Mark as notified for this minute so it doesn't ring 60 times
          notifiedRef.current.add(habit.id + currentTime);
        }
      });
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [habits]);

  const triggerAlarm = (habit) => {
    // 1. Play Sound
    if (!audioRef.current) audioRef.current = new Audio("/sounds/alarm.mp3");
    audioRef.current.play().catch(e => console.log("Audio play failed", e));

    // 2. Show Notification
    if (Notification.permission === "granted") {
      new Notification(`Habit Reminder: ${habit.title}`, {
        body: "It's time to complete this habit!",
        icon: "/clock.svg" 
      });
    }

    alert(`⏰ TIME TO: ${habit.title}`);
  };

  // --- 2. HANDLERS ---
  const handleAdd = () => {
    if (!newTitle) return alert("Enter a habit name");
    addHabit(newTitle, newTime);
    setNewTitle("");
    setNewTime("");
  };

  const startEdit = (habit) => {
    setEditingId(habit.id);
    setEditTitle(habit.title);
    setEditTime(habit.time);
  };

  const saveEdit = () => {
    updateHabit(editingId, editTitle, editTime);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FaCheck className="text-green-400" /> Habit Protocol
        </h1>
        <p className="text-slate-400 mb-8">Build consistency with scheduled reminders.</p>

        {/* --- ADD NEW --- */}
        <div className="glass-card p-6 rounded-xl mb-8 flex flex-col md:flex-row gap-4 items-end bg-slate-800/50 border border-slate-700">
          <div className="flex-1 w-full">
            <label className="text-xs text-slate-400 mb-1 block">Habit Name</label>
            <input 
              type="text" 
              placeholder="e.g. Drink Water"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-500"
            />
          </div>
          <div className="w-full md:w-auto">
            <label className="text-xs text-slate-400 mb-1 block">Schedule (Optional)</label>
            <input 
              type="time" 
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-500"
            />
          </div>
          <button 
            onClick={handleAdd}
            className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-500 px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <FaPlus /> Add
          </button>
        </div>

        {/* --- LIST --- */}
        <div className="space-y-4">
          {loading && <p className="text-center text-slate-500">Loading habits...</p>}
          
          {habits.map((habit) => (
            <div 
              key={habit.id} 
              className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                habit.completedToday 
                  ? "bg-green-900/20 border-green-900/50" 
                  : "bg-slate-800 border-slate-700 hover:border-slate-600"
              }`}
            >
              {editingId === habit.id ? (
                // --- EDIT MODE ---
                <div className="flex flex-1 gap-2 items-center">
                  <input 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm"
                  />
                  <input 
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm"
                  />
                  <button onClick={saveEdit} className="text-green-400 p-2 hover:bg-slate-700 rounded"><FaSave /></button>
                  <button onClick={() => setEditingId(null)} className="text-red-400 p-2 hover:bg-slate-700 rounded"><FaTimes /></button>
                </div>
              ) : (
                // --- VIEW MODE ---
                <>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleHabit(habit.id, habit.completedToday)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        habit.completedToday 
                          ? "bg-green-500 border-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                          : "border-slate-500 hover:border-cyan-400 text-transparent"
                      }`}
                    >
                      <FaCheck size={14} />
                    </button>
                    
                    <div>
                      <h3 className={`font-bold text-lg ${habit.completedToday ? "line-through text-slate-500" : "text-white"}`}>
                        {habit.title}
                      </h3>
                      {habit.time && (
                        <p className="text-xs text-cyan-400 flex items-center gap-1">
                          <FaClock size={10} /> {habit.time}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => startEdit(habit)} className="text-slate-500 hover:text-cyan-400 p-2 transition-colors">
                      <FaEdit />
                    </button>
                    <button onClick={() => deleteHabit(habit.id)} className="text-slate-500 hover:text-red-500 p-2 transition-colors">
                      <FaTrash />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {habits.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
              No habits set. Add one above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}