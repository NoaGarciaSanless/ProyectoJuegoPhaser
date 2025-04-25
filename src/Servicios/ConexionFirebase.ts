// SDK
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBgpxr1Sp4xG0La304X-XDnL0hnkQU3dEk",
    authDomain: "juegoporturnosdaw.firebaseapp.com",
    projectId: "juegoporturnosdaw",
    storageBucket: "juegoporturnosdaw.firebasestorage.app",
    messagingSenderId: "192905461865",
    appId: "1:192905461865:web:1811db7287c21a958d22f8",
    measurementId: "G-DN9201FB0S"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const analytics = getAnalytics(app);
export const db = getFirestore(app);


