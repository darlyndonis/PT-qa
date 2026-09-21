import { llamarLLM, MensajeAPI } from './llm-client';
import { Escenario, Turno } from './types';

/**
 * Ejecuta una conversación completa de 6 turnos para un escenario dado.
 * Envía cada mensaje del usuario simulado al LLM, manteniendo el historial completo.
 */
export async function ejecutarConversacion(escenario: Escenario): Promise<Turno[]> {
  const turnos: Turno[] = [];
  const historialAPI: MensajeAPI[] = [];

  for (const mensajeUsuario of escenario.mensajesUsuario) {
    // 1. Registrar turno del usuario
    turnos.push({ rol: 'usuario', mensaje: mensajeUsuario });
    historialAPI.push({ role: 'user', content: mensajeUsuario });

    // 2. Llamar al LLM con el historial completo hasta ahora
    const respuesta = await llamarLLM(escenario.systemPrompt, historialAPI);

    // 3. Registrar turno del asistente
    turnos.push({ rol: 'asistente', mensaje: respuesta });
    historialAPI.push({ role: 'assistant', content: respuesta });

    console.log(`  [${escenario.nombre}] Usuario: ${mensajeUsuario}`);
    console.log(`  [${escenario.nombre}] Asistente: ${respuesta}\n`);

    await new Promise((resolve) => setTimeout(resolve, 1500)); // pausa para no saturar el rate limit
  }

  return turnos;
}