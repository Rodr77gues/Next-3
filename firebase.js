
// firebase.js - NextStop

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔧 COLE SUA CONFIG REAL AQUI
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
const db = getFirestore(app);

// -----------------------------
// Funções auxiliares de perfil
// -----------------------------
async function salvarPerfilBasico(uid, nome, email) {
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      nome,
      email,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

async function buscarNome(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data().nome;
  return null;
}

// ================================
// LOGIN COM E-MAIL + SENHA
// ================================
window.loginEmail = async function () {
  const nome = document.getElementById("login-nome")?.value.trim();
  const email = document.getElementById("login-email")?.value.trim();
  const senha = document.getElementById("login-senha")?.value.trim();

  if (!nome || !email || !senha) {
    alert("Preencha nome, e-mail e senha");
    return;
  }

  try {
    // tenta cadastro
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    await salvarPerfilBasico(cred.user.uid, nome, email);
    window.entrarNoApp(nome);
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, senha);
        const nomeSalvo = await buscarNome(cred.user.uid);
        window.entrarNoApp(nomeSalvo || nome || "Usuário");
      } catch (err) {
        alert("Senha incorreta ou erro ao entrar.");
      }
    } else {
      alert(error.message);
    }
  }
};

// ================================
// LOGIN COM GOOGLE
// ================================
window.loginGoogle = async function () {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    await salvarPerfilBasico(
      user.uid,
      user.displayName || "Usuário",
      user.email
    );
    window.entrarNoApp(user.displayName || "Usuário");
  } catch (error) {
    alert(error.message);
  }
};

// ================================
// LOGOUT
// ================================
window.logout = async function () {
  await signOut(auth);
  location.reload();
};

// Deixo auth e db disponíveis para outros arquivos (como app.js)
window._nextstop_auth = auth;
window._nextstop_db = db;
