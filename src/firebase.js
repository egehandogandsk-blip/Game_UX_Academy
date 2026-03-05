// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// IMPORTANT: For Google Authentication to work, ensure the following domains are authorized in Firebase Console:
// - Firebase Console > Authentication > Settings > Authorized domains
// - Required domains: localhost, gameuxacademy.com
const firebaseConfig = {
    apiKey: "AIzaSyDq8AsbLQtVsjOOMn7746twZEHqgu_kAP0",
    authDomain: "gdabridge.firebaseapp.com",
    projectId: "gdabridge",
    storageBucket: "gdabridge.firebasestorage.app",
    messagingSenderId: "1057537715835",
    appId: "1:1057537715835:web:8e30dc78ba23c236babcde",
    measurementId: "G-RM8SKFDBQF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);
