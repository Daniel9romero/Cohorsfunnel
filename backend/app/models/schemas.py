from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date
from enum import Enum


class Region(str, Enum):
    NORTE = "Norte"
    CENTRO = "Centro"
    SUR = "Sur"


class FunnelStage(str, Enum):
    LEAD = "lead"
    CONTACTO = "contacto"
    CITA = "cita"
    VENTA_BRUTA = "venta_bruta"
    ESCRITURACION = "escrituracion"


# Request Schemas
class FilterParams(BaseModel):
    desarrollos: Optional[List[str]] = None
    regiones: Optional[List[str]] = None
    year: Optional[int] = None
    month: Optional[int] = None
    week_iso: Optional[int] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None


# Response Schemas
class CohortCell(BaseModel):
    cohort_week: str
    weeks_since_cohort: int
    stage: str
    count: int
    percentage: float


class CohortData(BaseModel):
    cohort_week: str
    initial_leads: int
    conversions: Dict[str, Dict[int, float]]  # stage -> {week: percentage}


class CohortHeatmapData(BaseModel):
    cohort_labels: List[str]
    week_labels: List[int]
    matrix: List[List[Optional[float]]]
    stage: str


class FunnelStageData(BaseModel):
    stage: str
    stage_label: str
    count: int
    percentage_of_total: float
    conversion_from_previous: float


class FunnelResponse(BaseModel):
    stages: List[FunnelStageData]
    total_leads: int


class MetricsResponse(BaseModel):
    total_investment: float
    total_leads: int
    total_contacts: int
    total_appointments: int
    total_gross_sales: int
    total_closings: int
    cost_per_lead: float
    cost_per_contact: float
    cost_per_appointment: float
    cost_per_sale: float
    cost_per_closing: float
    conversion_lead_to_contact: float
    conversion_contact_to_appointment: float
    conversion_appointment_to_sale: float
    conversion_sale_to_closing: float
    overall_conversion: float


class DevelopmentLocation(BaseModel):
    name: str
    city: str
    region: str
    latitude: float
    longitude: float
    total_leads: int
    total_sales: int
    total_investment: float


class FilterOptions(BaseModel):
    desarrollos: List[str]
    regiones: List[str]
    years: List[int]
    months: List[int]
    weeks: List[str]


class ConversionTrendPoint(BaseModel):
    period: str  # "2024-01", "2024-02", etc.
    leads: int
    contacto: float
    cita: float
    venta_bruta: float
    escrituracion: float


class ConversionTrendResponse(BaseModel):
    data: List[ConversionTrendPoint]
    period_type: str  # "monthly" or "weekly"
