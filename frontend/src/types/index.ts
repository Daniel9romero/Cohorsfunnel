// Filter types
export interface FilterState {
  desarrollos: string[];
  regiones: string[];
  year: number | null;
  month: number | null;
  weekIso: string | null;
}

export interface FilterOptions {
  desarrollos: string[];
  regiones: string[];
  years: number[];
  months: number[];
  weeks: string[];
}

// Cohort types
export interface CohortData {
  cohort_week: string;
  initial_leads: number;
  conversions: Record<string, Record<number, number>>;
}

export interface CohortHeatmapData {
  cohort_labels: string[];
  week_labels: number[];
  matrix: (number | null)[][];
  stage: string;
}

// Funnel types
export interface FunnelStageData {
  stage: string;
  stage_label: string;
  count: number;
  percentage_of_total: number;
  conversion_from_previous: number;
}

export interface FunnelResponse {
  stages: FunnelStageData[];
  total_leads: number;
}

// Metrics types
export interface MetricsResponse {
  total_investment: number;
  total_leads: number;
  total_contacts: number;
  total_appointments: number;
  total_gross_sales: number;
  total_closings: number;
  cost_per_lead: number;
  cost_per_contact: number;
  cost_per_appointment: number;
  cost_per_sale: number;
  cost_per_closing: number;
  conversion_lead_to_contact: number;
  conversion_contact_to_appointment: number;
  conversion_appointment_to_sale: number;
  conversion_sale_to_closing: number;
  overall_conversion: number;
}

// Development types
export interface DevelopmentLocation {
  name: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  total_leads: number;
  total_sales: number;
  total_closings: number;
  conversion_rate: number;
  total_investment: number;
}

export type FunnelStage = 'contacto' | 'cita' | 'venta_bruta' | 'escrituracion';

// Conversion Trend types
export interface ConversionTrendPoint {
  period: string;
  leads: number;
  contacto: number;
  cita: number;
  venta_bruta: number;
  escrituracion: number;
}

export interface ConversionTrendResponse {
  data: ConversionTrendPoint[];
  period_type: string;
}
