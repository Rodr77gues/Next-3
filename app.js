// ELEMENTOS PRINCIPAIS
const splash = document.getElementById("splash");
const welcomeScreen = document.getElementById("welcome-screen");
const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app-screen");

const loginNome = document.getElementById("login-nome");
const loginEmail = document.getElementById("login-email");
const loginObjetivo = document.getElementById("login-objetivo");
const loginDisponibilidade = document.getElementById("login-disponibilidade");
const loginBio = document.getElementById("login-bio");

const linhaSelect = document.getElementById("linhaSelect");
const entradaSelect = document.getElementById("entradaSelect");
const saidaSelect = document.getElementById("saidaSelect");
const horarioInput = document.getElementById("horario");
const routeStatus = document.getElementById("routeStatus");

const cardContainer = document.getElementById("card-container");
const statusMatch = document.getElementById("statusMatch");

const tabSwipe = document.getElementById("tab-swipe");
const tabChat = document.getElementById("tab-chat");
const tabProfile = document.getElementById("tab-profile");

const chatList = document.getElementById("chat-list");
const chatScreen = document.getElementById("chat-screen");
const chatWithName = document.getElementById("chatWithName");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");

const profileBox = document.getElementById("profile-box");
const topUser = document.getElementById("top-user");
const topSubtitle = document.getElementById("top-subtitle");

let linhas = {};
let currentUser = null;
let userRoute = null;
let currentPeople = [];
let currentIndex = 0;
let currentChatKey = null;

// DEMO DE PERFIS
const allPeople = [
  {
    id: "julia",
    name: "Júlia",
    idade: 23,
    objetivo: "Paquera",
    disponibilidade: "Encontrar hoje",
    line: "Metrô - Linha 4-Amarela",
    entrada: "Luz",
    saida: "Pinheiros",
    horario: "07:30",
    bio: "Indo pra facul, amo café e música.",
    image: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    id: "carlos",
    name: "Carlos",
    idade: 28,
    objetivo: "Networking",
    disponibilidade: "Bate-papo",
    line: "CPTM - Linha 9-Esmeralda",
    entrada: "Osasco",
    saida: "Pinheiros",
    horario: "08:00",
    bio: "TI, startups e tecnologia.",
    image: "https://randomuser.me/api/portraits/men/44.jpg"
  },
  {
    id: "bia",
    name: "Beatriz",
    idade: 24,
    objetivo: "Tudo",
    disponibilidade: "Combinar outro dia",
    line: "Metrô - Linha 1-Azul",
    entrada: "Vila Mariana",
    saida: "Sé",
    horario: "18:15",
    bio: "Séries, livros e boas conversas.",
    image: "https://randomuser.me/api/portraits/women/52.jpg"
  }
];

// SPLASH
setTimeout(() => {
  if (splash) splash.style.display = "none";
}, 2500);

// TELAS
function showWelcome() {
  welcomeScreen.classList.add("active");
  loginScreen.classList.remove("active");
  appScreen.classList.remove("active");
}
function showLogin() {
  welcomeScreen.classList.remove("active");
  loginScreen.classList.add("active");
  appScreen.classList.remove("active");
}
function showApp() {
  welcomeScreen.classList.remove("active");
  loginScreen.classList.remove("active");
  appScreen.classList.add("active");
}

// LOGIN
function login() {
  const nome = loginNome.value.trim();
  const email = loginEmail.value.trim();
  const objetivo = loginObjetivo.value;
  const disponibilidade = loginDisponibilidade.value;
  const bio = loginBio.value.trim();

  if (!nome || !email) {
    alert("Preencha nome e e-mail.");
    return;
  }

  currentUser = { nome, email, objetivo, disponibilidade, bio };
  localStorage.setItem("nextstopUser", JSON.stringify(currentUser));

  renderTopUser();
  renderProfileBox();
  showApp();
  initApp();
}

// LOGOUT
function logout() {
  localStorage.removeItem("nextstopUser");
  localStorage.removeItem("nextstopRoute");
  location.reload();
}

