// js/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "XXXXXXXX",
  appId: "XXXXXXXX"
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
