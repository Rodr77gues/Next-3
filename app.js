// app.js - NextStop (corrigido, sem travar splash)

// ================= IMPORTS (TEM QUE SER PRIMEIRO) =================

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ================= SPLASH =================

window.addEventListener("load", () => {
  const splash = document.getElementById("splash");

  setTimeout(() => {
    if (splash) splash.style.display = "none";

    document
      .getElementById("welcome-screen")
      ?.classList.remove("hidden");

  }, 2000);
});

// ================= FIREBASE =================

const auth = getAuth();
const db = getFirestore();

let currentUser = null;
let currentUserProfile = null;

// ================= NAVEGAÇÃO =================

const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav-item");

function setActiveScreen(id) {
  screens.forEach((s) => s.classList.remove("screen-active"));
  const active = document.getElementById(`screen-${id}`);
  if (active) active.classList.add("screen-active");
}

// ================= ENTRAR NO APP =================

window.entrarNoApp = function (nome) {
  document.body.classList.add("logged");

  setActiveScreen("home");

  const welcomeName = document.getElementById("welcomeName");
  if (welcomeName) welcomeName.textContent = nome;
};

// ================= PERFIL =================

const inputName = document.getElementById("inputName");
const inputBio = document.getElementById("inputBio");
const inputArea = document.getElementById("inputArea");
const profileForm = document.getElementById("profileForm");

async function loadCurrentUserProfile() {
  if (!currentUser) return;

  const ref = doc(db, "users", currentUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    currentUserProfile = snap.data();
  } else {
    currentUserProfile = null;
  }

  if (currentUserProfile) {
    if (inputName) inputName.value = currentUserProfile.nome || "";
    if (inputBio) inputBio.value = currentUserProfile.bio || "";
    if (inputArea && currentUserProfile.areaInteresse) {
      inputArea.value = currentUserProfile.areaInteresse;
    }
  }
}

async function saveProfile(e) {
  e?.preventDefault();
  if (!currentUser) return;

  const nome = inputName?.value.trim() || "Usuário";
  const bio = inputBio?.value.trim() || "";
  const area = inputArea?.value || "networking";

  const ref = doc(db, "users", currentUser.uid);
  await setDoc(
    ref,
    {
      uid: currentUser.uid,
      nome,
      bio,
      areaInteresse: area,
      email: currentUser.email,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  alert("Perfil atualizado com sucesso!");
}

if (profileForm) {
  profileForm.addEventListener("submit", saveProfile);
}

// ================= DISCOVER / MATCH =================

const matchesList = document.getElementById("matches-list");
const chatList = document.getElementById("chat-list");

let feedProfiles = [];
let feedIndex = 0;

async function loadFeed() {
  if (!currentUser) return;

  const q = query(
    collection(db, "users"),
    where("uid", "!=", currentUser.uid)
  );

  const snap = await getDocs(q);
  feedProfiles = [];

  snap.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.nome) feedProfiles.push(data);
  });

  feedIndex = 0;
}

// ================= MATCH LIST =================

async function renderMatchesSnapshot(snapshot) {
  if (!chatList) return;

  if (snapshot.empty) {
    chatList.innerHTML = "<p>Nenhum match ainda.</p>";
    return;
  }

  chatList.innerHTML = "";

  for (const docSnap of snapshot.docs) {
    const match = docSnap.data();
    const otherUid = match.users.find(
      (u) => u !== currentUser.uid
    );

    if (!otherUid) continue;

    const userSnap = await getDoc(doc(db, "users", otherUid));
    const user = userSnap.data();

    const div = document.createElement("div");
    div.className = "chat-item";
    div.innerHTML = `
      <strong>${user?.nome || "Usuário"}</strong><br>
      <small>Nova conexão no NextStop</small>
    `;

    chatList.appendChild(div);
  }
}

function listenMatches() {
  if (!currentUser) return;

  const matchesRef = collection(db, "matches");
  const q = query(
    matchesRef,
    where("users", "array-contains", currentUser.uid),
    orderBy("updatedAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    renderMatchesSnapshot(snapshot);
  });
}

// ================= AUTH STATE =================

onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  if (user) {
    await loadCurrentUserProfile();
    await loadFeed();
    listenMatches();
  }
});

console.log("✅ NextStop carregado com sucesso");
// ================= TELAS DE LOGIN =================

window.showLogin = function () {
  document.getElementById("welcome-screen")?.classList.add("hidden");
  document.getElementById("login-screen")?.classList.remove("hidden");
};

window.showWelcome = function () {
  document.getElementById("login-screen")?.classList.add("hidden");
  document.getElementById("welcome-screen")?.classList.remove("hidden");
};