// CARREGAR ESTAÇÕES
fetch("estacoes.json")
  .then(res => res.json())
  .then(data => {
    linhas = data;
    populateLines();
  })
  .catch(err => console.error("Erro ao carregar estacoes.json:", err));

function populateLines() {
  linhaSelect.innerHTML = "<option value=''>Selecione a linha</option>";
  Object.keys(linhas).forEach(linha => {
    const op = document.createElement("option");
    op.value = linha;
    op.textContent = linha;
    linhaSelect.appendChild(op);
  });
}

linhaSelect.addEventListener("change", () => {
  atualizarEstacoes();
});

function atualizarEstacoes() {
  entradaSelect.innerHTML = "<option value=''>Entrada</option>";
  saidaSelect.innerHTML = "<option value=''>Saída</option>";

  const estacoes = linhas[linhaSelect.value] || [];
  estacoes.forEach(est => {
    const e1 = document.createElement("option");
    e1.value = est;
    e1.textContent = est;
    entradaSelect.appendChild(e1);

    const e2 = document.createElement("option");
    e2.value = est;
    e2.textContent = est;
    saidaSelect.appendChild(e2);
  });
}

// SALVAR TRAJETO
function saveRoute() {
  const lineName = linhaSelect.value;
  const entrada = entradaSelect.value;
  const saida = saidaSelect.value;
  const horario = horarioInput.value;

  if (!lineName || !entrada || !saida) {
    routeStatus.style.color = "#ffccd9";
    routeStatus.textContent = "Preencha linha, entrada e saída.";
    return;
  }

  userRoute = { lineName, entrada, saida, horario };
  localStorage.setItem("nextstopRoute", JSON.stringify(userRoute));

  routeStatus.style.color = "#b5ffb8";
  routeStatus.textContent =
    `Rota salva: ${entrada} ➝ ${saida} (${lineName})` +
    (horario ? ` às ${horario}` : "");
}

