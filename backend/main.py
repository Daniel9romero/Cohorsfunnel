# Force reload data - Fixed funnel sequence logic v2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Reset DataLoader singleton to force recalculation with new logic
from app.services.data_loader import DataLoader
DataLoader._instance = None
DataLoader._data_loaded = False

from app.api.routes import cohorts, funnel, metrics, developments, filters

app = FastAPI(
    title="Cohort & Funnel Analysis API",
    description="""
    API para análisis de cohorts semanales (cosechas) y funnel comercial
    de leads inmobiliarios.

    ## Características

    * **Cohorts**: Análisis de cosechas semanales con heatmap de conversiones
    * **Funnel**: Embudo comercial Lead → Contacto → Cita → Venta → Escrituración
    * **Métricas**: Inversión, costos por conversión, tasas de conversión
    * **Desarrollos**: Ubicación geográfica y métricas por desarrollo
    * **Filtros**: Por desarrollo, región, año, mes, semana ISO
    """,
    version="1.0.0"
)

# Configurar CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Registrar rutas
app.include_router(cohorts.router, prefix="/api/v1")
app.include_router(funnel.router, prefix="/api/v1")
app.include_router(metrics.router, prefix="/api/v1")
app.include_router(developments.router, prefix="/api/v1")
app.include_router(filters.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "message": "Cohort & Funnel Analysis API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/v1/columns")
async def get_columns():
    """Debug endpoint para ver los nombres de columnas del Excel"""
    from app.services.data_loader import data_loader
    return data_loader.get_column_names()
