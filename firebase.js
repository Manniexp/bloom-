// This file is used to initialize Firebase and export the necessary modules for authentication, Firestore database, and Storage access.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";


// Firebase configuration 
const firebaseConfig = {
    apiKey: "AIzaSyABj3T2qfFwOY2dKSYm_KRBrt3pX-VkAj4",
    authDomain: "bloom-d654e.firebaseapp.com",
    projectId: "bloom-d654e",
    storageBucket: "bloom-d654e.firebasestorage.app",
    messagingSenderId: "265771304302",
    appId: "1:265771304302:web:3c957f489b8afc78f96d7f",
    measurementId: "G-N5DQLXE8SC"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


// Export the initialized Firebase modules for use in other parts of the application
export { auth, db, storage };