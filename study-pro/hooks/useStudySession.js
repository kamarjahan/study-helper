// hooks/useStudySession.js
import { db, auth } from "../lib/firebase";
import { collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth"; // You might need to install this: npm install react-firebase-hooks

export const useStudySession = () => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);

  // 1. SAVE A SESSION
  const saveSession = async (durationInSeconds, subject = "General") => {
    if (!user) return;
    setLoading(true);
    
    try {
      await addDoc(collection(db, "sessions"), {
        uid: user.uid,
        duration: durationInSeconds,
        subject: subject,
        date: Timestamp.now(), // Firestore timestamp
        type: "focus" // or 'break'
      });
      console.log("Session saved!");
    } catch (error) {
      console.error("Error saving session:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. FETCH STATS (e.g., for 'Today' or 'Last 30 Days')
  const getStats = async (daysLookback = 30) => {
    if (!user) return [];
    
    // Calculate the start date
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