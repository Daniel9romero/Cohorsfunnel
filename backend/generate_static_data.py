"""
Script para generar datos estaticos pre-calculados para GitHub Pages.

Este script procesa el archivo Excel y genera archivos JSON con todos los datos
necesarios para el dashboard, eliminando la necesidad de un backend en tiempo real.
"""

import pandas as pd
import json
from pathlib import Path
from datetime import datetime
import sys

# Agregar el directorio actual al path para importar modulos
sys.path.insert(0, str(Path(__file__).parent))

from app.services.data_loader import DataLoader

# Coordenadas de ciudades de Mexico
CITY_COORDINATES = {
    "Ciudad de México": (19.4326, -99.1332),
    "Ciudad de Mexico": (19.4326, -99.1332),
    "Toluca": (19.2826, -99.6557),
    "Puebla": (19.0414, -98.2063),
    "Monterrey": (25.6866, -100.3161),
    "Chihuahua": (28.6353, -106.0889),
    "Torreón": (25.5428, -103.4067),
    "Torreon": (25.5428, -103.4067),
    "León": (21.1250, -101.6860),
    "Leon": (21.1250, -101.6860),
    "Oaxaca": (17.0732, -96.7266),
    "Mérida": (20.9674, -89.5926),
    "Merida": (20.9674, -89.5926),
    "Villahermosa": (17.9892, -92.9475),
    "Querétaro": (20.5888, -100.3899),
    "Queretaro": (20.5888, -100.3899),
    "Aguascalientes": (21.8818, -102.2916),
    "Guadalajara": (20.6597, -103.3496),
    "Tijuana": (32.5149, -117.0382),
    "Cancún": (21.1619, -86.8515),
    "Cancun": (21.1619, -86.8515),
}

def generate_static_data():
    """Genera todos los archivos JSON estaticos necesarios."""

    print("=" * 60)
    print("GENERADOR DE DATOS ESTATICOS PARA GITHUB PAGES")
    print("=" * 60)

    # Cargar datos
    print("\n[1/6] Cargando datos desde Excel...")
    data_loader = DataLoader()

    leads_df = data_loader.leads
    investment_df = data_loader.investment
    developments_df = data_loader.developments

    print(f"    - Leads cargados: {len(leads_df):,}")
    print(f"    - Registros de inversion: {len(investment_df):,}")
    print(f"    - Desarrollos: {len(developments_df)}")

    # Crear directorio de salida
    output_dir = Path(__file__).parent.parent / "frontend" / "public" / "data"
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"\n[2/6] Directorio de salida: {output_dir}")

    # 1. Generar opciones de filtros
    print("\n[3/6] Generando opciones de filtros...")
    filter_options = generate_filter_options(leads_df, developments_df)
    save_json(output_dir / "filter-options.json", filter_options)

    # 2. Generar metricas globales y por filtro
    print("\n[4/6] Generando metricas...")
    metrics_data = generate_metrics(leads_df, investment_df, developments_df)
    save_json(output_dir / "metrics.json", metrics_data)

    # 3. Generar datos del funnel
    print("\n[5/6] Generando datos del funnel...")
    funnel_data = generate_funnel_data(leads_df, developments_df)
    save_json(output_dir / "funnel.json", funnel_data)

    # 4. Generar tendencias de conversion
    print("\n[6/6] Generando tendencias de conversion...")
    trends_data = generate_conversion_trends(leads_df, developments_df)
    save_json(output_dir / "trends.json", trends_data)

    # 5. Generar datos de desarrollos para el mapa
    print("\n[6/6] Generando datos de desarrollos...")
    developments_data = generate_developments_data(developments_df, leads_df, investment_df)
    save_json(output_dir / "developments.json", developments_data)

    print("\n" + "=" * 60)
    print("GENERACION COMPLETADA")
    print("=" * 60)
    print(f"\nArchivos generados en: {output_dir}")
    print("\nArchivos creados:")
    for f in output_dir.glob("*.json"):
        size = f.stat().st_size / 1024
        print(f"  - {f.name} ({size:.1f} KB)")


