// firebase.js - NEXTSTOP (PROFISSIONAL)

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

// 🔧 COLE AQUI SUA CONFIG REAL DO FIREBASE
const firebaseConfig = {
  apiKey: "COLE_AQUI",
  authDomain: "COLE_AQUI",
  projectId: "COLE_AQUI",
  storageBucket: "COLE_AQUI",
  messagingSenderId: "COLE_AQUI",
  appId: "COLE_AQUI"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ================================
// Login com EMAIL + SENHA
// ================================
window.loginEmail = async function () {
  const nome = document.getElementById("login-nome").value.trim();
  const email = document.getElementById("login-email").value.trim();
  const senha = document.getElementById("login-senha").value.trim();

  if (!nome || !email || !senha) {
    alert("Preencha todos os campos");
    return;
  }

  try {
    // tenta cadastrar
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);

    await salvarPerfil(userCredential.user.uid, nome, email);

    window.entrarNoApp(nome);

  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      try {
        // se já existir, faz login
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);

        const nomeSalvo = await buscarNome(userCredential.user.uid);

        window.entrarNoApp(nomeSalvo || "Usuário");

      } catch (err) {
        alert("Senha incorreta");
      }
    } else {
      alert(error.message);
    }
  }
};

// ================================
// Login com GOOGLE
// ================================
window.loginGoogle = async function () {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await salvarPerfil(user.uid, user.displayName || "Usuário", user.email);

    window.entrarNoApp(user.displayName || "Usuário");

  } catch (error) {
    alert(error.message);
  }
};

// ================================
// Salvar perfil no Firestore
// ================================
async function salvarPerfil(uid, nome, email) {
  const ref = doc(db, "users", uid);

  await setDoc(ref, {
    nome,
    email,
    createdAt: serverTimestamp()
  }, { merge: true });
}

// ================================
// Buscar nome salvo
// ================================
async function buscarNome(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data().nome;
  }

  return null;
}

// ================================
// Logout
// ================================
window.logout = async function () {
  await signOut(auth);
  location.reload();
};
