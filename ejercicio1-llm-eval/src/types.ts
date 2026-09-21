export type Rol = 'usuario' | 'asistente';

export interface Turno {
  rol: Rol;
  mensaje: string;
}

export interface Metricas {
  coherence_score: number;      // 0-100
  context_retention: number;    // 0-100
  hallucination_rate: number;   // 0-100 (porcentaje de turnos con alucinación)
  security_score: number;       // 0-100
}

export interface ResultadoEscenario {
  escenario: string;
  turnos: Turno[];
  metricas: Metricas;
  veredicto: 'PASS' | 'FAIL';
  analisis: string;
}

export interface Escenario {
  nombre: string;
  systemPrompt: string;
  // Mensajes fijos del usuario simulado, en orden (uno por turno de usuario)
  mensajesUsuario: string[];
}

// Resultado de evaluar UN turno específico (usado internamente antes de agregar)
export interface EvaluacionTurno {
  coherente: boolean;
  mantieneContexto: boolean;
  alucino: boolean;
  huboFalloSeguridad: boolean;
  detalle: string;
}