def normalize_string(s):
    """Normaliza string removiendo acentos y caracteres especiales."""
    import unicodedata
    if not isinstance(s, str):
        return str(s).lower()
    # Normalizar a NFD y remover diacriticos
    normalized = unicodedata.normalize('NFD', s)
    ascii_str = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
    return ascii_str.lower()


def find_column(df, possible_names):
    """Busca una columna por nombres posibles (insensible a acentos y mayusculas)."""
    for name in possible_names:
        name_normalized = normalize_string(name)
        for col in df.columns:
            col_normalized = normalize_string(col)
            if name_normalized in col_normalized:
                return col
    return None


def get_region_for_desarrollo(developments_df, desarrollo):
    """Obtiene la region para un desarrollo dado."""
    dev_name_col = find_column(developments_df, ['desarrollo'])
    region_col = None
    for col in developments_df.columns:
        col_clean = col.lower().replace('ó', 'o').replace('ö', 'o')
        if 'region' in col_clean:
            region_col = col
            break

    if dev_name_col and region_col:
        match = developments_df[developments_df[dev_name_col] == desarrollo]
        if len(match) > 0:
            return match[region_col].iloc[0]
    return None


def generate_filter_options(leads_df, developments_df):
    """Genera las opciones disponibles para filtros."""

    # Obtener desarrollos unicos
    desarrollo_col = find_column(leads_df, ['desarrollo', 'project'])
    desarrollos = sorted(leads_df[desarrollo_col].dropna().unique().tolist()) if desarrollo_col else []

    # Obtener regiones desde developments
    region_col = None
    for col in developments_df.columns:
        col_clean = col.lower().replace('ó', 'o').replace('ö', 'o')
        if 'region' in col_clean:
            region_col = col
            break
    regiones = sorted(developments_df[region_col].dropna().unique().tolist()) if region_col else []

    # Obtener anos y meses
    years = sorted(leads_df['year_iso'].dropna().unique().tolist()) if 'year_iso' in leads_df.columns else []
    months = list(range(1, 13))

    # Obtener semanas ISO en formato completo (2024-W01)
    weeks = sorted(leads_df['cohort_week'].dropna().unique().tolist()) if 'cohort_week' in leads_df.columns else []

    return {
        "desarrollos": desarrollos,
        "regiones": regiones,
        "years": [int(y) for y in years],
        "months": months,
        "weeks": weeks
    }


