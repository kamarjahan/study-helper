"use client";
import { useHabits } from "@/hooks/useHabits";
import { FaTrash, FaCheck } from "react-icons/fa"; // npm install react-icons

export default function HabitTracker() {
  const { habits, addHabit, toggleHabit, deleteHabit } = useHabits();

  return (
    <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
      <h3 className="text-xl font-bold mb-4 text-white">Habit Protocol</h3>
      
      {/* Add New Habit */}
      <div className="flex gap-2 mb-6">
        <input 
          id="newHabit"
          type="text" 
          placeholder="New Protocol (e.g. Drink 500ml Water)"
          className="flex-1 bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white"
        />
        <button 
          onClick={() => {
            const val = document.getElementById("newHabit").value;
            if(val) addHabit(val);
          }}
          className="bg-cyan-600 px-4 rounded text-white font-bold"
        >
          + ADD
        </button>
      </div>

      {/* Habit List */}
      <div className="space-y-3">
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleHabit(habit.id, habit.completedToday)}
                className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                  habit.completedToday 
                    ? "bg-green-500 border-green-500" 
                    : "border-slate-500 hover:border-cyan-400"
                }`}
              >
                {habit.completedToday && <FaCheck size={12} />}
              </button>
              <span className={habit.completedToday ? "line-through text-slate-500" : "text-slate-200"}>
                {habit.title}
              </span>
            </div>
            
            <button 
              onClick={() => deleteHabit(habit.id)}
              className="text-slate-600 hover:text-red-500 transition-colors"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}