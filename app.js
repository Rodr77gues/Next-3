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
