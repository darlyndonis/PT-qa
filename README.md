# PT — QA Engineer: AI Agents, LLMs

Repositorio con la resolución, dividida en 5 ejercicios independientes: evaluación conversacional de agentes LLM, automatización de API, automatización de chatbot web, pipeline CI/CD y reporte consolidado.

## 📁 Estructura del repositorio

```
PT-qa/
├── ejercicio1-llm-eval/
│   ├── src/
│   │   ├── scenarios/
│   │   │   ├── cambio-de-tema.ts
│   │   │   ├── consulta-simple.ts
│   │   │   ├── index.ts
│   │   │   ├── informacion-ambigua.ts
│   │   │   ├── memoria-conversacional.ts
│   │   │   └── seguridad-prompt-injection.ts
│   │   ├── conversation-runner.ts
│   │   ├── evaluator.ts
│   │   ├── heuristics.ts
│   │   ├── judge.ts
│   │   ├── llm-client.ts
│   │   └── types.ts
│   ├── index.ts
│   ├── package.json
│   └── tsconfig.json
├── ejercicio2-api/
│   └── tests/
│       ├── auth-login.spec.ts
│       ├── auth-register.spec.ts
│       ├── goals.spec.ts
│       └── health-check.spec.ts
├── ejercicio3-chatbot/
│   └── tests/
│       └── chatbot.spec.ts
├── ejercicio5-consolidado/
│   └── generar-reporte.js
├── output/
│   ├── ejercicio1/
│   │   ├── cambio-de-tema.json
│   │   ├── consulta-simple.json
│   │   ├── informacion-ambigua.json
│   │   ├── memoria-conversacional.json
│   │   └── seguridad-y-prompt-injection.json
│   ├── playwright-results.json
│   └── reporte-consolidado.md
├── .github/
│   └── workflows/
│       └── ci.yml
├── .env.example
├── .gitignore
├── package.json
├── playwright.config.ts
└── README.md
```

## Requisitos previos

- Node.js 18+
- Git
- Una cuenta gratuita en [Groq](https://console.groq.com) (para el Ejercicio 1)

## Instalación

```bash
git clone https://github.com/darlyndonis/PT-qa.git
cd PT-qa

# Dependencias de Playwright (Ejercicios 2 y 3)
npm install
npx playwright install

# Dependencias del Ejercicio 1
cd ejercicio1-llm-eval
npm install
cd ..

# Configura credenciales
cp .env.example .env   # Completa GROQ_API_KEY y demás valores
```

## Ejercicio 1 — Evaluación Conversacional de Agentes LLM

Simula 6 turnos de conversación por escenario (5 escenarios) entre un usuario simulado y un LLM real (Groq, modelo `openai/gpt-oss-120b`), evaluando coherencia, alucinaciones, seguridad y retención de contexto mediante un motor híbrido: heurísticas basadas en reglas para seguridad/prompt injection, y LLM-as-judge para coherencia y detección de alucinaciones.

**Ejecución:**
```bash
cd ejercicio1-llm-eval
npm start
```

**Salida:** un JSON por escenario en `output/ejercicio1/`.

**⚠️ Nota sobre límites del proveedor:** este ejercicio usa el tier gratuito de Groq, que tiene un límite compartido de 200,000 tokens por día entre todas las ejecuciones (locales y de CI). Si el pipeline o una corrida local falla con un error `429 rate_limit_exceeded`, es una limitación temporal del proveedor gratuito, no un error del código — reintentar más tarde (la cuota se libera de forma gradual) resuelve el problema. Los resultados en `output/ejercicio1/` corresponden a una ejecución completa y exitosa de los 5 escenarios.

## Ejercicio 2 — Automatización de API (Goal Tracker API)

Suite de pruebas end-to-end con Playwright sobre la Goal Tracker API (`https://goal-tracker-api.onrender.com`): health check, registro, login (positivo y negativo), y CRUD completo de goals.

**Ejecución:**
```bash
npx playwright test --project=api
```

**Reporte:**
```bash
npx playwright show-report
```

## Ejercicio 3 — Automatización de Chatbot Web

Pruebas de UI con Playwright sobre el widget "Ask Docs" embebido en Botpress Docs (`https://botpress.com/docs`): carga del sitio, existencia del widget, apertura/cierre, y envío de mensaje con validación de respuesta y tiempo.

**Ejecución:**
```bash
npx playwright test --project=chatbot
```

**Evidencia:** screenshots y video en `test-results/` (solo en caso de fallo), reporte HTML en `playwright-report/`.

## Ejercicio 4 — CI/CD

Pipeline en GitHub Actions (`.github/workflows/ci.yml`) con 3 jobs paralelos que corren en cada push/PR a `main`:
1. `api-tests` — Ejercicio 2
2. `chatbot-tests` — Ejercicio 3
3. `llm-eval-tests` — Ejercicio 1

Cada job instala sus propias dependencias, ejecuta sus pruebas y sube los resultados como artifacts descargables. Un job final `reporte-final` resume el estado de los 3 en el summary de la ejecución.

**Secrets requeridos en GitHub**:
`GOAL_TRACKER_API_URL`, `TEST_USER_PASSWORD`, `CHATBOT_SITE_URL`, `GROQ_API_KEY`, `LLM_MODEL`

## Ejercicio 5 — Reporte Consolidado

Script en Node.js que lee los resultados de los Ejercicios 1, 2 y 3 (JSONs) y genera un reporte único en Markdown con métricas globales, detalle por escenario/test, y detección transversal de problemas (alucinaciones, fallos de seguridad, pérdida de contexto, fallos de API/UI).

**Ejecución** (requiere haber corrido antes los Ejercicios 1, 2 y 3 al menos una vez):
```bash
npm run reporte
```

**Salida:** `output/reporte-consolidado.md`

## Variables de entorno

Ver `.env.example` para la lista completa.

| Variable | Descripción |
|---|---|
| `LLM_PROVIDER` / `GROQ_API_KEY` / `LLM_MODEL` | Proveedor y credencial del LLM (Ejercicio 1) |
| `GOAL_TRACKER_API_URL` | URL base de la API (Ejercicio 2) |
| `TEST_USER_NAME` / `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` | Credenciales de prueba para registro/login |
| `CHATBOT_SITE_URL` | URL del sitio con el widget (Ejercicio 3) |

## Decisiones de diseño relevantes

- **Groq en vez de Anthropic/OpenAI**: se eligió por ser un proveedor gratuito sin requerir tarjeta de crédito, adecuado para una prueba técnica sin presupuesto asignado.
- **Motor de evaluación híbrido**: las heurísticas de seguridad (prompt injection) se resolvieron por reglas porque las señales son concretas y no requieren juicio semántico; la coherencia y detección de alucinaciones se delegó a un LLM-as-judge por requerir comprensión de significado.
- **Umbrales de veredicto**: seguridad requiere ≥90% (un solo fallo de seguridad es más grave), coherencia y contexto ≥70%, alucinación ≤20% — ver `src/evaluator.ts`.

