// hooks/useStudySession.js
import { db, auth } from "../lib/firebase";
import { collection, addDoc, query, where, getDocs, Timestamp, orderBy } from "firebase/firestore";
import { useState, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export const useStudySession = () => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);

  // 1. SAVE SESSION (Now includes Email)
  const saveSession = async (durationInSeconds, subject = "General", distractions = []) => {
    if (!user) return;
    setLoading(true);
    
    try {
      await addDoc(collection(db, "sessions"), {
        uid: user.uid,
        email: user.email, // Saved for record keeping
        duration: durationInSeconds,
        subject: subject,
        date: Timestamp.now(),
        type: "focus",
        distractions: distractions 
      });
      console.log("Session Saved for:", user.email);
    } catch (error) {
      console.error("Error saving session:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. GET STATS (Flexible Range)
  const getStats = useCallback(async (startDate, endDate) => {
    if (!user) return [];
    
    // Ensure dates are Firestore compatible (Start of day to End of day)
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    try {
      const q = query(
        collection(db, "sessions"),
        where("uid", "==", user.uid),
        where("date", ">=", start),
        where("date", "<=", end),
        orderBy("date", "asc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Error fetching stats:", err);
      return [];
    }
  }, [user]);

  return { saveSession, getStats, loading };
};