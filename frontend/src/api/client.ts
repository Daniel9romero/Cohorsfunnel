import type {
  FilterState,
  FilterOptions,
  CohortHeatmapData,
  FunnelResponse,
  MetricsResponse,
  DevelopmentLocation,
  ConversionTrendResponse
} from '../types';

const API_BASE = 'http://localhost:8001/api/v1';

// Convierte FilterState a query params
function filtersToParams(filters: FilterState): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.desarrollos.length > 0) {
    params.desarrollos = filters.desarrollos.join(',');
  }
  if (filters.regiones.length > 0) {
    params.regiones = filters.regiones.join(',');
  }
  if (filters.year) {
    params.year = String(filters.year);
  }
  if (filters.month) {
    params.month = String(filters.month);
  }
  if (filters.weekIso) {
    params.week_iso = filters.weekIso;
  }

  return params;
}

async function fetchAPI<T>(endpoint: string, filters?: FilterState, signal?: AbortSignal): Promise<T> {
  let url = `${API_BASE}${endpoint}`;

  if (filters) {
    const params = filtersToParams(filters);
    const queryString = new URLSearchParams(params).toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export const fetchFilterOptions = async (): Promise<FilterOptions> => {
  return fetchAPI<FilterOptions>('/filters/options');
};

export const fetchCohortHeatmap = async (
  filters: FilterState,
  stage: string = 'contacto'
): Promise<CohortHeatmapData> => {
  const params = filtersToParams(filters);
  const queryString = new URLSearchParams({ ...params, stage }).toString();

  const response = await fetch(`${API_BASE}/cohorts/heatmap/?${queryString}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  return response.json();
};

export const fetchFunnel = async (filters: FilterState): Promise<FunnelResponse> => {
  return fetchAPI<FunnelResponse>('/funnel/', filters);
};

export const fetchMetrics = async (filters: FilterState, signal?: AbortSignal): Promise<MetricsResponse> => {
  return fetchAPI<MetricsResponse>('/metrics/', filters, signal);
};

export const fetchDevelopments = async (): Promise<DevelopmentLocation[]> => {
  return fetchAPI<DevelopmentLocation[]>('/developments/');
};

export const fetchConversionTrends = async (filters: FilterState): Promise<ConversionTrendResponse> => {
  return fetchAPI<ConversionTrendResponse>('/funnel/trends', filters);
};
