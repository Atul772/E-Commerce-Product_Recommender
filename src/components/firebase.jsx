// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyvPNPWFDa0iItgzHaxktJHkt2F5l6oHI",
  authDomain: "e-commerce-product-recommender.firebaseapp.com",
  projectId: "e-commerce-product-recommender",
  storageBucket: "e-commerce-product-recommender.firebasestorage.app",
  messagingSenderId: "58984037945",
  appId: "1:58984037945:web:a138f106a7857a93f957e8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore(app);