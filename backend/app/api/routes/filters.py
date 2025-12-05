from fastapi import APIRouter
from app.models.schemas import FilterOptions
from app.services.data_loader import data_loader

router = APIRouter(prefix="/filters", tags=["Filters"])


@router.get("/options", response_model=FilterOptions)
async def get_filter_options():
    """
    Retorna las opciones disponibles para los filtros del dashboard.
    """
    leads_df = data_loader.leads
    developments_df = data_loader.developments

    # Obtener desarrollos únicos
    desarrollos = []
    for col in leads_df.columns:
        if 'desarrollo' in col.lower():
            desarrollos = sorted(leads_df[col].dropna().unique().tolist())
            break

    if not desarrollos:
        for col in developments_df.columns:
            if 'desarrollo' in col.lower() or 'nombre' in col.lower():
                desarrollos = sorted(developments_df[col].dropna().unique().tolist())
                break

    # Obtener regiones únicas
    regiones = []
    for col in developments_df.columns:
        if 'region' in col.lower() or 'región' in col.lower():
            regiones = sorted(developments_df[col].dropna().unique().tolist())
            break

    if not regiones:
        regiones = ["Norte", "Centro", "Sur"]

    # Obtener años únicos
    years = []
    if 'year_iso' in leads_df.columns:
        years = sorted([int(y) for y in leads_df['year_iso'].dropna().unique()])

    # Obtener meses únicos
    months = list(range(1, 13))

    # Obtener semanas únicas
    weeks = []
    if 'cohort_week' in leads_df.columns:
        weeks = sorted(leads_df['cohort_week'].dropna().unique().tolist())

    return FilterOptions(
        desarrollos=[str(d) for d in desarrollos],
        regiones=[str(r) for r in regiones],
        years=years,
        months=months,
        weeks=[str(w) for w in weeks]
    )