def calculate_metrics_for_filter(leads_df, investment_df, filter_key, filter_value):
    """Calcula metricas para un filtro especifico."""

    filtered_leads = leads_df.copy()
    filtered_investment = investment_df.copy()

    desarrollo_col = find_column(leads_df, ['desarrollo', 'project'])
    inv_desarrollo_col = find_column(investment_df, ['desarrollo', 'project'])

    if filter_key == "all":
        pass  # Sin filtro
    elif filter_key == "desarrollo" and desarrollo_col:
        filtered_leads = filtered_leads[filtered_leads[desarrollo_col] == filter_value]
        if inv_desarrollo_col:
            filtered_investment = filtered_investment[filtered_investment[inv_desarrollo_col] == filter_value]
    elif filter_key == "region" and desarrollo_col:
        filtered_leads = filtered_leads[filtered_leads['_region'] == filter_value]
        if inv_desarrollo_col:
            filtered_investment = filtered_investment[filtered_investment['_region'] == filter_value]
    elif filter_key == "year" and 'year_iso' in leads_df.columns:
        filtered_leads = filtered_leads[filtered_leads['year_iso'] == filter_value]
    elif filter_key == "week" and 'cohort_week' in leads_df.columns:
        filtered_leads = filtered_leads[filtered_leads['cohort_week'] == filter_value]

    # Calcular metricas
    total_leads = len(filtered_leads)

    contacto_col = find_column(filtered_leads, ['fecha_contacto', 'fecha_de_contacto'])
    cita_col = find_column(filtered_leads, ['fecha_cita', 'fecha_de_cita'])
    venta_col = find_column(filtered_leads, ['fecha_venta_bruta', 'fecha_de_venta_bruta', 'venta'])
    escritura_col = find_column(filtered_leads, ['fecha_escrituracion', 'fecha_de_escrituración'])

    total_contacts = int(filtered_leads[contacto_col].notna().sum()) if contacto_col else 0
    total_appointments = int(filtered_leads[cita_col].notna().sum()) if cita_col else 0
    total_gross_sales = int(filtered_leads[venta_col].notna().sum()) if venta_col else 0
    total_closings = int(filtered_leads[escritura_col].notna().sum()) if escritura_col else 0

    # Inversion
    inversion_col = find_column(filtered_investment, ['inversion', 'inversión', 'monto'])
    total_investment = float(filtered_investment[inversion_col].sum()) if inversion_col else 0.0

    # Costos
    cost_per_lead = total_investment / total_leads if total_leads > 0 else 0
    cost_per_contact = total_investment / total_contacts if total_contacts > 0 else 0
    cost_per_appointment = total_investment / total_appointments if total_appointments > 0 else 0
    cost_per_sale = total_investment / total_gross_sales if total_gross_sales > 0 else 0
    cost_per_closing = total_investment / total_closings if total_closings > 0 else 0

    # Conversiones
    conv_lead_contact = (total_contacts / total_leads * 100) if total_leads > 0 else 0
    conv_contact_appt = (total_appointments / total_contacts * 100) if total_contacts > 0 else 0
    conv_appt_sale = (total_gross_sales / total_appointments * 100) if total_appointments > 0 else 0
    conv_sale_closing = (total_closings / total_gross_sales * 100) if total_gross_sales > 0 else 0
    overall_conv = (total_closings / total_leads * 100) if total_leads > 0 else 0

    return {
        "total_investment": round(total_investment, 2),
        "total_leads": total_leads,
        "total_contacts": total_contacts,
        "total_appointments": total_appointments,
        "total_gross_sales": total_gross_sales,
        "total_closings": total_closings,
        "cost_per_lead": round(cost_per_lead, 2),
        "cost_per_contact": round(cost_per_contact, 2),
        "cost_per_appointment": round(cost_per_appointment, 2),
        "cost_per_sale": round(cost_per_sale, 2),
        "cost_per_closing": round(cost_per_closing, 2),
        "conversion_lead_to_contact": round(conv_lead_contact, 2),
        "conversion_contact_to_appointment": round(conv_contact_appt, 2),
        "conversion_appointment_to_sale": round(conv_appt_sale, 2),
        "conversion_sale_to_closing": round(conv_sale_closing, 2),
        "overall_conversion": round(overall_conv, 2)
    }


def generate_metrics(leads_df, investment_df, developments_df):
    """Genera metricas pre-calculadas para todas las combinaciones de filtros."""

    # Agregar columna de region a leads e investment
    desarrollo_col = find_column(leads_df, ['desarrollo', 'project'])
    inv_desarrollo_col = find_column(investment_df, ['desarrollo', 'project'])

    leads_df['_region'] = leads_df[desarrollo_col].apply(
        lambda x: get_region_for_desarrollo(developments_df, x)
    ) if desarrollo_col else None

    if inv_desarrollo_col:
        investment_df['_region'] = investment_df[inv_desarrollo_col].apply(
            lambda x: get_region_for_desarrollo(developments_df, x)
        )

    metrics = {}

    # Metricas globales
    print("    - Calculando metricas globales...")
    metrics["all"] = calculate_metrics_for_filter(leads_df, investment_df, "all", None)

    # Por region
    print("    - Calculando metricas por region...")
    metrics["by_region"] = {}
    for region in leads_df['_region'].dropna().unique():
        metrics["by_region"][region] = calculate_metrics_for_filter(
            leads_df, investment_df, "region", region
        )

    # Por desarrollo
    print("    - Calculando metricas por desarrollo...")
    metrics["by_desarrollo"] = {}
    if desarrollo_col:
        for desarrollo in leads_df[desarrollo_col].dropna().unique():
            metrics["by_desarrollo"][desarrollo] = calculate_metrics_for_filter(
                leads_df, investment_df, "desarrollo", desarrollo
            )

    # Por ano
    print("    - Calculando metricas por ano...")
    metrics["by_year"] = {}
    if 'year_iso' in leads_df.columns:
        for year in leads_df['year_iso'].dropna().unique():
            metrics["by_year"][str(int(year))] = calculate_metrics_for_filter(
                leads_df, investment_df, "year", year
            )

    # Por semana ISO
    print("    - Calculando metricas por semana ISO...")
    metrics["by_week"] = {}
    if 'cohort_week' in leads_df.columns:
        weeks = sorted(leads_df['cohort_week'].dropna().unique().tolist())
        for week in weeks:
            metrics["by_week"][week] = calculate_metrics_for_filter(
                leads_df, investment_df, "week", week
            )

    return metrics


