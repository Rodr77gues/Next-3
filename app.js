// app.js

let map, marker;

// mostrar/ocultar telas
function showLogin() {
  document.getElementById("welcome-screen").classList.remove("active");
  document.getElementById("login-screen").classList.add("active");
}

function showWelcome() {
  document.getElementById("login-screen").classList.remove("active");
  document.getElementById("welcome-screen").classList.add("active");
}

// será chamada pelo firebase.js depois do login
function entrarNoApp(nome) {
  document.getElementById("welcome-screen").classList.remove("active");
  document.getElementById("login-screen").classList.remove("active");
  document.getElementById("app-screen").classList.add("active");
  document.getElementById("top-user").innerText = nome;
}

// rota
function saveRoute() {
  const linha = document.getElementById("linhaSelect").value;
  const entrada = document.getElementById("entradaSelect").value;
  const saida = document.getElementById("saidaSelect").value;
  const horario = document.getElementById("horario").value;

  document.getElementById("routeStatus").innerText =
    `Trajeto salvo: ${linha} | ${entrada} → ${saida} às ${horario}`;
}

// mapa
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
    zoom: 15,
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
        lng: position.coords.longitude,
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
    alert("Geolocalização não suportada neste dispositivo.");
  }
}

// deixar tudo disponível pro HTML
window.showLogin = showLogin;
window.showWelcome = showWelcome;
window.entrarNoApp = entrarNoApp;
window.saveRoute = saveRoute;
window.abrirMapa = abrirMapa;
window.fecharMapa = fecharMapa;
window.ativarLocalizacao = ativarLocalizacao;
