import pandas as pd
from pathlib import Path
from typing import Optional
import numpy as np

# Coordenadas aproximadas de ciudades mexicanas
CITY_COORDINATES = {
    "Monterrey": (25.6866, -100.3161),
    "Guadalajara": (20.6597, -103.3496),
    "Ciudad de México": (19.4326, -99.1332),
    "CDMX": (19.4326, -99.1332),
    "Tijuana": (32.5149, -117.0382),
    "León": (21.1221, -101.6860),
    "Puebla": (19.0414, -98.2063),
    "Querétaro": (20.5888, -100.3899),
    "Mérida": (20.9674, -89.5926),
    "Cancún": (21.1619, -86.8515),
    "San Luis Potosí": (22.1565, -100.9855),
    "Aguascalientes": (21.8853, -102.2916),
    "Chihuahua": (28.6353, -106.0889),
    "Hermosillo": (29.0729, -110.9559),
    "Torreón": (25.5428, -103.4068),
    "Saltillo": (25.4267, -100.9924),
    "Culiacán": (24.8091, -107.3940),
    "Morelia": (19.7060, -101.1950),
    "Toluca": (19.2826, -99.6557),
    "Veracruz": (19.1738, -96.1342),
}


class DataLoader:
    _instance = None
    _data_loaded = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not DataLoader._data_loaded:
            self._leads_df: Optional[pd.DataFrame] = None
            self._investment_df: Optional[pd.DataFrame] = None
            self._developments_df: Optional[pd.DataFrame] = None
            # Pre-calculated metrics cache
            self._cached_metrics = None
            self._cached_funnel = None
            self._cached_developments_list = None
            self._load_data()
            self._precalculate_all()
            DataLoader._data_loaded = True

    def _get_data_path(self) -> Path:
        current_dir = Path(__file__).parent.parent.parent
        data_path = current_dir / "data" / "Datos_prueba_v3.xlsx"
        if not data_path.exists():
            raise FileNotFoundError(f"Excel file not found at {data_path}")
        return data_path

    def _load_data(self):
        try:
            data_path = self._get_data_path()
            print(f"Loading data from: {data_path}")

            excel_file = pd.ExcelFile(data_path)
            print(f"Available sheets: {excel_file.sheet_names}")

            self._investment_df = pd.read_excel(data_path, sheet_name=0)
            self._developments_df = pd.read_excel(data_path, sheet_name=1)
            self._leads_df = pd.read_excel(data_path, sheet_name=2)

            self._clean_data()
            self._add_geolocation()
            self._calculate_cohort_weeks()

            print(f"Loaded {len(self._leads_df)} leads")
            print(f"Loaded {len(self._investment_df)} investment records")
            print(f"Loaded {len(self._developments_df)} developments")

        except Exception as e:
            print(f"Error loading data: {e}")
            raise

    def _clean_data(self):
        for df in [self._leads_df, self._investment_df, self._developments_df]:
            if df is not None:
                df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')

        for col in self._leads_df.columns:
            if any(dc in col for dc in ['fecha', 'date']):
                self._leads_df[col] = pd.to_datetime(self._leads_df[col], errors='coerce')

        for col in self._investment_df.columns:
            if any(dc in col for dc in ['fecha', 'date']):
                self._investment_df[col] = pd.to_datetime(self._investment_df[col], errors='coerce')

    def _add_geolocation(self):
        if self._developments_df is None:
            return

        city_col = None
        for col in self._developments_df.columns:
            if 'ciudad' in col or 'city' in col:
                city_col = col
                break

        if city_col:
            coords = self._developments_df[city_col].apply(
                lambda x: CITY_COORDINATES.get(str(x).strip(), (23.6345, -102.5528))
            )
            self._developments_df['latitude'] = coords.apply(lambda x: x[0])
            self._developments_df['longitude'] = coords.apply(lambda x: x[1])
        else:
            self._developments_df['latitude'] = 23.6345
            self._developments_df['longitude'] = -102.5528

    def _calculate_cohort_weeks(self):
        if self._leads_df is None:
            return

        date_col = None
        for col in self._leads_df.columns:
            if 'registro' in col:
                date_col = col
                break

        if date_col is None:
            for col in self._leads_df.columns:
                if pd.api.types.is_datetime64_any_dtype(self._leads_df[col]):
                    date_col = col
                    break

        if date_col:
            self._leads_df['fecha_registro_normalized'] = self._leads_df[date_col]
            valid_dates = self._leads_df['fecha_registro_normalized'].notna()

            # Vectorized ISO calendar calculation
            dates = self._leads_df.loc[valid_dates, 'fecha_registro_normalized']
            iso_cal = dates.dt.isocalendar()

            self._leads_df['year_iso'] = np.nan
            self._leads_df['week_iso'] = np.nan
            self._leads_df.loc[valid_dates, 'year_iso'] = iso_cal.year.values
            self._leads_df.loc[valid_dates, 'week_iso'] = iso_cal.week.values

            # Vectorized cohort_week creation
            mask = self._leads_df['year_iso'].notna()
            self._leads_df['cohort_week'] = None
            self._leads_df.loc[mask, 'cohort_week'] = (
                self._leads_df.loc[mask, 'year_iso'].astype(int).astype(str) +
                '-W' +
                self._leads_df.loc[mask, 'week_iso'].astype(int).astype(str).str.zfill(2)
            )

    def _precalculate_all(self):
        """Pre-calculate all metrics at startup for fast responses"""
        print("Pre-calculating metrics...")

        # Pre-calculate funnel
        self._cached_funnel = self._calculate_funnel_internal()

        # Pre-calculate metrics
        self._cached_metrics = self._calculate_metrics_internal()

        # Pre-calculate developments list
        self._cached_developments_list = self._calculate_developments_internal()

        print("Pre-calculation complete!")

    def _calculate_funnel_internal(self):
        leads = self._leads_df
        total = len(leads)

        # Find relevant columns
        contacto_col = venta_col = cita_col = escritura_col = None
        for col in leads.columns:
            col_lower = col.lower()
            if 'contacto' in col_lower and contacto_col is None:
                contacto_col = col
            if 'cita' in col_lower and cita_col is None:
                cita_col = col
            if 'venta' in col_lower and escritura_col is None:
                venta_col = col
            if 'escritur' in col_lower:
                escritura_col = col

        # Calculate funnel respecting the sequence:
        # Lead -> Contacto -> Cita -> Venta -> Escrituración
        # Each stage requires having passed the previous stage

        # Contacto: must have fecha_contacto
        has_contacto = leads[contacto_col].notna() if contacto_col else pd.Series([False] * total)
        contacts = int(has_contacto.sum())

        # Cita: must have fecha_cita AND fecha_contacto (can't have appointment without contact)
        has_cita = leads[cita_col].notna() if cita_col else pd.Series([False] * total)
        appointments = int((has_cita & has_contacto).sum())

        # Venta: must have fecha_venta AND fecha_cita AND fecha_contacto
        has_venta = leads[venta_col].notna() if venta_col else pd.Series([False] * total)
        sales = int((has_venta & has_cita & has_contacto).sum())

        # Escrituración: must have all previous stages
        has_escritura = leads[escritura_col].notna() if escritura_col else pd.Series([False] * total)
        closings = int((has_escritura & has_venta & has_cita & has_contacto).sum())

        return {
            'total_leads': total,
            'contacts': contacts,
            'appointments': appointments,
            'sales': sales,
            'closings': closings
        }

    def _calculate_metrics_internal(self):
        funnel = self._cached_funnel

        # Calculate total investment
        inv_col = None
        for col in self._investment_df.columns:
            if 'inversion' in col.lower() or 'inversión' in col.lower() or 'monto' in col.lower():
                inv_col = col
                break

        total_inv = float(self._investment_df[inv_col].sum()) if inv_col else 0.0

        total = funnel['total_leads']
        contacts = funnel['contacts']
        appointments = funnel['appointments']
        sales = funnel['sales']
        closings = funnel['closings']

        return {
            'total_investment': round(total_inv, 2),
            'total_leads': total,
            'total_contacts': contacts,
            'total_appointments': appointments,
            'total_gross_sales': sales,
            'total_closings': closings,
            'cost_per_lead': round(total_inv / total, 2) if total > 0 else 0,
            'cost_per_contact': round(total_inv / contacts, 2) if contacts > 0 else 0,
            'cost_per_appointment': round(total_inv / appointments, 2) if appointments > 0 else 0,
            'cost_per_sale': round(total_inv / sales, 2) if sales > 0 else 0,
            'cost_per_closing': round(total_inv / closings, 2) if closings > 0 else 0,
            'conversion_lead_to_contact': round(contacts / total * 100, 2) if total > 0 else 0,
            'conversion_contact_to_appointment': round(appointments / contacts * 100, 2) if contacts > 0 else 0,
            'conversion_appointment_to_sale': round(sales / appointments * 100, 2) if appointments > 0 else 0,
            'conversion_sale_to_closing': round(closings / sales * 100, 2) if sales > 0 else 0,
            'overall_conversion': round(closings / total * 100, 2) if total > 0 else 0
        }

    def _calculate_developments_internal(self):
        developments_df = self._developments_df
        leads_df = self._leads_df
        investment_df = self._investment_df

        dev_name_col = city_col = region_col = None
        for col in developments_df.columns:
            if 'desarrollo' in col.lower() or 'nombre' in col.lower():
                dev_name_col = col
            if 'ciudad' in col.lower():
                city_col = col
            if 'region' in col.lower() or 'región' in col.lower():
                region_col = col

        if not dev_name_col:
            dev_name_col = developments_df.columns[0]

        # Find leads desarrollo column
        leads_dev_col = None
        for col in leads_df.columns:
            if 'desarrollo' in col.lower():
                leads_dev_col = col
                break

        # Find venta column
        venta_col = None
        for col in leads_df.columns:
            if 'venta' in col.lower():
                venta_col = col
                break

        # Find investment desarrollo column
        inv_dev_col = inv_col = None
        for col in investment_df.columns:
            if 'desarrollo' in col.lower():
                inv_dev_col = col
            if 'inversion' in col.lower() or 'inversión' in col.lower() or 'monto' in col.lower():
                inv_col = col

        results = []
        for _, row in developments_df.iterrows():
            name = str(row[dev_name_col]) if dev_name_col else "Unknown"
            city = str(row[city_col]) if city_col else "Unknown"
            region = str(row[region_col]) if region_col else "Unknown"
            lat = float(row['latitude']) if 'latitude' in row else 23.6345
            lng = float(row['longitude']) if 'longitude' in row else -102.5528

            total_leads = 0
            total_sales = 0
            if leads_dev_col:
                dev_mask = leads_df[leads_dev_col] == name
                total_leads = int(dev_mask.sum())
                if venta_col:
                    total_sales = int(leads_df.loc[dev_mask, venta_col].notna().sum())

            total_investment = 0.0
            if inv_dev_col and inv_col:
                dev_inv = investment_df[investment_df[inv_dev_col] == name]
                total_investment = float(dev_inv[inv_col].sum())

            results.append({
                'name': name,
                'city': city,
                'region': region,
                'latitude': lat,
                'longitude': lng,
                'total_leads': total_leads,
                'total_sales': total_sales,
                'total_investment': round(total_investment, 2)
            })

        return results

    # Public properties - return cached data, no copying
    @property
    def leads(self) -> pd.DataFrame:
        return self._leads_df if self._leads_df is not None else pd.DataFrame()

    @property
    def investment(self) -> pd.DataFrame:
        return self._investment_df if self._investment_df is not None else pd.DataFrame()

    @property
    def developments(self) -> pd.DataFrame:
        return self._developments_df if self._developments_df is not None else pd.DataFrame()

    # Fast cached getters
    def get_cached_metrics(self):
        return self._cached_metrics

    def get_cached_funnel(self):
        return self._cached_funnel

    def get_cached_developments(self):
        return self._cached_developments_list

    def get_column_names(self) -> dict:
        return {
            'leads': list(self._leads_df.columns) if self._leads_df is not None else [],
            'investment': list(self._investment_df.columns) if self._investment_df is not None else [],
            'developments': list(self._developments_df.columns) if self._developments_df is not None else []
        }


# Singleton instance
data_loader = DataLoader()
