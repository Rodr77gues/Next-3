// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEtq-uC5EfUAIseO7dEPL5QEfoZLYaSgU",
  authDomain: "nextstop-a15ad.firebaseapp.com",
  projectId: "nextstop-a15ad",
  storageBucket: "nextstop-a15ad.firebasestorage.app",
  messagingSenderId: "340141470022",
  appId: "1:340141470022:web:8de279a702cc25827f7547"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
