// SDK
import { initializeApp } from "firebase/app";
import { getAnalytics, setAnalyticsCollectionEnabled } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


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
setAnalyticsCollectionEnabled(analytics, false);
export const db = getFirestore(app);






