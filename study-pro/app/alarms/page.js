"use client";
import { useState, useEffect, useRef } from "react";
import emailjs from "emailjs-com";
import { useSettings } from "@/hooks/useSettings"; 
import { FaTrash, FaPlus, FaClock, FaBell } from "react-icons/fa"; 

export default function AlarmPage() {
  const { settings } = useSettings(); // Get settings from your custom hook
  
  // --- STATE ---
  const [alarms, setAlarms] = useState([]); // Stores the list of alarms
  const [newTask, setNewTask] = useState("");
  const [newTime, setNewTime] = useState("");
  
  // --- RINGING STATE ---
  const [isRinging, setIsRinging] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState(null); 
  const [mathProblem, setMathProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");

  // --- REFS (For Safety) ---
  const isRingingRef = useRef(false);
  const audioRef = useRef(null);

  // 1. CLOCK CHECKER (Runs every second)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      // Format current time as HH:MM (24-hour format) to match input
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      
      alarms.forEach((alarm) => {
        // Trigger if time matches AND it's not already ringing
        if (alarm.time === currentTime && !isRingingRef.current) {
          triggerAlarm(alarm);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms]);

  // 2. TRIGGER ALARM
  const triggerAlarm = (alarm) => {
    setIsRinging(true);
    setActiveAlarm(alarm);
    isRingingRef.current = true; // Mark as ringing for the fail-safe

    // Generate Math Problem
    const a = Math.floor(Math.random() * 50) + 10;
    const b = Math.floor(Math.random() * 50) + 10;
    setMathProblem({ q: `${a} + ${b}`, a: a + b });

    // Play Sound Loop
    if (!audioRef.current) audioRef.current = new Audio("/sounds/alarm.mp3");
    audioRef.current.loop = true;
    audioRef.current.play().catch((e) => console.log("Audio Error:", e));

    // START 5-MINUTE FAIL-SAFE
    setTimeout(() => {
      // If still ringing after 2 mins, send email
      if (isRingingRef.current && settings?.emergencyEmail) {
        sendEmergencyEmail(settings.emergencyEmail, alarm.task);
      }
    }, 2 * 60 * 1000); 
  };

  // 3. SEND EMAIL (Fail-Safe)
  const sendEmergencyEmail = (targetEmail, taskName) => {
    emailjs.send(
      "Study-Helper", // REPLACE WITH YOUR SERVICE ID
      "template_2d6pduo", // REPLACE WITH YOUR TEMPLATE ID
      {
        to_email: targetEmail,
        message: `URGENT: User failed to wake up for task: "${taskName}" after 2 minutes!`,
      }, 
      "2iAO2hcDv-c-ulN4W" // REPLACE WITH YOUR PUBLIC KEY
    );
  };

  // 4. VERIFY ANSWER & AUTO-DELETE
  const verifyAnswer = () => {
    if (parseInt(userAnswer) === mathProblem.a) {
      stopAlarm();
    } else {
      alert("Wrong! The alarm won't stop until you solve it.");
      setUserAnswer("");
    }
  };

  const stopAlarm = () => {
    // 1. Stop Sound & UI
    setIsRinging(false);
    isRingingRef.current = false;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // 2. AUTO DELETE LOGIC (The Fix)
    // Remove the active alarm from the list so it doesn't ring again
    if (activeAlarm) {
      setAlarms(prevAlarms => prevAlarms.filter(alarm => alarm.id !== activeAlarm.id));
      alert(`Alarm Stopped. "${activeAlarm.task}" removed from list.`);
    }
    
    // 3. Cleanup
    setActiveAlarm(null);
    setUserAnswer("");
  };

  // 5. ADD/DELETE HANDLERS
  const addAlarm = () => {
    if (!newTime || !newTask) return alert("Please set both time and task.");
    // Create new alarm object
    const alarmObj = { id: Date.now(), time: newTime, task: newTask };
    setAlarms([...alarms, alarmObj]);
    setNewTask("");
    setNewTime("");
  };

  const deleteAlarm = (id) => {
    setAlarms(alarms.filter((a) => a.id !== id));
  };

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <FaClock className="text-cyan-400" /> Smart Alarm Protocol
      </h1>

      {/* --- CREATOR --- */}
      <div className="glass-card p-6 rounded-xl w-full max-w-md mb-8 border border-slate-700 bg-slate-800/50">
        <h2 className="text-lg font-bold mb-4 text-slate-300">Set One-Time Alarm</h2>
        <div className="flex gap-4 mb-4">
          <input 
            type="time" 
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="bg-slate-900 border border-slate-600 p-3 rounded-lg text-white outline-none focus:border-cyan-500"
          />
          <input 
            type="text" 
            placeholder="Task Name (e.g. Physics)"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="bg-slate-900 border border-slate-600 p-3 rounded-lg text-white outline-none focus:border-cyan-500 flex-1"
          />
        </div>
        <button 
          onClick={addAlarm}
          className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/20"
        >
          <FaPlus /> Set Alarm
        </button>
      </div>

      {/* --- LIST --- */}
      <div className="w-full max-w-md space-y-3">
        {alarms.length === 0 && (
          <div className="text-slate-500 text-center py-10 border-2 border-dashed border-slate-800 rounded-xl">
            No active alarms set.
          </div>
        )}
        {alarms.map((alarm) => (
          <div key={alarm.id} className="bg-slate-800 p-4 rounded-lg flex justify-between items-center border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4">
              <div className="bg-slate-700 p-2 rounded-full text-cyan-400">
                <FaBell />
              </div>
              <div>
                <span className="text-2xl font-bold text-white block leading-none mb-1">{alarm.time}</span>
                <p className="text-slate-400 text-sm">{alarm.task}</p>
              </div>
            </div>
            <button onClick={() => deleteAlarm(alarm.id)} className="text-slate-500 hover:text-red-500 transition-colors p-2">
              <FaTrash />
            </button>
          </div>
        ))}
      </div>

      {/* --- FULL SCREEN RINGING OVERLAY --- */}
      {isRinging && (
        <div className="fixed inset-0 bg-red-900/95 z-50 flex flex-col items-center justify-center p-8 animate-pulse">
          <div className="bg-slate-900 p-10 rounded-2xl shadow-2xl max-w-lg w-full text-center border-4 border-red-500 relative">
            
            <h1 className="text-6xl font-black text-white mb-2 tracking-tighter">WAKE UP!</h1>
            <p className="text-2xl text-red-400 mb-8 font-bold uppercase">{activeAlarm?.task}</p>
            
            <div className="bg-slate-800 p-8 rounded-xl mb-6 border border-slate-700">
              <p className="text-slate-400 mb-2 uppercase text-xs font-bold tracking-widest">Security Challenge</p>
              <p className="text-5xl font-mono font-bold text-white mb-6">{mathProblem?.q} = ?</p>
              <input 
                type="number" 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verifyAnswer()}
                className="w-full bg-slate-900 text-center text-4xl py-4 rounded-lg outline-none border-2 border-slate-600 focus:border-cyan-500 text-white"
                placeholder="?"
                autoFocus
              />
            </div>

            <button 
              onClick={verifyAnswer} 
              className="w-full bg-white text-red-600 font-black py-4 rounded-xl hover:bg-slate-200 transition-colors text-xl shadow-xl"
            >
              STOP ALARM
            </button>
            <p className="text-xs text-red-400/60 mt-6">Emergency Protocol active. Email sent in 5m if unsolved.</p>
          </div>
        </div>
      )}
    </div>
  );
}