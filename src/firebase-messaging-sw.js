importScripts(
  "https://www.gstatic.com/firebasejs/9.8.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.8.1/firebase-messaging-compat.js"
);
firebase.initializeApp({
  apiKey: "AIzaSyDTC45k_PijCnJSWPHdZbz4Yv-kWSh9jAE",
  authDomain: "e-board-fcm.firebaseapp.com",
  projectId: "e-board-fcm",
  storageBucket: "e-board-fcm.appspot.com",
  messagingSenderId: "908141884479",
  appId: "1:908141884479:web:b3947f1eb4599161ebb48a",
  measurementId: "G-PGP89RN7M8",
});
const messaging = firebase.messaging();
