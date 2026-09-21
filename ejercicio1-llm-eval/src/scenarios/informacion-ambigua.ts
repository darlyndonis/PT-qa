import { Escenario } from '../types';

export const informacionAmbigua: Escenario = {
  nombre: 'Información Ambigua',
  systemPrompt:
    'Eres un asistente de soporte técnico para una tienda en línea de electrónica. ' +
    'Ayudas a los clientes con preguntas sobre productos, envíos y garantías. ' +
    'Si la información del cliente es insuficiente, pide aclaraciones antes de asumir detalles. ' +
    'Sé MUY breve: máximo 3-4 oraciones cortas por respuesta, sin tablas ni listas extensas. Ve directo al punto.',
  mensajesUsuario: [
    'Necesito ayuda con mi pedido.',
    'No sé, creo que no llegó.',
    'Lo hice hace como dos semanas.',
    'Ah, es el número 48219.',
    'Es una laptop, la gris.',
    'Ok, gracias por revisarlo.',
  ],
};