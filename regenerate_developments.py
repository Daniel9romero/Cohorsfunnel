import pandas as pd
import json
from pathlib import Path

# Complete city coordinates dictionary for Mexico
CITY_COORDS = {
    "Ciudad de México": (19.4326, -99.1332),
    "CDMX": (19.4326, -99.1332),
    "Mexico City": (19.4326, -99.1332),
    "Toluca": (19.2826, -99.6557),
    "Puebla": (19.0414, -98.2063),
    "Monterrey": (25.6866, -100.3161),
    "Chihuahua": (28.6353, -106.0889),
    "Torreón": (25.5428, -103.4068),
    "Torreon": (25.5428, -103.4068),
    "León": (21.1221, -101.6860),
    "Leon": (21.1221, -101.6860),
    "Oaxaca": (17.0732, -96.7266),
    "Mérida": (20.9674, -89.5926),
    "Merida": (20.9674, -89.5926),
    "Villahermosa": (17.9892, -92.9475),
    "Querétaro": (20.5888, -100.3899),
    "Queretaro": (20.5888, -100.3899),
    "Aguascalientes": (21.8853, -102.2916),
    "Guadalajara": (20.6597, -103.3496),
    "Tijuana": (32.5149, -117.0382),
    "Cancún": (21.1619, -86.8515),
    "Cancun": (21.1619, -86.8515),
    "San Luis Potosí": (22.1565, -100.9855),
    "Hermosillo": (29.0729, -110.9559),
    "Saltillo": (25.4267, -100.9924),
    "Culiacán": (24.8091, -107.3940),
    "Morelia": (19.7060, -101.1950),
    "Veracruz": (19.1738, -96.1342),
}

def get_coords(city_name):
    """Get coordinates for a city, with fuzzy matching"""
    if not city_name or pd.isna(city_name):
        return (23.6345, -102.5528)  # Center of Mexico

    city_str = str(city_name).strip()

    # Direct match
    if city_str in CITY_COORDS:
        return CITY_COORDS[city_str]

    # Case-insensitive match
    for key, coords in CITY_COORDS.items():
        if key.lower() == city_str.lower():
            return coords

    # Partial match
    for key, coords in CITY_COORDS.items():
        if key.lower() in city_str.lower() or city_str.lower() in key.lower():
            return coords

    print(f"Warning: No coordinates found for '{city_str}', using default")
    return (23.6345, -102.5528)

def main():
    # Paths
    excel_path = Path("backend/data/Datos_prueba_v3.xlsx")
    output_path = Path("frontend/public/data/developments.json")

    # Read Excel sheets
    print(f"Reading Excel from: {excel_path}")
    developments_df = pd.read_excel(excel_path, sheet_name=1)
    leads_df = pd.read_excel(excel_path, sheet_name=2)
    investment_df = pd.read_excel(excel_path, sheet_name=0)

    # Clean column names
    developments_df.columns = developments_df.columns.str.strip().str.lower().str.replace(' ', '_')
    leads_df.columns = leads_df.columns.str.strip().str.lower().str.replace(' ', '_')
    investment_df.columns = investment_df.columns.str.strip().str.lower().str.replace(' ', '_')

    print(f"Development columns: {list(developments_df.columns)}")
    print(f"Leads columns: {list(leads_df.columns)}")
    print(f"Investment columns: {list(investment_df.columns)}")

    # Find column names
    dev_name_col = 'desarrollo' if 'desarrollo' in developments_df.columns else developments_df.columns[0]
    city_col = next((c for c in developments_df.columns if 'ciudad' in c), None)
    region_col = next((c for c in developments_df.columns if 'region' in c or 'región' in c), None)

    # In leads
    leads_dev_col = next((c for c in leads_df.columns if 'desarrollo' in c), None)
    venta_col = next((c for c in leads_df.columns if 'venta' in c and 'bruta' in c), None)
    if not venta_col:
        venta_col = next((c for c in leads_df.columns if 'venta' in c), None)

    # In investment
    inv_dev_col = next((c for c in investment_df.columns if 'desarrollo' in c), None)
    inv_amount_col = next((c for c in investment_df.columns if 'inversion' in c or 'inversión' in c or 'monto' in c), None)

    print(f"\nUsing columns:")
    print(f"  Development name: {dev_name_col}")
    print(f"  City: {city_col}")
    print(f"  Region: {region_col}")
    print(f"  Leads desarrollo: {leads_dev_col}")
    print(f"  Venta: {venta_col}")
    print(f"  Investment desarrollo: {inv_dev_col}")
    print(f"  Investment amount: {inv_amount_col}")

    results = []

    for _, row in developments_df.iterrows():
        name = str(row[dev_name_col]) if dev_name_col else "Unknown"
        city = str(row[city_col]) if city_col and pd.notna(row[city_col]) else "Unknown"
        region = str(row[region_col]) if region_col and pd.notna(row[region_col]) else "Unknown"

        # Get coordinates from city
        lat, lng = get_coords(city)

        # Count leads and sales
        total_leads = 0
        total_sales = 0
        if leads_dev_col:
            dev_mask = leads_df[leads_dev_col] == name
            total_leads = int(dev_mask.sum())
            if venta_col:
                total_sales = int(leads_df.loc[dev_mask, venta_col].notna().sum())

        # Calculate investment
        total_investment = 0.0
        if inv_dev_col and inv_amount_col:
            dev_inv = investment_df[investment_df[inv_dev_col] == name]
            total_investment = float(dev_inv[inv_amount_col].sum())

        dev_data = {
            "name": name,
            "city": city,
            "region": region,
            "latitude": lat,
            "longitude": lng,
            "total_leads": total_leads,
            "total_sales": total_sales,
            "total_investment": round(total_investment, 2)
        }

        print(f"  {name}: {city} ({region}) -> ({lat}, {lng}) - {total_leads} leads, {total_sales} sales")
        results.append(dev_data)

    # Write JSON
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\nGenerated {output_path} with {len(results)} developments")

if __name__ == "__main__":
    main()
