// Firebase configuration and initialization

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDTSYkYPJ4x094A9rJpINRQIK4sO2cVo5w",
  authDomain: "smart-budget-tracker-7ecc5.firebaseapp.com",
  projectId: "smart-budget-tracker-7ecc5",
  storageBucket: "smart-budget-tracker-7ecc5.appspot.com",
  messagingSenderId: "552347010182",
  appId: "1:552347010182:web:87b3ce50a6db666852bd07",
  measurementId: "G-8T2MSJ6PJ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, db, analytics, auth };
