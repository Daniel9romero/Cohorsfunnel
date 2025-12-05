import pandas as pd
from typing import List, Optional
from app.models.schemas import FilterParams, MetricsResponse
from app.services.data_loader import data_loader


class MetricsCalculatorService:
    def __init__(self):
        self.leads_df = data_loader.leads
        self.investment_df = data_loader.investment

    def _find_column(self, df: pd.DataFrame, possible_names: List[str]) -> Optional[str]:
        for name in possible_names:
            for col in df.columns:
                if name in col.lower():
                    return col
        return None

    def _apply_filters_leads(self, df: pd.DataFrame, filters: FilterParams) -> pd.DataFrame:
        if filters is None:
            return df

        desarrollo_col = self._find_column(df, ['desarrollo', 'project', 'proyecto'])

        # Filtrar por desarrollo
        if filters.desarrollos:
            if desarrollo_col:
                df = df[df[desarrollo_col].isin(filters.desarrollos)]

        # Filtrar por región (a través de la tabla de desarrollos)
        if filters.regiones:
            developments_df = data_loader.developments
            region_col = None
            for col in developments_df.columns:
                col_clean = col.lower().replace('ó', 'o').replace('ö', 'o')
                if 'region' in col_clean or 'regi' in col_clean:
                    region_col = col
                    break
            dev_name_col = None
            for col in developments_df.columns:
                if 'desarrollo' in col.lower():
                    dev_name_col = col
                    break

            if region_col and dev_name_col and desarrollo_col:
                matching_desarrollos = developments_df[
                    developments_df[region_col].isin(filters.regiones)
                ][dev_name_col].tolist()
                df = df[df[desarrollo_col].isin(matching_desarrollos)]

        # Filtrar por año
        if filters.year and 'year_iso' in df.columns:
            df = df[df['year_iso'] == filters.year]

        # Filtrar por mes
        if filters.month:
            date_col = self._find_column(df, ['fecha_registro', 'fecha_de_registro'])
            if date_col and date_col in df.columns:
                df = df[df[date_col].dt.month == filters.month]

        # Filtrar por rango de fechas
        if filters.date_from or filters.date_to:
            date_col = self._find_column(df, ['fecha_registro', 'fecha_de_registro'])
            if date_col and date_col in df.columns:
                if filters.date_from:
                    df = df[df[date_col] >= pd.Timestamp(filters.date_from)]
                if filters.date_to:
                    df = df[df[date_col] <= pd.Timestamp(filters.date_to)]

        return df

    def _apply_filters_investment(self, df: pd.DataFrame, filters: FilterParams) -> pd.DataFrame:
        if filters is None:
            return df

        # Filtrar por desarrollo
        if filters.desarrollos:
            desarrollo_col = self._find_column(df, ['desarrollo', 'project', 'proyecto'])
            if desarrollo_col:
                df = df[df[desarrollo_col].isin(filters.desarrollos)]

        # Filtrar por fecha
        date_col = self._find_column(df, ['fecha', 'date'])
        if date_col and date_col in df.columns:
            if filters.year:
                df = df[df[date_col].dt.year == filters.year]
            if filters.month:
                df = df[df[date_col].dt.month == filters.month]
            if filters.date_from:
                df = df[df[date_col] >= pd.Timestamp(filters.date_from)]
            if filters.date_to:
                df = df[df[date_col] <= pd.Timestamp(filters.date_to)]

        return df

    def calculate_metrics(self, filters: Optional[FilterParams] = None) -> MetricsResponse:
        leads_df = self._apply_filters_leads(self.leads_df.copy(), filters)
        investment_df = self._apply_filters_investment(self.investment_df.copy(), filters)

        # Conteos
        total_leads = len(leads_df)

        # Buscar columnas de cada etapa
        contacto_col = self._find_column(leads_df, ['fecha_contacto', 'fecha_de_contacto'])
        cita_col = self._find_column(leads_df, ['fecha_cita', 'fecha_de_cita'])
        venta_col = self._find_column(leads_df, ['fecha_venta_bruta', 'fecha_de_venta_bruta', 'venta'])
        escritura_col = self._find_column(leads_df, ['fecha_escrituracion', 'fecha_de_escrituración', 'escrituración'])

        total_contacts = int(leads_df[contacto_col].notna().sum()) if contacto_col else 0
        total_appointments = int(leads_df[cita_col].notna().sum()) if cita_col else 0
        total_gross_sales = int(leads_df[venta_col].notna().sum()) if venta_col else 0
        total_closings = int(leads_df[escritura_col].notna().sum()) if escritura_col else 0

        # Inversión total
        inversion_col = self._find_column(investment_df, ['inversion', 'inversión', 'monto', 'amount'])
        total_investment = float(investment_df[inversion_col].sum()) if inversion_col else 0.0

        # Costos por conversión
        cost_per_lead = total_investment / total_leads if total_leads > 0 else 0
        cost_per_contact = total_investment / total_contacts if total_contacts > 0 else 0
        cost_per_appointment = total_investment / total_appointments if total_appointments > 0 else 0
        cost_per_sale = total_investment / total_gross_sales if total_gross_sales > 0 else 0
        cost_per_closing = total_investment / total_closings if total_closings > 0 else 0

        # Tasas de conversión
        conversion_lead_to_contact = (total_contacts / total_leads * 100) if total_leads > 0 else 0
        conversion_contact_to_appointment = (total_appointments / total_contacts * 100) if total_contacts > 0 else 0
        conversion_appointment_to_sale = (total_gross_sales / total_appointments * 100) if total_appointments > 0 else 0
        conversion_sale_to_closing = (total_closings / total_gross_sales * 100) if total_gross_sales > 0 else 0
        overall_conversion = (total_closings / total_leads * 100) if total_leads > 0 else 0

        return MetricsResponse(
            total_investment=round(total_investment, 2),
            total_leads=total_leads,
            total_contacts=total_contacts,
            total_appointments=total_appointments,
            total_gross_sales=total_gross_sales,
            total_closings=total_closings,
            cost_per_lead=round(cost_per_lead, 2),
            cost_per_contact=round(cost_per_contact, 2),
            cost_per_appointment=round(cost_per_appointment, 2),
            cost_per_sale=round(cost_per_sale, 2),
            cost_per_closing=round(cost_per_closing, 2),
            conversion_lead_to_contact=round(conversion_lead_to_contact, 2),
            conversion_contact_to_appointment=round(conversion_contact_to_appointment, 2),
            conversion_appointment_to_sale=round(conversion_appointment_to_sale, 2),
            conversion_sale_to_closing=round(conversion_sale_to_closing, 2),
            overall_conversion=round(overall_conversion, 2)
        )


metrics_service = MetricsCalculatorService()
