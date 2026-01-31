// components/NotificationInit.js
"use client";
import { useEffect } from "react";
import { requestNotificationPermission } from "@/lib/firebase"; // Ensure this path is correct

export default function NotificationInit() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
       // Register the worker
       navigator.serviceWorker.register('/firebase-messaging-sw.js')
       .then((registration) => {
         console.log('Service Worker Registered with scope:', registration.scope);
       })
       .catch((err) => {
         console.error('Service Worker registration failed:', err);
       });

       // Request permission (Optional: you can move this to a button if you prefer)
       requestNotificationPermission();
    }
  }, []);

  return null; // This component doesn't render anything visible
}