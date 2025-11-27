// app.js

let map, marker;
let dadosEstacoes = [];

// =======================
// CARREGAR ESTAÇÕES JSON
// =======================
fetch("estacoes.json")
  .then(res => res.json())
  .then(data => {
    dadosEstacoes = data.linhas;
    preencherLinhas();
  })
  .catch(err => console.error("Erro ao carregar estacoes.json:", err));

/* =====================
   TELAS
===================== */

function showLogin() {
  document.getElementById("welcome-screen").classList.remove("active");
  document.getElementById("login-screen").classList.add("active");
}

function showWelcome() {
  document.getElementById("login-screen").classList.remove("active");
  document.getElementById("welcome-screen").classList.add("active");
}

// será chamada pelo firebase.js
function entrarNoApp(nome) {
  document.getElementById("welcome-screen").classList.remove("active");
  document.getElementById("login-screen").classList.remove("active");
  document.getElementById("app-screen").classList.add("active");

  document.getElementById("top-user").innerText = nome;
}

/* =====================
   LINHAS E ESTAÇÕES
===================== */

function preencherLinhas() {
  const linhaSelect = document.getElementById("linhaSelect");
  linhaSelect.innerHTML = `<option value="">Selecione uma linha</option>`;

  dadosEstacoes.forEach((linha, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${linha.nome} (${linha.tipo})`;
    linhaSelect.appendChild(option);
  });

  linhaSelect.addEventListener("change", atualizarEstacoes);
}

function atualizarEstacoes() {
  const linhaIndex = this.value;

  const entradaSelect = document.getElementById("entradaSelect");
  const saidaSelect = document.getElementById("saidaSelect");

  entradaSelect.innerHTML = `<option value="">Selecione a estação</option>`;
  saidaSelect.innerHTML = `<option value="">Selecione a estação</option>`;

  if (linhaIndex === "") return;

  const estacoes = dadosEstacoes[linhaIndex].estacoes;

  estacoes.forEach(estacao => {
    const opt1 = document.createElement("option");
    opt1.value = estacao;
    opt1.textContent = estacao;

    const opt2 = document.createElement("option");
    opt2.value = estacao;
    opt2.textContent = estacao;

    entradaSelect.appendChild(opt1);
    saidaSelect.appendChild(opt2);
  });
}

/* =====================
   ROTA
===================== */

function saveRoute() {
  const linhaIndex = document.getElementById("linhaSelect").value;
  const entrada = document.getElementById("entradaSelect").value;
  const saida = document.getElementById("saidaSelect").value;
  const horario = document.getElementById("horario").value;

  if (linhaIndex === "" || !entrada || !saida || !horario) {
    alert("Preencha todos os campos do trajeto.");
    return;
  }

  const linhaNome = dadosEstacoes[linhaIndex].nome;

  document.getElementById("routeStatus").innerText =
    `Trajeto salvo: ${linhaNome} | ${entrada} → ${saida} às ${horario}`;
}

/* =====================
   MAPA / GPS
===================== */

function abrirMapa() {
  document.getElementById("map-container").style.display = "block";
  if (!map) initMap();
}

function fecharMapa() {
  document.getElementById("map-container").style.display = "none";
}

function initMap() {
  const inicial = { lat: -23.5505, lng: -46.6333 }; // SP

  map = new google.maps.Map(document.getElementById("map"), {
    center: inicial,
    zoom: 15
  });

  marker = new google.maps.Marker({
    position: inicial,
    map: map,
    title: "Você está aqui"
  });

  if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      marker.setPosition(pos);
      map.setCenter(pos);
    });
  }
}

function ativarLocalizacao() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      alert(
        "Localização atual: " +
        pos.coords.latitude.toFixed(5) + ", " +
        pos.coords.longitude.toFixed(5)
      );
    });
  } else {
    alert("Geolocalização não suportada.");
  }
}

/* =====================
   EXPORTAR PARA O HTML
===================== */

window.showLogin = showLogin;
window.showWelcome = showWelcome;
window.entrarNoApp = entrarNoApp;

window.saveRoute = saveRoute;
window.abrirMapa = abrirMapa;
window.fecharMapa = fecharMapa;
window.ativarLocalizacao = ativarLocalizacao;
