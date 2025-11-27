// js/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCEtq-uC5EfUAIseO7dEPL5QEfoZLYaSgU",
  authDomain: "nextstop-a15ad.firebaseapp.com",
  projectId: "nextstop-a15ad",
  storageBucket: "nextstop-a15ad.firebasestorage.app",
  messagingSenderId: "340141470022",
  appId: "1:340141470022:web:8de279a702cc25827f7547"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.login = async function () {
  const nome = document.getElementById("login-nome").value;
  const email = document.getElementById("login-email").value;

  if (!nome || !email) {
    alert("Preencha nome e e-mail");
    return;
  }

  const senha = "123456"; // senha temporária

  try {
    await createUserWithEmailAndPassword(auth, email, senha);
    entrarNoApp(nome);
  } 
  catch (error) {

    if (error.code === "auth/email-already-in-use") {
      try {
        await signInWithEmailAndPassword(auth, email, senha);
        entrarNoApp(nome);
      } catch (err) {
        alert(err.message);
      }

    } else {
      alert(error.message);
    }
  }
};

function entrarNoApp(nome) {
  document.getElementById("welcome-screen").classList.remove("active");
  document.getElementById("login-screen").classList.remove("active");
  document.getElementById("app-screen").classList.add("active");

  document.getElementById("top-user").innerText = nome;
}

window.logout = function () {
  location.reload();
};
