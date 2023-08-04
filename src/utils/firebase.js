// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAiCf7EqoiLdWUgdYXomjGUV0Jnm4yfaxQ",
  authDomain: "chaton-c2955.firebaseapp.com",
  projectId: "chaton-c2955",
  storageBucket: "chaton-c2955.appspot.com",
  messagingSenderId: "853540675474",
  appId: "1:853540675474:web:bfd3af84c94244c2e5eb4b",
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

export { db, auth, storage, provider };