// GPS
function ativarLocalizacao() {
  if (!navigator.geolocation) {
    routeStatus.textContent = "Seu navegador não suporta localização.";
    return;
  }

  routeStatus.style.color = "#ffd27f";
  routeStatus.textContent = "Buscando localização...";

  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude.toFixed(4);
      const lng = pos.coords.longitude.toFixed(4);
      localStorage.setItem("nextstopLocation", JSON.stringify({ lat, lng }));

      routeStatus.style.color = "#b5ffb8";
      routeStatus.innerHTML =
        `📍 Localização: ${lat}, ${lng}<br>🔎 Procurando pessoas próximas...`;

      setTimeout(() => {
        routeStatus.innerHTML += "<br>✅ Pessoas encontradas no seu trajeto!";
      }, 2000);
    },
    err => {
      console.error(err);
      routeStatus.style.color = "#ffccd9";
      routeStatus.textContent = "Não foi possível obter localização.";
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// MAPA
function openRouteInMaps() {
  if (!userRoute || !userRoute.entrada) {
    alert("Salve seu trajeto primeiro.");
    return;
  }
  const query = encodeURIComponent(userRoute.entrada + " estação metrô São Paulo");
  const url = "https://www.google.com/maps/search/" + query;
  window.open(url, "_blank");
}

// FILTRAR PERFIS
function filtrarPerfis() {
  if (!currentUser) {
    currentPeople = [...allPeople];
  } else {
    currentPeople = allPeople.filter(p => {
      if (currentUser.objetivo === "Tudo") return true;
      return p.objetivo === currentUser.objetivo || p.objetivo === "Tudo";
    });
  }
  currentIndex = 0;
}

// CRIAR CARD
function criarCard(person) {
  const card = document.createElement("div");
  card.classList.add("profile-card");
  card.style.backgroundImage = `url('${person.image}')`;

  const info = document.createElement("div");
  info.classList.add("card-info");
  info.innerHTML = `
    <h2>${person.name}, ${person.idade}</h2>
    <p>${person.bio}</p>
    <div class="badges">
      <span class="badge">${person.objetivo}</span>
      <span class="badge">${person.disponibilidade}</span>
      <span class="badge">${person.line}</span>
      <span class="badge">${person.entrada} ➝ ${person.saida}</span>
      <span class="badge">Horário: ${person.horario}</span>
    </div>
  `;
  card.appendChild(info);

  let startX = 0;
  let moveX = 0;

  card.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  card.addEventListener("touchmove", e => {
    moveX = e.touches[0].clientX - startX;
    card.style.transform =
      `translateX(${moveX}px) rotate(${moveX / 15}deg)`;
  });

  card.addEventListener("touchend", () => {
    if (moveX > 120) {
      like();
    } else if (moveX < -120) {
      dislike();
    } else {
      card.style.transform = "translateX(0) rotate(0deg)";
    }
    moveX = 0;
  });

  return card;
}

// MOSTRAR PRÓXIMO
function mostrarProximo() {
  cardContainer.innerHTML = "";
  statusMatch.textContent = "";

  if (!currentPeople.length) {
    cardContainer.innerHTML = "<p>Sem perfis compatíveis no momento.</p>";
    return;
  }
  if (currentIndex >= currentPeople.length) {
    cardContainer.innerHTML = "<p>Você já viu todos por hoje 😅</p>";
    return;
  }
  const person = currentPeople[currentIndex];
  const card = criarCard(person);
  cardContainer.appendChild(card);
}

// LIKE / DISLIKE
function like() {
  if (currentIndex >= currentPeople.length) return;
  const person = currentPeople[currentIndex];

  const chance = Math.random();
  if (chance > 0.3) {
    statusMatch.innerHTML =
      `💖 MATCH com <strong>${person.name}</strong>! Um chat foi aberto.`;
    adicionarChatLista(person);
    abrirChat(person);
  } else {
    statusMatch.textContent = "Quase! Próximo perfil 👀";
  }

  if (navigator.vibrate) navigator.vibrate(100);

  currentIndex++;
  setTimeout(mostrarProximo, 250);
}

function dislike() {
  if (currentIndex >= currentPeople.length) return;
  statusMatch.textContent = "Você pulou este perfil.";
  if (navigator.vibrate) navigator.vibrate([80, 60, 80]);
  currentIndex++;
  setTimeout(mostrarProximo, 200);
}

// TABS
function showTab(tab) {
  tabSwipe.classList.remove("active");
  tabChat.classList.remove("active");
  tabProfile.classList.remove("active");

  if (tab === "swipe") tabSwipe.classList.add("active");
  if (tab === "chat") tabChat.classList.add("active");
  if (tab === "profile") tabProfile.classList.add("active");
}

// CHAT
function chatKey(personId) {
  return "nextstopChat_" + personId;
}

function adicionarChatLista(person) {
  const item = document.createElement("div");
  item.classList.add("chat-list-item");
  item.textContent = `💬 Chat com ${person.name}`;
  item.onclick = () => abrirChat(person);
  chatList.appendChild(item);
}

function abrirChat(person) {
  showTab("chat");
  chatScreen.classList.add("open");
  chatWithName.textContent = person.name;
  currentChatKey = chatKey(person.id);
  carregarChat();
}

function carregarChat() {
  chatMessages.innerHTML = "";
  if (!currentChatKey) return;
  const saved = localStorage.getItem(currentChatKey);
  if (!saved) return;
  const msgs = JSON.parse(saved);
  msgs.forEach(m => adicionarMensagemDOM(m.text, m.from));
}

function salvarMensagem(text, from) {
  if (!currentChatKey) return;
  let msgs = [];
  const saved = localStorage.getItem(currentChatKey);
  if (saved) msgs = JSON.parse(saved);
  msgs.push({ text, from, ts: Date.now() });
  localStorage.setItem(currentChatKey, JSON.stringify(msgs));
}

function adicionarMensagemDOM(text, from) {
  const div = document.createElement("div");
  div.classList.add("chat-msg");
  if (from === "me") div.classList.add("me");
  else div.classList.add("them");
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  adicionarMensagemDOM(text, "me");
  salvarMensagem(text, "me");
  chatInput.value = "";

  setTimeout(() => {
    const reply = "Adorei, me conta mais 😊";
    adicionarMensagemDOM(reply, "them");
    salvarMensagem(reply, "them");
  }, 900);
}

// PERFIL
function renderTopUser() {
  if (!currentUser) return;
  topUser.innerHTML = "";
  const img = document.createElement("img");
  img.src = "https://via.placeholder.com/60x60.png?text=NS";
  const span = document.createElement("span");
  span.textContent = currentUser.nome;
  topUser.appendChild(img);
  topUser.appendChild(span);

  if (currentUser.objetivo && currentUser.objetivo !== "Tudo") {
    topSubtitle.textContent =
      `Buscando ${currentUser.objetivo.toLowerCase()} no caminho`;
  } else {
    topSubtitle.textContent = "Conectando pessoas no seu trajeto";
  }
}

function renderProfileBox()gerarHeatmap(); {
  if (!currentUser) return;
  profileBox.innerHTML = `
    <div class="profile-box-header">
      <img src="https://via.placeholder.com/80x80.png?text=NS" alt="Foto de perfil" />
      <div>
        <strong>${currentUser.nome}</strong><br/>
        <span style="font-size:12px; opacity:0.8;">${currentUser.email}</span><br/>
        <span style="font-size:12px;">Objetivo: ${currentUser.objetivo}</span><br/>
        <span style="font-size:12px;">Disponível para: ${currentUser.disponibilidade}</span>
      </div>
    </div>
    <p>${currentUser.bio || "Você ainda não escreveu sua bio."}</p>
  `;
}

// INICIALIZAÇÃO
function initApp() {
  const savedRoute = localStorage.getItem("nextstopRoute");
  if (savedRoute) {
    try {
      userRoute = JSON.parse(savedRoute);
      if (userRoute.lineName && linhas[userRoute.lineName]) {
        linhaSelect.value = userRoute.lineName;
        atualizarEstacoes();
        entradaSelect.value = userRoute.entrada || "";
        saidaSelect.value = userRoute.saida || "";
        horarioInput.value = userRoute.horario || "";
        if (userRoute.entrada && userRoute.saida) {
          routeStatus.style.color = "#b5ffb8";
          routeStatus.textContent =
            `Rota: ${userRoute.entrada} ➝ ${userRoute.saida}`;
        }
      }
    } catch {}
  }

  filtrarPerfis();
  mostrarProximo();
  showTab("swipe");
}

// AUTO-LOAD
window.onload = () => {
  const savedUser = localStorage.getItem("nextstopUser");
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      renderTopUser();
      renderProfileBox();
      showApp();
      initApp();
    } catch {
      showWelcome();
    }
  } else {
    showWelcome();
  }
};

// 🔍 PROCURAR PESSOAS PELA MESMA ESTAÇÃO DE SAÍDA
function findByExitStation() {

  if (!userRoute || !userRoute.saida || !userRoute.lineName) {
    alert("Primeiro salve sua linha e estação de saída.");
    return;
  }

  const minhaLinha = userRoute.lineName;
  const minhaSaida = userRoute.saida;

  // Filtra pessoas que descem na mesma estação
  const pessoasFiltradas = allPeople.filter(p =>
    p.line === minhaLinha &&
    p.saida === minhaSaida
  );

  if (pessoasFiltradas.length === 0) {
    cardContainer.innerHTML = `
      <p>😢 Ninguém cadastrado descendo em <strong>${minhaSaida}</strong> no momento</p>
    `;
    return;
  }

  // Substitui a lista atual
  currentPeople = pessoasFiltradas;
  currentIndex = 0;

  statusMatch.innerHTML = `
    📍 Mostrando pessoas que descem em <strong>${minhaSaida}</strong>
  `;

  mostrarProximo();
}
