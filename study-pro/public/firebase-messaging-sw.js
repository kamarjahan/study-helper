// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  // PASTE YOUR FIREBASE CONFIG HERE AGAIN (Must match lib/firebase.js)
  apiKey: "AIzaSyAsXYR16fX3nmAxOYiHPPnWj2dKB_oNlOA",
  authDomain: "study-helper-jachu.firebaseapp.com",
  projectId: "study-helper-jachu",
  storageBucket: "study-helper-jachu.firebasestorage.app",
  messagingSenderId: "321256478169",
  appId: "1:321256478169:web:ff75ddcfecb9aca35675c8",
  measurementId: "G-LP5ZC8JKK2"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png' // Make sure you have an icon in public/
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});