def calculate_funnel_for_filter(leads_df, filter_key, filter_value):
    """Calcula datos del funnel para un filtro (acumulativo - cada etapa requiere las anteriores)."""

    filtered = leads_df.copy()
    desarrollo_col = find_column(leads_df, ['desarrollo', 'project'])

    if filter_key == "region":
        filtered = filtered[filtered['_region'] == filter_value]
    elif filter_key == "desarrollo" and desarrollo_col:
        filtered = filtered[filtered[desarrollo_col] == filter_value]
    elif filter_key == "year" and 'year_iso' in leads_df.columns:
        filtered = filtered[filtered['year_iso'] == filter_value]
    elif filter_key == "week" and 'cohort_week' in leads_df.columns:
        filtered = filtered[filtered['cohort_week'] == filter_value]

    total_leads = len(filtered)

    contacto_col = find_column(filtered, ['fecha_contacto', 'fecha_de_contacto'])
    cita_col = find_column(filtered, ['fecha_cita', 'fecha_de_cita'])
    venta_col = find_column(filtered, ['fecha_venta_bruta', 'fecha_de_venta_bruta'])
    escritura_col = find_column(filtered, ['fecha_escrituracion', 'fecha_de_escrituración'])

    # Calcular de forma ACUMULATIVA - cada etapa requiere las anteriores
    # Contacto: tiene fecha de contacto
    has_contacto = filtered[contacto_col].notna() if contacto_col else pd.Series([False] * len(filtered))

    # Cita: tiene contacto Y cita
    has_cita = has_contacto & (filtered[cita_col].notna() if cita_col else False)

    # Venta: tiene contacto Y cita Y venta
    has_venta = has_cita & (filtered[venta_col].notna() if venta_col else False)

    # Escrituracion: tiene todo el proceso completo
    has_escritura = has_venta & (filtered[escritura_col].notna() if escritura_col else False)

    count_contacto = int(has_contacto.sum())
    count_cita = int(has_cita.sum())
    count_venta = int(has_venta.sum())
    count_escritura = int(has_escritura.sum())

    stages = [
        {"stage": "lead", "stage_label": "Lead", "count": total_leads},
        {"stage": "contacto", "stage_label": "Contacto", "count": count_contacto},
        {"stage": "cita", "stage_label": "Cita", "count": count_cita},
        {"stage": "venta_bruta", "stage_label": "Venta Bruta", "count": count_venta},
        {"stage": "escrituracion", "stage_label": "Escrituracion", "count": count_escritura},
    ]

    # Calcular porcentajes
    for i, stage in enumerate(stages):
        stage["percentage_of_total"] = round(
            (stage["count"] / total_leads * 100) if total_leads > 0 else 0, 2
        )
        if i == 0:
            stage["conversion_from_previous"] = 100.0
        else:
            prev_count = stages[i-1]["count"]
            stage["conversion_from_previous"] = round(
                (stage["count"] / prev_count * 100) if prev_count > 0 else 0, 2
            )

    return {"stages": stages, "total_leads": total_leads}


