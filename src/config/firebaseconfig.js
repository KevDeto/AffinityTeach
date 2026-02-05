// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB1jt4I1rde30Bu7xh65ypW--UQE0iWAdk",
  authDomain: "affinityteach.firebaseapp.com",
  projectId: "affinityteach",
  storageBucket: "affinityteach.firebasestorage.app",
  messagingSenderId: "42045134258",
  appId: "1:42045134258:web:158658dbfe02d0775000ab",
  measurementId: "G-G7J1DG6JVZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth();
const db = getFirestore();
export {auth, db}