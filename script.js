const display = document.getElementById('display');
const keypad = document.getElementById('keypad');

let expression = '';
let lastAnswer = '';

// Gera teclado
function criarTeclado() {
  const botoes = [
    "sin(", "cos(", "tan(", "(", ")", "√", "^", "π", "e", "/",
    "7", "8", "9", "*", "C",
    "4", "5", "6", "-", "←",
    "1", "2", "3", "+", "ans",
    "0", ".", "="
  ];

  botoes.forEach(txt => {
    const btn = document.createElement('button');
    btn.textContent = txt;
    btn.className = 'btn';
    btn.dataset.value = txt;

    if (txt === "=") btn.classList.add("equal");
    if (txt === "C") btn.classList.add("clear");
    if (txt === "←") btn.classList.add("backspace");

    keypad.appendChild(btn);
  });
}

criarTeclado();

// Converte graus para radianos
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function updateDisplay(value) {
  display.textContent = value || '0';
}

function parseExpression(expr) {
  let parsed = expr;
  parsed = parsed.replace(/π/g, `(${Math.PI})`);
  parsed = parsed.replace(/e/g, `(${Math.E})`);
  parsed = parsed.replace(/ans/g, lastAnswer);
  parsed = parsed.replace(/(\d+)\^(\d+)/g, 'Math.pow($1,$2)');
  parsed = parsed.replace(/sin\(([^()]+)\)/g, (_, val) => `Math.sin(toRadians(${val}))`);
  parsed = parsed.replace(/cos\(([^()]+)\)/g, (_, val) => `Math.cos(toRadians(${val}))`);
  parsed = parsed.replace(/tan\(([^()]+)\)/g, (_, val) => `Math.tan(toRadians(${val}))`);
  parsed = parsed.replace(/√\(([^()]+)\)/g, (_, val) => `Math.sqrt(${val})`);
  parsed = parsed.replace(/log\(([^()]+)\)/g, (_, val) => `Math.log10(${val})`);
  parsed = parsed.replace(/ln\(([^()]+)\)/g, (_, val) => `Math.log(${val})`);
  return parsed;
}

// Salva cálculo se logado
async function salvarCalculo(expr, resultado) {
  try {
    const { addDoc, collection } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js");
    await addDoc(collection(window.db, "historico"), {
      uid: window.auth.currentUser.uid,
      expressao: expr,
      resultado: resultado.toString(),
      data: new Date().toISOString()
    });
  } catch (e) {
    console.warn("Erro ao salvar no Firebase:", e.message);
  }
}

// Clique dos botões
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  const value = btn.dataset.value;

  if (btn.classList.contains('clear')) {
    expression = '';
    updateDisplay('');
  } else if (btn.classList.contains('backspace')) {
    expression = expression.slice(0, -1);
    updateDisplay(expression);
  } else if (btn.classList.contains('equal')) {
    try {
      const result = eval(parseExpression(expression));
      lastAnswer = result;
      updateDisplay(result);

      if (window.auth?.currentUser) {
        salvarCalculo(expression, result);
      }

    } catch {
      updateDisplay("Erro");
      expression = '';
    }
  } else {
    expression += value;
    updateDisplay(expression);
  }
});

document.addEventListener("keydown", (e) => {
  const key = e.key;

  // Impede que o Enter selecione botão antigo
  if (key === "Enter") {
    e.preventDefault(); // ✅ ESSENCIAL
  }

  // Impede digitação se estiver em um input (ex: login)
  if (document.activeElement.tagName === "INPUT") return;

  // Números e ponto
  if (!isNaN(key) || key === ".") {
    expression += key;
    updateDisplay(expression);
    return;
  }

  // Operadores
  if (["+", "-", "*", "/", "(", ")"].includes(key)) {
    expression += key;
    updateDisplay(expression);
    return;
  }

  // Enter = calcular
  if (key === "Enter") {
    try {
      const result = eval(parseExpression(expression));
      lastAnswer = result;
      updateDisplay(result);

      if (window.auth?.currentUser) {
        salvarCalculo(expression, result);
      }

      expression = "";
    } catch {
      updateDisplay("Erro");
      expression = "";
    }
    return;
  }

  if (key === "Backspace") {
    expression = expression.slice(0, -1);
    updateDisplay(expression);
    return;
  }

  if (key === "Delete") {
    expression = "";
    updateDisplay("");
    return;
  }
});
