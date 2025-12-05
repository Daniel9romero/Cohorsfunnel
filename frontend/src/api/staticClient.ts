/**
 * Cliente de datos estaticos para GitHub Pages
 *
 * Este cliente lee datos pre-calculados desde archivos JSON estaticos,
 * eliminando la necesidad de un backend en tiempo real.
 *
 * Los datos son generados por el script generate_static_data.py
 */

import type {
  FilterState,
  FilterOptions,
  FunnelResponse,
  MetricsResponse,
  DevelopmentLocation,
  ConversionTrendResponse
} from '../types';

// Cache para evitar cargar los mismos datos multiples veces
const dataCache: Record<string, any> = {};

/**
 * Carga un archivo JSON con cache
 */
async function loadJSON<T>(filename: string): Promise<T> {
  if (dataCache[filename]) {
    return dataCache[filename] as T;
  }

  const response = await fetch(`${import.meta.env.BASE_URL}data/${filename}`);
  if (!response.ok) {
    throw new Error(`Error cargando ${filename}: ${response.status}`);
  }

  const data = await response.json();
  dataCache[filename] = data;
  return data as T;
}

/**
 * Genera una clave de filtro basada en el estado actual
 */
function getFilterKey(filters: FilterState): { type: string; value: string } | null {
  // Prioridad: weekIso > region > desarrollo > year > all
  if (filters.weekIso) {
    return { type: 'by_week', value: filters.weekIso };
  }
  if (filters.regiones.length === 1) {
    return { type: 'by_region', value: filters.regiones[0] };
  }
  if (filters.desarrollos.length === 1) {
    return { type: 'by_desarrollo', value: filters.desarrollos[0] };
  }
  if (filters.year) {
    return { type: 'by_year', value: String(filters.year) };
  }
  return null;
}

/**
 * Obtiene datos filtrados de un objeto de metricas/funnel
 */
function getFilteredData<T>(data: any, filters: FilterState, defaultKey: string = 'all'): T {
  const filterKey = getFilterKey(filters);

  if (!filterKey) {
    return data[defaultKey];
  }

  const subset = data[filterKey.type];
  if (subset && subset[filterKey.value]) {
    return subset[filterKey.value];
  }

  // Fallback a datos globales si no hay datos para el filtro
  return data[defaultKey];
}

// ============================================================================
// API PUBLICA
// ============================================================================

/**
 * Obtiene las opciones disponibles para los filtros
 */
export const fetchFilterOptions = async (): Promise<FilterOptions> => {
  return loadJSON<FilterOptions>('filter-options.json');
};

/**
 * Obtiene metricas filtradas
 */
export const fetchMetrics = async (
  filters: FilterState,
  _signal?: AbortSignal
): Promise<MetricsResponse> => {
  const allMetrics = await loadJSON<any>('metrics.json');
  return getFilteredData<MetricsResponse>(allMetrics, filters);
};

/**
 * Obtiene datos del funnel filtrados
 */
export const fetchFunnel = async (filters: FilterState): Promise<FunnelResponse> => {
  const allFunnel = await loadJSON<any>('funnel.json');
  return getFilteredData<FunnelResponse>(allFunnel, filters);
};

/**
 * Obtiene tendencias de conversion filtradas
 */
export const fetchConversionTrends = async (
  filters: FilterState
): Promise<ConversionTrendResponse> => {
  const allTrends = await loadJSON<any>('trends.json');
  return getFilteredData<ConversionTrendResponse>(allTrends, filters);
};

/**
 * Obtiene datos de desarrollos para el mapa
 */
export const fetchDevelopments = async (): Promise<DevelopmentLocation[]> => {
  return loadJSON<DevelopmentLocation[]>('developments.json');
};

/**
 * Para compatibilidad - el heatmap de cohortes no se usa en la version actual
 */
export const fetchCohortHeatmap = async (
  _filters: FilterState,
  _stage: string = 'contacto'
): Promise<any> => {
  // El heatmap fue reemplazado por la grafica de tendencias
  console.warn('fetchCohortHeatmap: Esta funcion esta obsoleta');
  return { cohort_labels: [], week_labels: [], matrix: [], stage: _stage };
};
