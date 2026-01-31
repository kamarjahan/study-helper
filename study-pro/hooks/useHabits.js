// hooks/useHabits.js
import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { 
  collection, addDoc, deleteDoc, doc, updateDoc, 
  onSnapshot, query, where 
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

export const useHabits = () => {
  const [user] = useAuthState(auth);
  const [habits, setHabits] = useState([]);

  // REAL-TIME LISTENER
  // This automatically updates the UI when data changes in the DB
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "habits"), where("uid", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHabits(habitsData);
    });

    return () => unsubscribe();
  }, [user]);

  // ADD HABIT
  const addHabit = async (title, frequency = "daily") => {
    await addDoc(collection(db, "habits"), {
      uid: user.uid,
      title,
      completedToday: false,
      streak: 0,
      frequency
    });
  };

  // TOGGLE COMPLETE
  const toggleHabit = async (habitId, currentStatus) => {
    const habitRef = doc(db, "habits", habitId);
    await updateDoc(habitRef, {
      completedToday: !currentStatus,
      // Simple logic: increment streak if marking true
      streak: !currentStatus ? 1 : 0 // *Logic can be improved for advanced streak calc*
    });
  };

  // DELETE HABIT
  const deleteHabit = async (habitId) => {
    await deleteDoc(doc(db, "habits", habitId));
  };

  return { habits, addHabit, toggleHabit, deleteHabit };
};