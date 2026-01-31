// hooks/useKanban.js
import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

const INITIAL_DATA = {
  tasks: {},
  columns: {
    "col-1": { id: "col-1", title: "To Do", taskIds: [] },
    "col-2": { id: "col-2", title: "In Progress", taskIds: [] },
    "col-3": { id: "col-3", title: "Done", taskIds: [] },
  },
  columnOrder: ["col-1", "col-2", "col-3"],
};

export const useKanban = () => {
  const [user] = useAuthState(auth);
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(true);

  // Load Board
  useEffect(() => {
    if (!user) return;
    const fetchBoard = async () => {
      const docRef = doc(db, "kanban", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setData(docSnap.data());
      } else {
        // Create default board for new user
        await setDoc(docRef, INITIAL_DATA);
        setData(INITIAL_DATA);
      }
      setLoading(false);
    };
    fetchBoard();
  }, [user]);

  // Save Board (Call this whenever you drag/drop/add)
  const saveBoard = async (newData) => {
    setData(newData); // Optimistic update (instant UI)
    if (user) {
      await setDoc(doc(db, "kanban", user.uid), newData); // Background save
    }
  };

  return { data, saveBoard, loading };
};