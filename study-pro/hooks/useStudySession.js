// hooks/useStudySession.js
import { db, auth } from "../lib/firebase";
import { collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export const useStudySession = () => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);

  // Updated saveSession to accept 'distractions'
  const saveSession = async (durationInSeconds, subject = "General", distractions = []) => {
    if (!user) return;
    setLoading(true);
    
    try {
      await addDoc(collection(db, "sessions"), {
        uid: user.uid,
        duration: durationInSeconds,
        subject: subject,
        date: Timestamp.now(),
        type: "focus",
        // SAVE DISTRACTIONS HERE
        distractions: distractions 
      });
      console.log("Session & Mind Dump saved!");
    } catch (error) {
      console.error("Error saving session:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStats = async (daysLookback = 30) => {
    if (!user) return [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysLookback);

    const q = query(
      collection(db, "sessions"),
      where("uid", "==", user.uid),
      where("date", ">=", startDate)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  };

  return { saveSession, getStats, loading };
};