"use client";
import { useState } from "react";
import emailjs from "emailjs-com";
import { useSettings } from "@/hooks/useSettings"; // Import Settings

export default function AlarmPage() {
  const { settings } = useSettings(); // Get Settings
  const [isRinging, setIsRinging] = useState(false);
  const [mathProblem, setMathProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");

  const triggerAlarm = () => {
    setIsRinging(true);
    // ... (Math logic) ...
    const a = Math.floor(Math.random() * 50);
    const b = Math.floor(Math.random() * 50);
    setMathProblem({ q: `${a} + ${b}`, a: a + b });
    
    // START FAIL-SAFE TIMER
    setTimeout(() => {
      // CHECK IF RINGING AND EMAIL EXISTS
      if (isRinging && settings?.emergencyEmail) {
        sendEmergencyEmail(settings.emergencyEmail);
      }
    }, 5 * 60 * 1000); // 5 Minutes
  };

  const sendEmergencyEmail = (targetEmail) => {
    // NOTE: Replace these with your actual EmailJS Service keys
    emailjs.send(
      "Study-Helper", 
      "template_2d6pduo", 
      {
        to_email: targetEmail,
        message: "URGENT: User failed to wake up to their alarm!",
      }, 
      "2iAO2hcDv-c-ulN4W"
    ).then(() => {
      console.log("Emergency Email Sent");
    });
  };

  const verifyAnswer = () => {
    if (parseInt(userAnswer) === mathProblem.a) {
      setIsRinging(false);
      alert("Good morning! Alarm stopped.");
    } else {
      alert("Wrong! Try again.");
    }
  };

  return (
    <div className="p-10 bg-slate-900 min-h-screen text-white">
      {isRinging && (
        <div className="fixed inset-0 bg-red-600/90 z-50 flex flex-col items-center justify-center">
          <h1 className="text-6xl font-black mb-8 animate-pulse">WAKE UP!</h1>
          <div className="bg-slate-800 p-8 rounded-xl">
            <p className="text-2xl mb-4">Solve to stop: {mathProblem?.q}</p>
            <input 
              type="number" 
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="text-black text-2xl p-2 rounded w-full mb-4"
            />
            <button onClick={verifyAnswer} className="w-full bg-white text-red-600 font-bold py-3 rounded">
              STOP ALARM
            </button>
          </div>
        </div>
      )}
      <button onClick={triggerAlarm} className="bg-blue-600 px-6 py-2 rounded">Test Alarm</button>
    </div>
  );
}