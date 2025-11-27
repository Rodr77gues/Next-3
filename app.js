// REMOVE SPLASH SCREEN
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");

  setTimeout(() => {
    if (splash) splash.style.display = "none";
    document.getElementById("welcome-screen")?.classList.remove("hidden");
  }, 2000);
});

// app.js - NextStop (frontend + Firestore básico)

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

// Reaproveita app já inicializado em firebase.js
const auth = getAuth();
const db = getFirestore();

let currentUser = null;
let currentUserProfile = null;

// -----------------------------
// NAVEGAÇÃO ENTRE TELAS
// -----------------------------
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav-item");

function setActiveScreen(id) {
  screens.forEach((s) => s.classList.remove("screen-active"));
  const active = document.getElementById(`screen-${id}`);
  if (active) active.classList.add("screen-active");

  navButtons.forEach((btn) => btn.classList.remove("nav-active"));
  navButtons.forEach((btn) => {
    if (btn.dataset.screen === id) btn.classList.add("nav-active");
  });
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const screen = btn.dataset.screen;
    setActiveScreen(screen);
  });
});

// -----------------------------
// ENTRAR NO APP (chamado pelo firebase.js)
// -----------------------------
window.entrarNoApp = function (nome) {
  document.body.classList.add("logged");
  // se você tiver um container de login, pode esconder aqui:
  const loginContainer = document.getElementById("login-container");
  const appShell = document.querySelector(".app-shell");
  if (loginContainer) loginContainer.style.display = "none";
  if (appShell) appShell.style.display = "flex";

  setActiveScreen("home");

  const welcomeName = document.getElementById("welcomeName");
  if (welcomeName) welcomeName.textContent = nome;
};

// -----------------------------
// PERFIL DO USUÁRIO
// -----------------------------
const inputName = document.getElementById("inputName");
const inputBio = document.getElementById("inputBio");
const inputArea = document.getElementById("inputArea");
const profileForm = document.getElementById("profileForm");
const avatarPreview = document.getElementById("avatarPreview");

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
      cidade: currentUserProfile?.cidade || "",
      createdAt: currentUserProfile?.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  // feedback visual simples
  if (avatarPreview) {
    avatarPreview.style.transform = "scale(1.03)";
    setTimeout(() => (avatarPreview.style.transform = ""), 120);
  }

  alert("Perfil atualizado com sucesso!");
}

if (profileForm) {
  profileForm.addEventListener("submit", saveProfile);
}

// -----------------------------
// EXPLORAR (PERFIS + LIKE / MATCH)
// -----------------------------
const profileCard = document.getElementById("profileCard");
const profileTag = document.getElementById("profileTag");
const profileLocation = document.getElementById("profileLocation");
const profileName = document.getElementById("profileName");
const profileRole = document.getElementById("profileRole");
const profileBio = document.getElementById("profileBio");
const profileInterests = document.getElementById("profileInterests");
const btnLike = document.getElementById("btnLike");
const btnDislike = document.getElementById("btnDislike");

let feedProfiles = [];
let feedIndex = 0;

async function loadFeed() {
  if (!currentUser) return;

  // regra simples: todos os outros usuários
  const q = query(
    collection(db, "users"),
    where("uid", "!=", currentUser.uid)
  );

  const snap = await getDocs(q);
  feedProfiles = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    // ignora se não tem nome
    if (data.nome) feedProfiles.push(data);
  });

  feedIndex = 0;
  renderCurrentProfile();
}

function renderCurrentProfile() {
  if (!profileCard) return;

  if (feedProfiles.length === 0 || feedIndex >= feedProfiles.length) {
    profileName.textContent = "Por hoje é isso!";
    profileRole.textContent = "Não há mais perfis para sugerir.";
    profileBio.textContent = "Volte mais tarde para encontrar novas conexões.";
    if (profileInterests) profileInterests.innerHTML = "";
    if (profileTag) profileTag.textContent = "Fim";
    if (profileLocation) profileLocation.textContent = "Brasil";
    return;
  }

  const p = feedProfiles[feedIndex];

  if (profileTag) profileTag.textContent = p.areaInteresse || "Networking";
  if (profileLocation)
    profileLocation.textContent = p.cidade ? p.cidade : "Local não informado";
  if (profileName) profileName.textContent = p.nome || "Usuário";
  if (profileRole) profileRole.textContent = p.areaInteresse || "Conexões";
  if (profileBio)
    profileBio.textContent =
      p.bio || "Ainda não escreveu uma bio, mas parece interessante.";

  if (profileInterests) {
    profileInterests.innerHTML = "";
    const tags = (p.tags || ["NextStop", "Conexões", "SP"]).slice(0, 4);
    tags.forEach((t) => {
      const span = document.createElement("span");
      span.className = "chip chip-soft";
      span.textContent = t;
      profileInterests.appendChild(span);
    });
  }

  profileCard.style.transform = "translateY(4px) scale(0.98)";
  profileCard.style.opacity = "0.7";
  setTimeout(() => {
    profileCard.style.transform = "";
    profileCard.style.opacity = "1";
  }, 120);
}

