// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  // PASTE YOUR CONFIG KEYS HERE FROM FIREBASE CONSOLE
  apiKey: "AIzaSyAsXYR16fX3nmAxOYiHPPnWj2dKB_oNlOA",
  authDomain: "study-helper-jachu.firebaseapp.com",
  projectId: "study-helper-jachu",
  storageBucket: "study-helper-jachu.firebasestorage.app",
  messagingSenderId: "321256478169",
  appId: "1:321256478169:web:ff75ddcfecb9aca35675c8",
  measurementId: "G-LP5ZC8JKK2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, { 
        vapidKey: "BG2BdbByMtSqwXKIL3yOc5ixruxDEQiy6PVXpunjCBggxdLLpLXd7LbhVvGCvpOht6deBfs_u4pjuZTZoY_24uc" 
      });
      console.log("FCM Token:", token);
      return token;
    }
  } catch (error) {
    console.error("Notification permission error:", error);
  }
};