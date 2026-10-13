function mostrarAlerta(tipo, mensaje) {
  let alertas = document.getElementById("alertas");
  alertas.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

function infijoAPostfijo(tokens) {
  let salida = [];
  let operadores = [];
  let precedencia = { "+":1, "-":1, "*":2, "/":2 };

  tokens.forEach(token => {
    if (/^[a-zA-Z0-9]+$/.test(token)) {
      salida.push(token);
    } else if (["+", "-", "*", "/"].includes(token)) {
      while (operadores.length > 0 && ["+", "-", "*", "/"].includes(operadores[operadores.length-1]) &&
             precedencia[operadores[operadores.length-1]] >= precedencia[token]) {
        salida.push(operadores.pop());
      }
      operadores.push(token);
    } else if (token === "(") {
      operadores.push(token);
    } else if (token === ")") {
      while (operadores.length > 0 && operadores[operadores.length-1] !== "(") {
        salida.push(operadores.pop());
      }
      operadores.pop();
    }
  });

  while (operadores.length > 0) {
    salida.push(operadores.pop());
  }

  return salida;
}

function calcular() {
  let expr = document.getElementById("expresion").value.trim();
  if (!expr) {
    mostrarAlerta("danger", "La expresión está vacía. Ingresa una operación válida.");
    return;
  }

  if (!expr.includes("=")) {
    mostrarAlerta("warning", "La expresión debe contener un signo '=' para asignar el resultado.");
    return;
  }

  let [variable, operacion] = expr.split("=");
  variable = variable.trim();
  operacion = operacion.trim();

  if (!variable || !operacion) {
    mostrarAlerta("danger", "La expresión no está completa. Revisa la sintaxis.");
    return;
  }

  let tokens = operacion.match(/[a-zA-Z0-9]+|[+\-*/()]/g);

  let postfijo = infijoAPostfijo(tokens);

  try {
    let resultado = eval(operacion.replace(/[a-zA-Z]/g, "1"));
    document.getElementById("resultado").textContent = resultado;
  } catch {
    mostrarAlerta("danger", "Error al evaluar la expresión. Revisa la sintaxis.");
    return;
  }

  let cuadruplos = [];
  let triplos = [];
  let codigo = [];
  let tempCount = 1;

  function nuevoTemp() {
    return "t" + (tempCount++);
  }

  let stack = [];
  postfijo.forEach(token => {
    if (["+", "-", "*", "/"].includes(token)) {
      let op2 = stack.pop();
      let op1 = stack.pop();
      let t = nuevoTemp();
      cuadruplos.push({op: token, arg1: op1, arg2: op2, res: t});
      triplos.push({op: token, arg1: op1, arg2: op2});
      codigo.push(`let ${t} = ${op1} ${token} ${op2};`);
      stack.push(t);
    } else {
      stack.push(token);
    }
  });

  let finalTemp = stack.pop();
  cuadruplos.push({op: "=", arg1: finalTemp, arg2: "—", res: variable});
  triplos.push({op: "=", arg1: finalTemp});
  codigo.push(`let ${variable} = ${finalTemp};`);

  let tbodyTriplos = document.querySelector("#tabla-triplos tbody");
  let tbodyCuadruplos = document.querySelector("#tabla-cuadruplos tbody");
  tbodyTriplos.innerHTML = "";
  tbodyCuadruplos.innerHTML = "";

  triplos.forEach((t, i) => {
    let row = `<tr><td>${i+1}</td><td>${t.op}</td><td>${t.arg1}</td><td>${t.arg2 || "—"}</td></tr>`;
    tbodyTriplos.innerHTML += row;
  });

  cuadruplos.forEach((c, i) => {
    let row = `<tr><td>${i+1}</td><td>${c.op}</td><td>${c.arg1}</td><td>${c.arg2}</td><td>${c.res}</td></tr>`;
    tbodyCuadruplos.innerHTML += row;
  });

  document.getElementById("codigo").textContent = codigo.join("\n");
  mostrarAlerta("success", "Operación procesada correctamente con jerarquía de operaciones.");
}

function limpiar() {
  document.getElementById("expresion").value = "";
  document.querySelector("#tabla-triplos tbody").innerHTML = "";
  document.querySelector("#tabla-cuadruplos tbody").innerHTML = "";
  document.getElementById("codigo").textContent = "";
  document.getElementById("resultado").textContent = "";
  document.getElementById("alertas").innerHTML = "";
}
