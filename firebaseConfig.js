/**
 * Firebase Configuration
 * 
 * Initializes Firebase app and Firestore database connection.
 * These configuration values are safe to be public - they identify
 * your Firebase project but don't provide write access by themselves.
 * 
 * Security is handled by Firestore rules (allows public read/write currently)
 * and client-side password verification for edit operations.
 * 
 * @author iwrsu
 * Status: Website works for now
 */

// Import Firebase modules - using v10 modular SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZoWEkvbT_NhIOoEye8dZA4fbrCc4VbUk",
  authDomain: "dashboard-1b866.firebaseapp.com",
  projectId: "dashboard-1b866",
  storageBucket: "dashboard-1b866.firebasestorage.app",
  messagingSenderId: "245705220261",
  appId: "1:245705220261:web:91c26c131c699dcbe26d4c",
  measurementId: "G-0P1C6TXHSG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);