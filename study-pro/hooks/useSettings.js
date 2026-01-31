// hooks/useSettings.js
import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

const DEFAULT_SETTINGS = {
  focusDuration: 25, // minutes
  shortBreak: 5,
  longBreak: 15,
  emergencyEmail: "", // For the safety alarm
  theme: "dark"
};

export const useSettings = () => {
  const [user] = useAuthState(auth);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchSettings = async () => {
      const ref = doc(db, "settings", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setSettings(snap.data());
      setLoading(false);
    };
    fetchSettings();
  }, [user]);

  const updateSettings = async (newSettings) => {
    setSettings(newSettings); // Optimistic update
    if (user) {
      await setDoc(doc(db, "settings", user.uid), newSettings);
    }
  };

  return { settings, updateSettings, loading };
};