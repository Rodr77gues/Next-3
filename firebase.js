// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔧 SUA CONFIG DO FIREBASE
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

// Função chamada pelo botão "Salvar e entrar"
async function handleLogin() {
  const nome = document.getElementById("login-nome").value.trim();
  const email = document.getElementById("login-email").value.trim();

  if (!nome || !email) {
    alert("Preencha nome e e-mail");
    return;
  }

  const senha = "123456"; // temporária só pra testar

  try {
    // tenta cadastrar
    await createUserWithEmailAndPassword(auth, email, senha);
    window.entrarNoApp(nome);
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      // se já existe, faz login
      try {
        await signInWithEmailAndPassword(auth, email, senha);
        window.entrarNoApp(nome);
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert(error.message);
    }
  }
}

// expõe para o HTML
window.login = handleLogin;

window.logout = async function () {
  try {
    await signOut(auth);
  } finally {
    location.reload();
  }
};
