import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAPCbxwhw_C4kSkCA8pABUOnYuvRgHYBoY",
    authDomain: "buildtrack-a7fca.firebaseapp.com",
    projectId: "buildtrack-a7fca",
    storageBucket: "buildtrack-a7fca.firebasestorage.app",
    messagingSenderId: "544257319732",
    appId: "1:544257319732:web:6ccd6715a6ee75d1ec7b61",
    measurementId: "G-3DZNGRZBFJ"
};

// Initialize Firebase (singleton pattern to avoid re-initialization)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