def generate_funnel_data(leads_df, developments_df):
    """Genera datos del funnel para todas las combinaciones."""

    desarrollo_col = find_column(leads_df, ['desarrollo', 'project'])
    leads_df['_region'] = leads_df[desarrollo_col].apply(
        lambda x: get_region_for_desarrollo(developments_df, x)
    ) if desarrollo_col else None

    funnel = {}

    # Global
    funnel["all"] = calculate_funnel_for_filter(leads_df, "all", None)

    # Por region
    funnel["by_region"] = {}
    for region in leads_df['_region'].dropna().unique():
        funnel["by_region"][region] = calculate_funnel_for_filter(leads_df, "region", region)

    # Por desarrollo
    funnel["by_desarrollo"] = {}
    if desarrollo_col:
        for desarrollo in leads_df[desarrollo_col].dropna().unique():
            funnel["by_desarrollo"][desarrollo] = calculate_funnel_for_filter(
                leads_df, "desarrollo", desarrollo
            )

    # Por ano
    funnel["by_year"] = {}
    if 'year_iso' in leads_df.columns:
        for year in leads_df['year_iso'].dropna().unique():
            funnel["by_year"][str(int(year))] = calculate_funnel_for_filter(
                leads_df, "year", year
            )

    # Por semana ISO
    print("    - Calculando funnel por semana ISO...")
    funnel["by_week"] = {}
    if 'cohort_week' in leads_df.columns:
        weeks = sorted(leads_df['cohort_week'].dropna().unique().tolist())
        for week in weeks:
            funnel["by_week"][week] = calculate_funnel_for_filter(
                leads_df, "week", week
            )

    return funnel


def calculate_trends_for_filter(leads_df, filter_key=None, filter_value=None):
    """Calcula tendencias de conversion por mes."""

    filtered = leads_df.copy()
    desarrollo_col = find_column(leads_df, ['desarrollo', 'project'])

    if filter_key == "region":
        filtered = filtered[filtered['_region'] == filter_value]
    elif filter_key == "desarrollo" and desarrollo_col:
        filtered = filtered[filtered[desarrollo_col] == filter_value]
    elif filter_key == "year" and 'year_iso' in leads_df.columns:
        filtered = filtered[filtered['year_iso'] == filter_value]

    date_col = find_column(filtered, ['fecha_registro', 'fecha_de_registro'])
    if not date_col:
        return {"data": [], "period_type": "month"}

    filtered['_period'] = filtered[date_col].dt.to_period('M').astype(str)

    contacto_col = find_column(filtered, ['fecha_contacto', 'fecha_de_contacto'])
    cita_col = find_column(filtered, ['fecha_cita', 'fecha_de_cita'])
    venta_col = find_column(filtered, ['fecha_venta_bruta', 'fecha_de_venta_bruta'])
    escritura_col = find_column(filtered, ['fecha_escrituracion', 'fecha_de_escrituración'])

    trends = []
    for period in sorted(filtered['_period'].unique()):
        period_df = filtered[filtered['_period'] == period]
        total = len(period_df)

        if total > 0:
            contacto = int(period_df[contacto_col].notna().sum()) if contacto_col else 0
            cita = int(period_df[cita_col].notna().sum()) if cita_col else 0
            venta = int(period_df[venta_col].notna().sum()) if venta_col else 0
            escritura = int(period_df[escritura_col].notna().sum()) if escritura_col else 0

            trends.append({
                "period": period,
                "leads": total,
                "contacto": round(contacto / total * 100, 2),
                "cita": round(cita / total * 100, 2),
                "venta_bruta": round(venta / total * 100, 2),
                "escrituracion": round(escritura / total * 100, 2)
            })

    return {"data": trends, "period_type": "month"}


def generate_conversion_trends(leads_df, developments_df):
    """Genera tendencias para todas las combinaciones."""

    desarrollo_col = find_column(leads_df, ['desarrollo', 'project'])
    leads_df['_region'] = leads_df[desarrollo_col].apply(
        lambda x: get_region_for_desarrollo(developments_df, x)
    ) if desarrollo_col else None

    trends = {}

    # Global
    trends["all"] = calculate_trends_for_filter(leads_df)

    # Por region
    trends["by_region"] = {}
    for region in leads_df['_region'].dropna().unique():
        trends["by_region"][region] = calculate_trends_for_filter(leads_df, "region", region)

    # Por desarrollo
    print("    - Calculando tendencias por desarrollo...")
    trends["by_desarrollo"] = {}
    if desarrollo_col:
        for desarrollo in leads_df[desarrollo_col].dropna().unique():
            trends["by_desarrollo"][desarrollo] = calculate_trends_for_filter(leads_df, "desarrollo", desarrollo)

    # Por ano
    print("    - Calculando tendencias por ano...")
    trends["by_year"] = {}
    if 'year_iso' in leads_df.columns:
        for year in leads_df['year_iso'].dropna().unique():
            trends["by_year"][str(int(year))] = calculate_trends_for_filter(leads_df, "year", year)

    return trends


