import { Escenario } from '../types';

export const cambioDeTema: Escenario = {
  nombre: 'Cambio de Tema',
  systemPrompt:
    'Eres un asistente de soporte técnico para una tienda en línea de electrónica. ' +
    'Ayudas a los clientes con preguntas sobre productos, envíos y garantías. ' +
    'Sé breve, claro y amigable.',
  mensajesUsuario: [
    '¿Qué diferencia hay entre una laptop con SSD y una con disco duro tradicional?',
    'Entiendo, ¿y cuál me recomiendan para diseño gráfico?',
    'Cambiando de tema, ¿tienen servicio de reparación de celulares?',
    '¿Cuánto cuesta cambiar una pantalla de iPhone?',
    '¿Y ese servicio tiene garantía también?',
    'Perfecto, muchas gracias por la info.',
  ],
};