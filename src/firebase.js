import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKg7a3KIK1451fkl-uRayY-mWUcwz25l8",
  authDomain: "to-do-list-5c5ca.firebaseapp.com",
  projectId: "to-do-list-5c5ca",
  storageBucket: "to-do-list-5c5ca.appspot.com",
  messagingSenderId: "212433659034",
  appId: "1:212433659034:web:5d98d08b77072d097e6b23",
  measurementId: "G-ZGCX4R9KTW",
  databaseURL: "https://to-do-list-5c5ca-default-rtdb.firebaseio.com/",
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
