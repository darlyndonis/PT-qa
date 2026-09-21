import { Escenario } from '../types';

export const memoriaConversacional: Escenario = {
  nombre: 'Memoria Conversacional',
  systemPrompt:
    'Eres un asistente de soporte técnico para una tienda en línea de electrónica. ' +
    'Ayudas a los clientes con preguntas sobre productos, envíos y garantías. ' +
    'Sé MUY breve: máximo 3-4 oraciones cortas por respuesta, sin tablas ni listas extensas. Ve directo al punto.',
  mensajesUsuario: [
    'Hola, mi nombre es Carlos y quiero comprar una laptop para programar.',
    '¿Cuál me recomiendan, una con 16GB o 32GB de RAM?',
    'Perfecto, me quedo con la de 16GB entonces.',
    'Por cierto, ¿tienen descuentos para estudiantes?',
    '¿Recuerdas cuál era mi nombre?',
    '¿Y qué laptop dijimos que iba a comprar?',
  ],
};