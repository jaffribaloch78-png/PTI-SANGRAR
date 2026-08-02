// ============================================================
// FIREBASE CONFIG — pti-sangrar-community (live project)
//
// These values are safe to be public/client-side — this is
// normal for Firebase web apps. Real security comes from
// firebase/firestore.rules and firebase/storage.rules, NOT from
// hiding this file. Make sure both are deployed — see README.md.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCqW-PA4N3lRACSq3R7nqt5JwlXdUlsuKk",
  authDomain: "pti-sangrar-community.firebaseapp.com",
  projectId: "pti-sangrar-community",
  storageBucket: "pti-sangrar-community.firebasestorage.app",
  messagingSenderId: "800055825281",
  appId: "1:800055825281:web:67e40922170cf82ce38e80"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