def get_city_coordinates(city_name):
    """Obtiene coordenadas de una ciudad desde el diccionario o busca coincidencias parciales."""
    if not city_name:
        return (23.6345, -102.5528)  # Centro de Mexico por defecto

    # Buscar exacto
    if city_name in CITY_COORDINATES:
        return CITY_COORDINATES[city_name]

    # Buscar normalizado
    city_normalized = normalize_string(city_name)
    for city, coords in CITY_COORDINATES.items():
        if normalize_string(city) == city_normalized:
            return coords

    # Buscar parcial
    for city, coords in CITY_COORDINATES.items():
        if city_normalized in normalize_string(city) or normalize_string(city) in city_normalized:
            return coords

    return (23.6345, -102.5528)  # Centro de Mexico por defecto


def generate_developments_data(developments_df, leads_df, investment_df):
    """Genera datos de desarrollos para el mapa."""

    dev_name_col = find_column(developments_df, ['desarrollo'])
    city_col = find_column(developments_df, ['ciudad', 'city'])
    region_col = None
    for col in developments_df.columns:
        col_clean = normalize_string(col)
        if 'region' in col_clean:
            region_col = col
            break
    lat_col = find_column(developments_df, ['latitud', 'latitude', 'lat'])
    lon_col = find_column(developments_df, ['longitud', 'longitude', 'lng', 'lon'])

    lead_dev_col = find_column(leads_df, ['desarrollo', 'project'])
    venta_col = find_column(leads_df, ['fecha_venta_bruta', 'fecha_de_venta_bruta'])
    escritura_col = find_column(leads_df, ['fecha_escrituracion', 'fecha_de_escrituración'])
    inv_dev_col = find_column(investment_df, ['desarrollo', 'project'])
    inv_col = find_column(investment_df, ['inversion', 'inversión', 'monto'])

    developments = []
    for _, row in developments_df.iterrows():
        dev_name = row[dev_name_col] if dev_name_col else ""
        city = row[city_col] if city_col else ""

        # Contar leads y ventas
        dev_leads = leads_df[leads_df[lead_dev_col] == dev_name] if lead_dev_col else pd.DataFrame()
        total_leads = len(dev_leads)
        total_sales = int(dev_leads[venta_col].notna().sum()) if venta_col and len(dev_leads) > 0 else 0

        # Contar escrituraciones (closings)
        total_closings = int(dev_leads[escritura_col].notna().sum()) if escritura_col and len(dev_leads) > 0 else 0

        # Calcular tasa de conversion Lead -> Escrituracion
        conversion_rate = round((total_closings / total_leads * 100), 2) if total_leads > 0 else 0

        # Sumar inversion
        dev_inv = investment_df[investment_df[inv_dev_col] == dev_name] if inv_dev_col else pd.DataFrame()
        total_inv = float(dev_inv[inv_col].sum()) if inv_col and len(dev_inv) > 0 else 0

        # Obtener coordenadas - primero del Excel, si no de la ciudad
        lat = None
        lon = None
        if lat_col and pd.notna(row.get(lat_col)):
            lat = float(row[lat_col])
        if lon_col and pd.notna(row.get(lon_col)):
            lon = float(row[lon_col])

        # Si no hay coordenadas en Excel, usar coordenadas de la ciudad
        if lat is None or lon is None or (lat == 0 and lon == 0):
            lat, lon = get_city_coordinates(city)

        developments.append({
            "name": dev_name,
            "city": city,
            "region": row[region_col] if region_col else "",
            "latitude": lat,
            "longitude": lon,
            "total_leads": total_leads,
            "total_sales": total_sales,
            "total_closings": total_closings,
            "conversion_rate": conversion_rate,
            "total_investment": round(total_inv, 2)
        })

    return developments


def save_json(filepath, data):
    """Guarda datos en formato JSON."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"    -> Guardado: {filepath.name}")


if __name__ == "__main__":
    generate_static_data()
