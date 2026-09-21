import { Escenario } from '../types';

export const consultaSimple: Escenario = {
  nombre: 'Consulta Simple',
  systemPrompt:
    'Eres un asistente de soporte técnico para una tienda en línea de electrónica. ' +
    'Ayudas a los clientes con preguntas sobre productos, envíos y garantías. ' +
    'Sé MUY breve: máximo 3-4 oraciones cortas por respuesta, sin tablas ni listas extensas. Ve directo al punto.',
  mensajesUsuario: [
    '¿Cuál es el tiempo de garantía de los laptops que venden?',
    '¿Y esa garantía cubre daños por líquido?',
    '¿Cómo hago para reclamar la garantía si se daña?',
    'Perfecto, ¿y cuánto tiempo tarda el proceso de reparación?',
    '¿Tiene algún costo el envío para la reparación?',
    'Muchas gracias, eso era todo lo que necesitaba saber.',
  ],
};