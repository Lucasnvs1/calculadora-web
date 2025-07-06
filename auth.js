import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDtGTEGhUm60eVhiJMsuNfm8JPWCJ-GGeI",
  authDomain: "calculadora-cientifica-1bf1c.firebaseapp.com",
  projectId: "calculadora-cientifica-1bf1c",
  storageBucket: "calculadora-cientifica-1bf1c.firebasestorage.app",
  messagingSenderId: "906229270834",
  appId: "1:906229270834:web:f36fd6373704a77d25af2b"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
window.auth = auth;
window.db = db;

// Entrar
window.loginWithEmail = async function(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login realizado!");
    window.location.href = "index.html";
  } catch (e) {
    alert("Erro ao logar: " + e.message);
  }
};

// Cadastrar
window.register = async function(email, password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Conta criada!");
    window.location.href = "index.html";
  } catch (e) {
    alert("Erro ao cadastrar: " + e.message);
  }
};

// Logout
window.logout = async function () {
  await signOut(auth);
  alert("Você saiu da conta.");
  window.location.reload();
};

// Carregar histórico
window.carregarHistorico = async function(uid) {
  const lista = document.getElementById("historico-lista");
  lista.innerHTML = "<p>Carregando...</p>";

  const q = query(collection(db, "historico"), where("uid", "==", uid));
  const snap = await getDocs(q);

  if (snap.empty) {
    lista.innerHTML = "<p>Nenhum cálculo encontrado.</p>";
    return;
  }

  const dados = [];
  snap.forEach(doc => {
    const { expressao, resultado } = doc.data();
    dados.push(`<div class="historico-item"><strong>${expressao}</strong> = ${resultado}</div>`);
  });

  lista.innerHTML = dados.join("");
};

// Cabeçalho dinâmico
onAuthStateChanged(auth, (user) => {
  const controls = document.getElementById("user-controls");
  if (!controls) return;

  if (user) {
    controls.innerHTML = `
      <button onclick="carregarHistorico('${user.uid}');document.getElementById('historico-modal').style.display='block'">Histórico</button>
      <button onclick="logout()">Sair</button>
    `;
  } else {
    controls.innerHTML = '<button onclick="window.location.href=\'login.html\'">Entrar / Cadastrar</button>';
  }
});
