"use client";
import { useState, useEffect, useRef } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion } from "framer-motion";
import { useStudySession } from "@/hooks/useStudySession";

export default function FocusPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const workerRef = useRef();
  const { saveSession } = useStudySession();

  // Initialize Worker
  useEffect(() => {
    workerRef.current = new Worker("/timer.worker.js");
    workerRef.current.onmessage = () => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    };
    return () => workerRef.current.terminate();
  }, []);

  const handleTimerComplete = () => {
    setIsActive(false);
    workerRef.current.postMessage("stop");
    new Audio("/sounds/alarm.mp3").play(); 
    
    // SAVE THE DATA
    saveSession(25 * 60, "Coding"); // Saves 25 mins under "Coding"
    
    alert("Session Complete & Saved!");
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    workerRef.current.postMessage(isActive ? "stop" : "start");
  };

  const percentage = (timeLeft / (25 * 60)) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
      <motion.div 
        initial={{ scale: 0.8 }} 
        animate={{ scale: 1 }} 
        className="w-96 h-96 relative"
      >
        <CircularProgressbar
          value={percentage}
          text={`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`}
          styles={buildStyles({
            textColor: "#fff",
            pathColor: isActive ? "#ec4899" : "#3b82f6", // Pink to Blue transition
            trailColor: "#1e293b",
            pathTransitionDuration: 0.5,
          })}
        />
      </motion.div>
      
      <button 
        onClick={toggleTimer}
        className="mt-8 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-xl font-bold shadow-lg hover:shadow-cyan-500/50 transition-all"
      >
        {isActive ? "PAUSE" : "START FOCUS"}
      </button>
    </div>
  );
}