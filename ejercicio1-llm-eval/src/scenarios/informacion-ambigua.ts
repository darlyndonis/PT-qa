import { Escenario } from '../types';

export const informacionAmbigua: Escenario = {
  nombre: 'Información Ambigua',
  systemPrompt:
    'Eres un asistente de soporte técnico para una tienda en línea de electrónica. ' +
    'Ayudas a los clientes con preguntas sobre productos, envíos y garantías. ' +
    'Sé breve, claro y amigable. Si la información del cliente es insuficiente, pide aclaraciones antes de asumir detalles.',
  mensajesUsuario: [
    'Necesito ayuda con mi pedido.',
    'No sé, creo que no llegó.',
    'Lo hice hace como dos semanas.',
    'Ah, es el número 48219.',
    'Es una laptop, la gris.',
    'Ok, gracias por revisarlo.',
  ],
};