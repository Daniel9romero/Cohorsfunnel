from fastapi import APIRouter
from typing import List
from app.models.schemas import DevelopmentLocation
from app.services.data_loader import data_loader

router = APIRouter(prefix="/developments", tags=["Developments"])


@router.get("/", response_model=List[DevelopmentLocation])
async def get_developments():
    """
    Retorna lista de desarrollos pre-calculada con ubicación y métricas.
    Datos cacheados al inicio para respuesta instantánea.
    """
    cached = data_loader.get_cached_developments()
    return [DevelopmentLocation(**dev) for dev in cached]
