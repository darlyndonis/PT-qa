const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '../output');
const EJERCICIO1_DIR = path.join(OUTPUT_DIR, 'ejercicio1');
const PLAYWRIGHT_JSON = path.join(OUTPUT_DIR, 'playwright-results.json');
const REPORTE_FINAL = path.join(OUTPUT_DIR, 'reporte-consolidado.md');

// 1. Cargar resultados del Ejercicio 1 (LLM)
function cargarResultadosEjercicio1() {
  if (!fs.existsSync(EJERCICIO1_DIR)) {
    return { escenarios: [], disponible: false };
  }
  const archivos = fs.readdirSync(EJERCICIO1_DIR).filter((f) => f.endsWith('.json'));
  const escenarios = archivos.map((archivo) => {
    const contenido = fs.readFileSync(path.join(EJERCICIO1_DIR, archivo), 'utf-8');
    return JSON.parse(contenido);
  });
  return { escenarios, disponible: escenarios.length > 0 };
}

// 2. Cargar resultados de Playwright (Ejercicios 2 y 3)
function extraerTestsDeSuite(suite, acumulador, proyectoFiltro) {
  if (suite.specs) {
    for (const spec of suite.specs) {
      for (const test of spec.tests || []) {
        if (proyectoFiltro && test.projectName !== proyectoFiltro) continue;
        const ultimoResultado = (test.results || [])[test.results.length - 1] || {};
        acumulador.push({
          titulo: spec.title,
          proyecto: test.projectName,
          estado: ultimoResultado.status || 'desconocido',
          duracionMs: ultimoResultado.duration || 0,
        });
      }
    }
  }
  if (suite.suites) {
    for (const sub of suite.suites) {
      extraerTestsDeSuite(sub, acumulador, proyectoFiltro);
    }
  }
}

function cargarResultadosPlaywright(proyecto) {
  if (!fs.existsSync(PLAYWRIGHT_JSON)) {
    return { tests: [], disponible: false };
  }
  const data = JSON.parse(fs.readFileSync(PLAYWRIGHT_JSON, 'utf-8'));
  const tests = [];
  for (const suite of data.suites || []) {
    extraerTestsDeSuite(suite, tests, proyecto);
  }
  return { tests, disponible: tests.length > 0 };
}

// 3. Generar sección del Ejercicio 1
function generarSeccionEjercicio1(datos) {
  if (!datos.disponible) {
    return `## Ejercicio 1 — Evaluación Conversacional de Agentes LLM\n\n` +
      `No se encontraron resultados. Corre \`npm start\` dentro de \`ejercicio1-llm-eval/\` antes de generar este reporte.\n\n`;
  }

  const { escenarios } = datos;
  const totalEscenarios = escenarios.length;
  const pass = escenarios.filter((e) => e.veredicto === 'PASS').length;
  const fail = totalEscenarios - pass;

  const promedio = (campo) =>
    Math.round(escenarios.reduce((sum, e) => sum + (e.metricas[campo] || 0), 0) / totalEscenarios);

  let md = `## Ejercicio 1 — Evaluación Conversacional de Agentes LLM\n\n`;
  md += `**Escenarios evaluados:** ${totalEscenarios} | **PASS:** ${pass} | **FAIL:** ${fail}\n\n`;
  md += `### Métricas promedio globales\n\n`;
  md += `| Métrica | Promedio |\n|---|---|\n`;
  md += `| Coherencia | ${promedio('coherence_score')}% |\n`;
  md += `| Retención de contexto | ${promedio('context_retention')}% |\n`;
  md += `| Tasa de alucinación | ${promedio('hallucination_rate')}% |\n`;
  md += `| Seguridad | ${promedio('security_score')}% |\n\n`;

  md += `### Detalle por escenario\n\n`;
  md += `| Escenario | Veredicto | Coherencia | Contexto | Alucinación | Seguridad |\n`;
  md += `|---|---|---|---|---|---|\n`;
  for (const e of escenarios) {
    const icono = e.veredicto === 'PASS' ? 'yes' : 'no';
    md += `| ${e.escenario} | ${icono} ${e.veredicto} | ${e.metricas.coherence_score}% | ${e.metricas.context_retention}% | ${e.metricas.hallucination_rate}% | ${e.metricas.security_score}% |\n`;
  }
  md += `\n`;

  md += `### Análisis por escenario\n\n`;
  for (const e of escenarios) {
    md += `**${e.escenario}:** ${e.analisis}\n\n`;
  }

  return md;
}

// 4. Generar sección de Playwright (Ejercicios 2 y 3)
function generarSeccionPlaywright(nombreEjercicio, proyecto, datos) {
  if (!datos.disponible) {
    return `## ${nombreEjercicio}\n\n No se encontraron resultados. Corre \`npx playwright test --project=${proyecto}\` antes de generar este reporte.\n\n`;
  }

  const { tests } = datos;
  const pass = tests.filter((t) => t.estado === 'passed').length;
  const fail = tests.filter((t) => t.estado === 'failed' || t.estado === 'timedOut').length;
  const duracionPromedio = Math.round(tests.reduce((sum, t) => sum + t.duracionMs, 0) / tests.length);

  let md = `## ${nombreEjercicio}\n\n`;
  md += `**Tests ejecutados:** ${tests.length} | **PASS:** ${pass} | **FAIL:** ${fail} | **Duración promedio:** ${duracionPromedio}ms\n\n`;
  md += `| Test | Estado | Duración |\n|---|---|---|\n`;
  for (const t of tests) {
    const icono = t.estado === 'passed' ? 'yes' : 'no';
    md += `| ${t.titulo} | ${icono} ${t.estado} | ${t.duracionMs}ms |\n`;
  }
  md += `\n`;

  return md;
}

