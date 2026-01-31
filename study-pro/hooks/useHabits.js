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
  const [loading, setLoading] = useState(true);

  // REAL-TIME LISTENER
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "habits"), where("uid", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHabits(habitsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // ADD HABIT (With Time)
  const addHabit = async (title, time = "") => {
    if (!user) return;
    await addDoc(collection(db, "habits"), {
      uid: user.uid,
      title,
      time, // e.g. "14:30"
      completedToday: false,
      streak: 0
    });
  };

  // EDIT HABIT
  const updateHabit = async (id, newTitle, newTime) => {
    const ref = doc(db, "habits", id);
    await updateDoc(ref, { title: newTitle, time: newTime });
  };

  // TOGGLE COMPLETE
  const toggleHabit = async (habitId, currentStatus) => {
    const habitRef = doc(db, "habits", habitId);
    await updateDoc(habitRef, {
      completedToday: !currentStatus,
      streak: !currentStatus ? 1 : 0 
    });
  };

  // DELETE HABIT
  const deleteHabit = async (habitId) => {
    await deleteDoc(doc(db, "habits", habitId));
  };

  return { habits, addHabit, updateHabit, toggleHabit, deleteHabit, loading };
};