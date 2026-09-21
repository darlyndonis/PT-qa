import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.LLM_MODEL || 'openai/gpt-oss-120b';

export interface MensajeAPI {
  role: 'user' | 'assistant';
  content: string;
}

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Envía el historial completo de la conversación al LLM y devuelve su respuesta.
 * Reintenta automáticamente ante errores de rate limit (429), con espera incremental.
 */
export async function llamarLLM(
  systemPrompt: string,
  historial: MensajeAPI[],
  maxTokens: number = 1024,
  intentos: number = 4
): Promise<string> {
  for (let intento = 1; intento <= intentos; intento++) {
    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'system', content: systemPrompt }, ...historial],
      });

      return response.choices[0]?.message?.content ?? '';
    } catch (error: any) {
      const esRateLimit = error?.status === 429;
      if (esRateLimit && intento < intentos) {
        const esperaMs = 3000 * intento; // espera creciente: 3s, 6s, 9s...
        console.log(`  ⏳ Rate limit alcanzado, reintentando en ${esperaMs / 1000}s (intento ${intento}/${intentos})...`);
        await esperar(esperaMs);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Se agotaron los reintentos tras errores de rate limit.');
}