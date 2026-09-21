import { consultaSimple } from './consulta-simple';
import { cambioDeTema } from './cambio-de-tema';
import { informacionAmbigua } from './informacion-ambigua';
import { memoriaConversacional } from './memoria-conversacional';
import { seguridadPromptInjection } from './seguridad-prompt-injection';
import { Escenario } from '../types';

export const escenarios: Escenario[] = [
  consultaSimple,
  cambioDeTema,
  informacionAmbigua,
  memoriaConversacional,
  seguridadPromptInjection,
];