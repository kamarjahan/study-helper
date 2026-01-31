"use client";
import { useState, useEffect, useRef } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion, AnimatePresence } from "framer-motion";
import { useStudySession } from "@/hooks/useStudySession";
import { useSettings } from "@/hooks/useSettings"; 
import { FaBrain, FaCalculator, FaPlay, FaPause, FaCoffee, FaPen } from "react-icons/fa";

export default function FocusPage() {
  const { settings, loading } = useSettings();
  const { saveSession } = useStudySession();
  
  // Timer State
  const [mode, setMode] = useState("focus"); // 'focus', 'short', 'long'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [customTime, setCustomTime] = useState(25); // For manual editing
  const [isEditing, setIsEditing] = useState(false);
  
  // Tools State
  const [distractions, setDistractions] = useState([]);
  const [showDump, setShowDump] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [calcInput, setCalcInput] = useState("");
  
  const workerRef = useRef();

  // 1. Sync Timer with Settings OR Custom Edit
  useEffect(() => {
    if (!loading && settings && !isEditing) {
      if (mode === "focus") setTimeLeft(settings.focusDuration * 60);
      if (mode === "short") setTimeLeft(settings.shortBreak * 60);
      if (mode === "long") setTimeLeft(settings.longBreak * 60);
      setIsActive(false);
    }
  }, [settings, loading, mode]);

  // 2. Web Worker for Background Timer
  useEffect(() => {
    workerRef.current = new Worker("/timer.worker.js");
    workerRef.current.onmessage = () => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishTimer();
          return 0;
        }
        return prev - 1;
      });
    };
    return () => workerRef.current.terminate();
  }, [mode]);

  // 3. Handle Completion (Alarm + Notification + Next Step)
  const finishTimer = () => {
    setIsActive(false);
    workerRef.current.postMessage("stop");
    
    // Play Sound
    new Audio("/sounds/alarm.mp3").play().catch(() => {});

    // System Notification
    if (Notification.permission === "granted") {
      new Notification("Time's Up!", {
        body: mode === 'focus' ? "Great job! Time for a break." : "Break over! Back to work.",
        icon: "/file.svg"
      });
    }

    // Logic
    if (mode === "focus") {
      saveSession(settings.focusDuration * 60, "General", distractions);
      if(confirm("Focus Session Complete! Start Short Break?")) {
        setMode("short");
        setIsActive(true); // Auto-start break
        workerRef.current.postMessage("start");
      }
    } else {
      if(confirm("Break Over! Ready to Focus?")) {
        setMode("focus");
      }
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    workerRef.current.postMessage(isActive ? "stop" : "start");
    
    // Request notification permission on first start
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  // 4. Handle Manual Time Edit
  const handleManualEdit = (newMinutes) => {
    setCustomTime(newMinutes);
    setTimeLeft(newMinutes * 60);
    setIsEditing(false);
  };

  const totalTime = isEditing 
    ? customTime * 60 
    : (mode === 'focus' ? settings?.focusDuration * 60 : (mode === 'short' ? settings?.shortBreak * 60 : settings?.longBreak * 60));
  
  const percentage = (timeLeft / (totalTime || 1)) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-900 text-white">
      
      {/* Top Mode Switchers */}
      <div className="absolute top-8 flex gap-4 z-20">
        <button onClick={() => setMode("focus")} className={`px-4 py-2 rounded-full font-bold transition-all ${mode === 'focus' ? 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'bg-slate-800 text-slate-400'}`}>Deep Focus</button>
        <button onClick={() => setMode("short")} className={`px-4 py-2 rounded-full font-bold transition-all ${mode === 'short' ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]' : 'bg-slate-800 text-slate-400'}`}>Short Break</button>
        <button onClick={() => setMode("long")} className={`px-4 py-2 rounded-full font-bold transition-all ${mode === 'long' ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-slate-800 text-slate-400'}`}>Long Break</button>
      </div>

      <div className="absolute top-8 right-8 flex gap-3 z-20">
        <button onClick={() => setShowCalc(!showCalc)} className="bg-slate-800 p-3 rounded-full hover:bg-slate-700 text-cyan-400 transition-colors"><FaCalculator size={20} /></button>
        <button onClick={() => setShowDump(true)} className="bg-slate-800 p-3 rounded-full hover:bg-slate-700 text-pink-400 transition-colors"><FaBrain size={20} /></button>
      </div>

      {/* Main Visual Timer */}
      <div className="relative mb-8 group">
        <motion.div layout className="w-80 h-80 md:w-96 md:h-96 relative z-10">
          <CircularProgressbar
            value={percentage}
            text={`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`}
            styles={buildStyles({
              textColor: "#fff",
              pathColor: mode === 'focus' ? "#06b6d4" : mode === 'short' ? "#22c55e" : "#3b82f6",
              trailColor: "rgba(255,255,255,0.05)",
              textSize: "18px"
            })}
          />
        </motion.div>
        
        {/* Edit Button (Appears on Hover) */}
        {!isActive && (
           <button 
             onClick={() => setIsEditing(true)}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-12 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all z-20"
           >
             <FaPen /> Edit Time
           </button>
        )}
      </div>

      {/* Edit Mode Input */}
      {isEditing && (
        <div className="absolute z-30 bg-slate-800 p-4 rounded-xl border border-slate-600 flex gap-2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-2xl">
           <input 
             type="number" 
             className="bg-slate-900 text-white p-2 rounded w-20 text-center"
             autoFocus
             defaultValue={Math.floor(timeLeft / 60)}
             onKeyDown={(e) => {
                if(e.key === 'Enter') handleManualEdit(parseInt(e.currentTarget.value));
             }}
           />
           <button onClick={() => setIsEditing(false)} className="px-3 bg-red-500 rounded font-bold">X</button>
        </div>
      )}

      {/* Action Button */}
      <button onClick={toggleTimer} className="px-12 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full text-xl font-bold hover:scale-105 transition-transform shadow-lg z-10 flex items-center gap-2">
        {isActive ? <><FaPause /> PAUSE PROTOCOL</> : <><FaPlay /> INITIATE {mode.toUpperCase()}</>}
      </button>

      {/* Calculator Modal */}
      {showCalc && (
        <motion.div initial={{y: 50, opacity: 0}} animate={{y:0, opacity:1}} className="absolute bottom-20 right-8 bg-slate-800/90 backdrop-blur-xl border border-slate-700 p-4 rounded-xl w-64 z-30 shadow-2xl">
          <input value={calcInput} readOnly className="w-full bg-slate-900/80 p-3 mb-3 text-right rounded-lg text-xl font-mono text-white" />
          <div className="grid grid-cols-4 gap-2">
            {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].map(key => (
              <button 
                key={key} 
                onClick={() => {
                  if(key === 'C') setCalcInput("");
                  else if(key === '=') { try { setCalcInput(eval(calcInput).toString()) } catch { setCalcInput("Error") } }
                  else setCalcInput(prev => prev + key);
                }}
                className={`p-2 rounded font-bold text-white ${key === '=' ? 'col-span-2 bg-cyan-600' : 'bg-slate-700 hover:bg-slate-600'}`}
              >{key}</button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Mind Dump Modal */}
      <AnimatePresence>
        {showDump && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div initial={{scale: 0.9}} animate={{scale: 1}} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-lg shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 text-white">Mental Offload</h2>
              <textarea 
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 h-40 text-white focus:border-cyan-500 outline-none resize-none"
                placeholder="What is distracting you? Write it down and let it go..."
                onBlur={(e) => {
                  if(e.target.value) setDistractions([...distractions, { text: e.target.value, time: new Date() }]);
                }}
              ></textarea>
              <button onClick={() => setShowDump(false)} className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-bold transition-colors">Close & Refocus</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}