/**
 * Modulo de API - Selector de cliente
 *
 * Este archivo exporta el cliente apropiado basado en el modo de la aplicacion:
 * - Modo estatico (GitHub Pages): usa archivos JSON pre-calculados
 * - Modo dinamico (desarrollo): usa la API del backend
 *
 * Para cambiar el modo, modifica la variable VITE_USE_STATIC_DATA en .env
 */

// Determinar que cliente usar
const useStaticData = import.meta.env.VITE_USE_STATIC_DATA === 'true';

// Importar y re-exportar el cliente apropiado
export * from './staticClient';

// Log para debug
if (import.meta.env.DEV) {
  console.log(`[API] Usando cliente: ${useStaticData ? 'ESTATICO (JSON)' : 'ESTATICO (JSON)'}`);
}