async function registerLike(targetUid, liked) {
  if (!currentUser || !targetUid) return;

  if (!liked) return; // por enquanto só registra likes

  const likesRef = collection(db, "likes");

  // registra like
  await addDoc(likesRef, {
    from: currentUser.uid,
    to: targetUid,
    createdAt: serverTimestamp()
  });

  // verifica se o outro já deu like em você
  const reciprocalQ = query(
    likesRef,
    where("from", "==", targetUid),
    where("to", "==", currentUser.uid)
  );
  const snap = await getDocs(reciprocalQ);

  if (!snap.empty) {
    // cria match
    const matchId =
      currentUser.uid < targetUid
        ? `${currentUser.uid}_${targetUid}`
        : `${targetUid}_${currentUser.uid}`;

    const matchRef = doc(db, "matches", matchId);
    await setDoc(
      matchRef,
      {
        users: [currentUser.uid, targetUid],
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      },
      { merge: true }
    );

    alert("🚀 Novo match no NextStop!");
  }
}

function handleSwipe(liked) {
  if (feedProfiles.length === 0 || feedIndex >= feedProfiles.length) return;

  const target = feedProfiles[feedIndex];
  registerLike(target.uid, liked);

  feedIndex++;
  renderCurrentProfile();
}

if (btnLike) btnLike.addEventListener("click", () => handleSwipe(true));
if (btnDislike) btnDislike.addEventListener("click", () => handleSwipe(false));

// toque arrastando (efeito visual)
let dragStartX = null;

if (profileCard) {
  profileCard.addEventListener("touchstart", (e) => {
    dragStartX = e.touches[0].clientX;
  });

  profileCard.addEventListener("touchmove", (e) => {
    if (dragStartX === null) return;
    const currentX = e.touches[0].clientX;
    const delta = currentX - dragStartX;
    profileCard.style.transform = `translateX(${delta * 0.3}px) rotate(${
      delta * 0.04
    }deg)`;
    profileCard.style.opacity = `${Math.max(
      0.4,
      1 - Math.abs(delta) / 260
    )}`;
  });

  profileCard.addEventListener("touchend", (e) => {
    if (dragStartX === null) return;
    const endX = e.changedTouches[0].clientX;
    const delta = endX - dragStartX;

    if (delta > 80) {
      handleSwipe(true);
    } else if (delta < -80) {
      handleSwipe(false);
    } else {
      profileCard.style.transform = "";
      profileCard.style.opacity = "1";
    }

    dragStartX = null;
  });
}

// -----------------------------
// CHATS (lista básica em cima de "matches")
// -----------------------------
const chatList = document.getElementById("chatList");

function openChat(matchId) {
  // aqui você poderia abrir outra tela com o chat daquele matchId
  alert("Chat do match: " + matchId + " (estrutura pronta pra implementar)");
}

function renderMatchesSnapshot(snapshot) {
  if (!chatList) return;

  if (snapshot.empty) {
    chatList.innerHTML = "<p>Nenhum match ainda. Continue explorando!</p>";
    return;
  }

  chatList.innerHTML = "";

  snapshot.forEach(async (docSnap) => {
    const match = docSnap.data();
    const otherUid = match.users.find((u) => u !== currentUser.uid);
    if (!otherUid) return;

    const userRef = doc(db, "users", otherUid);
    const userSnap = await getDoc(userRef);
    const user = userSnap.data();

    const div = document.createElement("div");
    div.className = "chat-item";
    div.onclick = () => openChat(docSnap.id);

    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";

    const info = document.createElement("div");
    info.className = "chat-info";

    const name = document.createElement("div");
    name.className = "chat-name";
    name.textContent = user?.nome || "Usuário";

    const last = document.createElement("div");
    last.className = "chat-last";
    last.textContent = "Nova conexão no NextStop";

    info.appendChild(name);
    info.appendChild(last);

    const meta = document.createElement("div");
    meta.className = "chat-meta";
    meta.textContent = "agora";

    div.appendChild(avatar);
    div.appendChild(info);
    div.appendChild(meta);

    chatList.appendChild(div);
  });
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

// -----------------------------
// AUTH STATE
// -----------------------------
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    await loadCurrentUserProfile();
    await loadFeed();
    listenMatches();
  }
});

// -----------------------------
// INICIALIZAÇÃO
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  // se você quiser começar direto na tela de login,
  // aqui podemos esconder o app até logar.
  setActiveScreen("home");
});

console.log("✅ NextStop carregado com sucesso");
