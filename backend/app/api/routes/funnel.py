from fastapi import APIRouter, Query
from typing import Optional, List
from app.models.schemas import FunnelResponse, FunnelStageData, FilterParams, ConversionTrendResponse
from app.services.funnel_analysis import FunnelAnalysisService

router = APIRouter(prefix="/funnel", tags=["Funnel"])


@router.get("/", response_model=FunnelResponse)
async def get_funnel(
    desarrollos: Optional[str] = Query(None, description="Desarrollos separados por coma"),
    regiones: Optional[str] = Query(None, description="Regiones separadas por coma"),
    year: Optional[int] = Query(None, description="Año"),
    month: Optional[int] = Query(None, description="Mes (1-12)"),
    week_iso: Optional[int] = Query(None, description="Semana ISO"),
    date_from: Optional[str] = Query(None, description="Fecha inicio (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Fecha fin (YYYY-MM-DD)")
):
    """
    Retorna el funnel comercial con filtros opcionales.
    """
    # Construir filtros
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

    # Create fresh instance to ensure filters work
    service = FunnelAnalysisService()
    return service.calculate_funnel(filters)


@router.get("/trends", response_model=ConversionTrendResponse)
async def get_funnel_trends(
    desarrollos: Optional[str] = Query(None, description="Desarrollos separados por coma"),
    regiones: Optional[str] = Query(None, description="Regiones separadas por coma"),
    year: Optional[int] = Query(None, description="Año"),
    month: Optional[int] = Query(None, description="Mes (1-12)"),
    week_iso: Optional[int] = Query(None, description="Semana ISO"),
    date_from: Optional[str] = Query(None, description="Fecha inicio (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Fecha fin (YYYY-MM-DD)")
):
    """
    Retorna tendencia de conversiones por mes.
    Muestra el % de leads que alcanzaron cada etapa por periodo.
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

    service = FunnelAnalysisService()
    return service.calculate_trends(filters)
