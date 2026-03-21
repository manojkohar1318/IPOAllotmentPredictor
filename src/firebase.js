import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set, update, runTransaction, onValue, remove, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY",
  authDomain: "nepse-ipo-allotment-predictor.firebaseapp.com",
  databaseURL: "https://nepse-ipo-allotment-predictor-default-rtdb.firebaseio.com",
  projectId: "nepse-ipo-allotment-predictor",
  storageBucket: "nepse-ipo-allotment-predictor.appspot.com",
  messagingSenderId: "555483978707",
  appId: "1:555483978707:web:e9f6908604608f34592d26"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, push, set, update, runTransaction, onValue, remove, get };
