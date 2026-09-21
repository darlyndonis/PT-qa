import fs from 'fs';
import path from 'path';
import { escenarios } from './src/scenarios';
import { evaluarEscenario } from './src/evaluator';

const OUTPUT_DIR = path.resolve(__dirname, '../output/ejercicio1');

function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') 
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Ejecutando ${escenarios.length} escenario(s)...\n`);

  const resultadosGlobales = [];

  for (const escenario of escenarios) {
    console.log(`\n=== Escenario: ${escenario.nombre} ===\n`);

    const resultado = await evaluarEscenario(escenario);
    resultadosGlobales.push(resultado);

    const nombreArchivo = `${slugify(escenario.nombre)}.json`;
    const rutaArchivo = path.join(OUTPUT_DIR, nombreArchivo);

    fs.writeFileSync(rutaArchivo, JSON.stringify(resultado, null, 2), 'utf-8');

    console.log(`\n✔ Resultado guardado en: ${rutaArchivo}`);
    console.log(`  Veredicto: ${resultado.veredicto}`);
    console.log(`  Métricas:`, resultado.metricas);
  }

  console.log(`\n\n=== Resumen final ===`);
  console.log(`Total de escenarios evaluados: ${resultadosGlobales.length}`);
  console.log(`PASS: ${resultadosGlobales.filter((r) => r.veredicto === 'PASS').length}`);
  console.log(`FAIL: ${resultadosGlobales.filter((r) => r.veredicto === 'FAIL').length}`);
}

main().catch((error) => {
  console.error('Error ejecutando la evaluación:', error);
  process.exit(1);
});