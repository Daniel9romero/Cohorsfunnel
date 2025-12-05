from fastapi import APIRouter
from typing import List
from app.models.schemas import FilterParams, CohortData, CohortHeatmapData
from app.services.cohort_analysis import cohort_service

router = APIRouter(prefix="/cohorts", tags=["Cohorts"])


@router.post("/", response_model=List[CohortData])
async def get_cohort_analysis(filters: FilterParams = None):
    """
    Retorna análisis de cohorts semanales.
    Cada cohort representa una "cosecha" semanal de leads
    y su progresión a través del funnel en semanas subsiguientes.
    """
    return cohort_service.calculate_cohorts(filters)


@router.post("/heatmap", response_model=CohortHeatmapData)
async def get_cohort_heatmap(filters: FilterParams = None, stage: str = "contacto"):
    """
    Retorna datos formateados para heatmap de una etapa específica.

    - **filters**: Filtros opcionales (desarrollo, región, año, mes, semana)
    - **stage**: Etapa del funnel (contacto, cita, venta_bruta, escrituracion)
    """
    return cohort_service.get_heatmap_data(filters, stage)


@router.get("/heatmap", response_model=CohortHeatmapData)
async def get_cohort_heatmap_get(stage: str = "contacto"):
    """
    GET endpoint para heatmap (sin filtros).
    """
    return cohort_service.get_heatmap_data(None, stage)
