// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCcPsk71yG8F3Dx7qvGpy_pX559ua7wiew",
  authDomain: "taskmanagerapp-c841e.firebaseapp.com",
  projectId: "taskmanagerapp-c841e",
  storageBucket: "taskmanagerapp-c841e.firebasestorage.app",
  messagingSenderId: "360811012585",
  appId: "1:360811012585:web:e3cd8e1e35f42a68d2eb78",
  measurementId: "G-CWC6YZDLG8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);