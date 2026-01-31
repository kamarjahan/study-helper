"use client";
import { useState, useEffect, useRef } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion, AnimatePresence } from "framer-motion";
import { useStudySession } from "@/hooks/useStudySession";
import { useSettings } from "@/hooks/useSettings"; // 1. Import Settings
import { FaBrain } from "react-icons/fa"; // You might need: npm install react-icons

export default function FocusPage() {
  const { settings, loading: settingsLoading } = useSettings(); // 2. Get Settings
  const { saveSession } = useStudySession();
  
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [distractions, setDistractions] = useState([]); // Store "Mind Dumps"
  const [showDump, setShowDump] = useState(false);
  const workerRef = useRef();

  // 3. Sync Timer with Settings when they load
  useEffect(() => {
    if (!settingsLoading && settings?.focusDuration) {
      setTimeLeft(settings.focusDuration * 60);
    }
  }, [settings, settingsLoading]);

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
    
    // Save Session with Distractions
    saveSession(
      settings.focusDuration * 60, 
      "General Study", 
      distractions // Pass distractions to be saved
    );
    
    alert("Session Complete!");
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    workerRef.current.postMessage(isActive ? "stop" : "start");
  };

  const addDistraction = (text) => {
    if(!text) return;
    setDistractions([...distractions, { text, time: new Date() }]);
    setShowDump(false);
  };

  // Calculate percentage based on DYNAMIC setting
  const totalTime = settings?.focusDuration ? settings.focusDuration * 60 : 25 * 60;
  const percentage = (timeLeft / totalTime) * 100;

  if (settingsLoading) return <div className="p-10 text-white">Loading protocols...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white relative overflow-hidden">
      
      {/* Mind Dump Button */}
      <button 
        onClick={() => setShowDump(true)}
        className="absolute top-10 right-10 flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <FaBrain /> Mind Dump
      </button>

      {/* Main Timer */}
      <motion.div 
        initial={{ scale: 0.8 }} 
        animate={{ scale: 1 }} 
        className="w-80 h-80 md:w-96 md:h-96 relative z-10"
      >
        <CircularProgressbar
          value={percentage}
          text={`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`}
          styles={buildStyles({
            textColor: "#fff",
            pathColor: isActive ? "#ec4899" : "#3b82f6",
            trailColor: "#1e293b",
            pathTransitionDuration: 0.5,
          })}
        />
      </motion.div>
      
      <div className="flex gap-4 mt-8 z-10">
        <button 
          onClick={toggleTimer}
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-xl font-bold shadow-lg hover:shadow-cyan-500/50 transition-all"
        >
          {isActive ? "PAUSE SYSTEM" : "INITIATE FOCUS"}
        </button>
      </div>

      {/* Mind Dump Modal */}
      <AnimatePresence>
        {showDump && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-lg border border-slate-700">
              <h3 className="text-2xl font-bold mb-4">Clear Your Mind</h3>
              <p className="text-slate-400 mb-4">Write down what's distracting you so you can let it go and focus.</p>
              <textarea 
                id="dumpInput"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white h-32 mb-4 focus:border-cyan-500 outline-none"
                placeholder="I need to remember to..."
                autoFocus
              ></textarea>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDump(false)}
                  className="flex-1 py-3 text-slate-400 hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => addDistraction(document.getElementById('dumpInput').value)}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold"
                >
                  Save & Return to Focus
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}