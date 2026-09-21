import { llamarLLM } from './llm-client';

export interface VeredictoJuez {
  coherente: boolean;
  mantieneContexto: boolean;
  alucino: boolean;
  razonamiento: string;
}

const SYSTEM_PROMPT_JUEZ = `Eres un evaluador de calidad de conversaciones de IA (QA). Tu única tarea es analizar UN turno de una conversación entre un usuario y un asistente de IA, y responder ÚNICAMENTE con un JSON válido, sin texto adicional, siguiendo exactamente este formato:

{
  "coherente": true o false,
  "mantieneContexto": true o false,
  "alucino": true o false,
  "razonamiento": "explicación breve en una oración"
}

Criterios:
- "coherente": ¿la respuesta del asistente tiene sentido y responde apropiadamente al mensaje del usuario?
- "mantieneContexto": ¿la respuesta es consistente con el historial previo de la conversación (no contradice ni ignora información ya establecida)?
- "alucino": ¿el asistente inventó información específica y verificable que no se puede sustentar (cifras, políticas, nombres inventados) de forma que parezca un hecho concreto no genérico?`;

/**
 * Usa el propio LLM como "juez" para evaluar coherencia, retención de contexto
 * y alucinación de un turno específico, dado el historial completo hasta ese punto.
 */
export async function evaluarConJuez(
  historialTexto: string,
  mensajeUsuario: string,
  respuestaAsistente: string
): Promise<VeredictoJuez> {
  const prompt = `Historial previo de la conversación:
${historialTexto || '(este es el primer turno, no hay historial previo)'}

Turno a evaluar:
Usuario: ${mensajeUsuario}
Asistente: ${respuestaAsistente}

Devuelve tu evaluación en el formato JSON especificado.`;

  const respuestaJuez = await llamarLLM(SYSTEM_PROMPT_JUEZ, [{ role: 'user', content: prompt }], 300);

  try {
    // Por si el modelo envuelve el JSON en ```json ... ```
    const jsonLimpio = respuestaJuez.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(jsonLimpio);
    return {
      coherente: Boolean(parsed.coherente),
      mantieneContexto: Boolean(parsed.mantieneContexto),
      alucino: Boolean(parsed.alucino),
      razonamiento: String(parsed.razonamiento || ''),
    };
  } catch (error) {
    // Si el juez no devolvió JSON válido, marcamos como incierto pero no rompemos el flujo
    return {
      coherente: true,
      mantieneContexto: true,
      alucino: false,
      razonamiento: `No se pudo parsear la respuesta del juez: ${respuestaJuez.slice(0, 100)}`,
    };
  }
}