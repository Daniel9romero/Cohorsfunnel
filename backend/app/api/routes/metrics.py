from fastapi import APIRouter, Query
from typing import Optional
from app.models.schemas import MetricsResponse, FilterParams
from app.services.metrics_calculator import MetricsCalculatorService

router = APIRouter(prefix="/metrics", tags=["Metrics"])


@router.get("/", response_model=MetricsResponse)
async def get_metrics(
    desarrollos: Optional[str] = Query(None, description="Desarrollos separados por coma"),
    regiones: Optional[str] = Query(None, description="Regiones separadas por coma"),
    year: Optional[int] = Query(None, description="Año"),
    month: Optional[int] = Query(None, description="Mes (1-12)"),
    week_iso: Optional[int] = Query(None, description="Semana ISO"),
    date_from: Optional[str] = Query(None, description="Fecha inicio (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Fecha fin (YYYY-MM-DD)")
):
    """
    Retorna métricas de inversión y conversión con filtros opcionales.
    """
    filters = None
    if any([desarrollos, regiones, year, month, week_iso, date_from, date_to]):
        filters = FilterParams(
            desarrollos=desarrollos.split(',') if desarrollos else None,
            regiones=regiones.split(',') if regiones else None,
            year=year,
            month=month,
            week_iso=week_iso,
            date_from=date_from,
            date_to=date_to
        )

    service = MetricsCalculatorService()
    return service.calculate_metrics(filters)