// 5. Detección transversal (bonus)
function generarDeteccionTransversal(datosEjercicio1, datosApi, datosChatbot) {
  let md = `## Detección Transversal de Problemas\n\n`;

  if (datosEjercicio1.disponible) {
    const escenarios = datosEjercicio1.escenarios;
    const conAlucinacion = escenarios.filter((e) => e.metricas.hallucination_rate > 0);
    const conFalloSeguridad = escenarios.filter((e) => e.metricas.security_score < 100);
    const conPerdidaContexto = escenarios.filter((e) => e.metricas.context_retention < 100);

    md += `### Alucinaciones\n`;
    md += conAlucinacion.length > 0
      ? conAlucinacion.map((e) => `- **${e.escenario}**: ${e.metricas.hallucination_rate}% de turnos con posible alucinación\n`).join('')
      : `- No se detectaron alucinaciones en ningún escenario.\n`;

    md += `\n### Prompt Injection / Fallos de Seguridad\n`;
    md += conFalloSeguridad.length > 0
      ? conFalloSeguridad.map((e) => `- **${e.escenario}**: seguridad al ${e.metricas.security_score}%\n`).join('')
      : `- El asistente resistió todos los intentos de manipulación evaluados.\n`;

    md += `\n### Pérdida de Contexto\n`;
    md += conPerdidaContexto.length > 0
      ? conPerdidaContexto.map((e) => `- **${e.escenario}**: retención de contexto al ${e.metricas.context_retention}%\n`).join('')
      : `- No se detectó pérdida de contexto en ningún escenario.\n`;
  } else {
    md += `_No hay datos del Ejercicio 1 disponibles para esta sección._\n`;
  }

  md += `\n### Fallos de API / UI (Ejercicios 2 y 3)\n`;
  const fallosApi = datosApi.disponible ? datosApi.tests.filter((t) => t.estado !== 'passed') : [];
  const fallosChatbot = datosChatbot.disponible ? datosChatbot.tests.filter((t) => t.estado !== 'passed') : [];
  const todosFallos = [...fallosApi, ...fallosChatbot];

  md += todosFallos.length > 0
    ? todosFallos.map((t) => `- **${t.titulo}** (${t.proyecto}): ${t.estado}\n`).join('')
    : `- No se detectaron fallos en las pruebas de API ni de Chatbot.\n`;

  md += `\n`;
  return md;
}

// 6. Métricas globales finales
function generarMetricasGlobales(datosEjercicio1, datosApi, datosChatbot) {
  const totalLlm = datosEjercicio1.disponible ? datosEjercicio1.escenarios.length : 0;
  const passLlm = datosEjercicio1.disponible ? datosEjercicio1.escenarios.filter((e) => e.veredicto === 'PASS').length : 0;

  const totalApi = datosApi.disponible ? datosApi.tests.length : 0;
  const passApi = datosApi.disponible ? datosApi.tests.filter((t) => t.estado === 'passed').length : 0;

  const totalChatbot = datosChatbot.disponible ? datosChatbot.tests.length : 0;
  const passChatbot = datosChatbot.disponible ? datosChatbot.tests.filter((t) => t.estado === 'passed').length : 0;

  const totalGeneral = totalLlm + totalApi + totalChatbot;
  const passGeneral = passLlm + passApi + passChatbot;
  const porcentajePass = totalGeneral > 0 ? Math.round((passGeneral / totalGeneral) * 100) : 0;

  let md = `## Métricas Globales de Ejecución\n\n`;
  md += `| Ejercicio | Total | PASS | FAIL | % Éxito |\n`;
  md += `|---|---|---|---|---|\n`;
  md += `| Ejercicio 1 (LLM Eval) | ${totalLlm} | ${passLlm} | ${totalLlm - passLlm} | ${totalLlm > 0 ? Math.round((passLlm / totalLlm) * 100) : 0}% |\n`;
  md += `| Ejercicio 2 (API) | ${totalApi} | ${passApi} | ${totalApi - passApi} | ${totalApi > 0 ? Math.round((passApi / totalApi) * 100) : 0}% |\n`;
  md += `| Ejercicio 3 (Chatbot) | ${totalChatbot} | ${passChatbot} | ${totalChatbot - passChatbot} | ${totalChatbot > 0 ? Math.round((passChatbot / totalChatbot) * 100) : 0}% |\n`;
  md += `| **Total general** | **${totalGeneral}** | **${passGeneral}** | **${totalGeneral - passGeneral}** | **${porcentajePass}%** |\n\n`;

  return md;
}

// Main
function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const datosEjercicio1 = cargarResultadosEjercicio1();
  const datosApi = cargarResultadosPlaywright('api');
  const datosChatbot = cargarResultadosPlaywright('chatbot');

  let reporte = `# Reporte Consolidado — Prueba Técnica QA Engineer\n\n`;
  reporte += `**Generado el:** ${new Date().toLocaleString('es-SV')}\n\n`;
  reporte += `---\n\n`;
  reporte += generarMetricasGlobales(datosEjercicio1, datosApi, datosChatbot);
  reporte += `---\n\n`;
  reporte += generarSeccionEjercicio1(datosEjercicio1);
  reporte += `---\n\n`;
  reporte += generarSeccionPlaywright('Ejercicio 2 — Automatización de API', 'api', datosApi);
  reporte += `---\n\n`;
  reporte += generarSeccionPlaywright('Ejercicio 3 — Automatización de Chatbot Web', 'chatbot', datosChatbot);
  reporte += `---\n\n`;
  reporte += generarDeteccionTransversal(datosEjercicio1, datosApi, datosChatbot);

  fs.writeFileSync(REPORTE_FINAL, reporte, 'utf-8');
  console.log(`Reporte consolidado generado en: ${REPORTE_FINAL}`);
}

main();