import pandas as pd
from typing import List, Optional
from app.models.schemas import FilterParams, FunnelResponse, FunnelStageData, ConversionTrendResponse, ConversionTrendPoint
from app.services.data_loader import data_loader


class FunnelAnalysisService:
    STAGE_CONFIG = [
        {
            'stage': 'lead',
            'label': 'Lead',
            'columns': ['fecha_registro', 'fecha_de_registro', 'registro']
        },
        {
            'stage': 'contacto',
            'label': 'Contacto',
            'columns': ['fecha_contacto', 'fecha_de_contacto', 'contacto']
        },
        {
            'stage': 'cita',
            'label': 'Cita',
            'columns': ['fecha_cita', 'fecha_de_cita', 'cita'],
            'requires': 'contacto'
        },
        {
            'stage': 'venta_bruta',
            'label': 'Venta Bruta',
            'columns': ['fecha_venta_bruta', 'fecha_de_venta_bruta', 'venta_bruta', 'venta'],
            'requires': 'cita'
        },
        {
            'stage': 'escrituracion',
            'label': 'Escrituracion',
            'columns': ['fecha_escrituracion', 'fecha_de_escrituración', 'escrituracion', 'escrituración'],
            'requires': 'venta_bruta'
        }
    ]

    def __init__(self):
        self.df = data_loader.leads
        self._stage_columns = {}
        for config in self.STAGE_CONFIG:
            col = self._find_column(config['columns'])
            self._stage_columns[config['stage']] = col

    def _find_column(self, possible_names: List[str]) -> Optional[str]:
        for name in possible_names:
            for col in self.df.columns:
                if name in col.lower():
                    return col
        return None

    def _apply_filters(self, df: pd.DataFrame, filters: FilterParams) -> pd.DataFrame:
        if filters is None:
            return df

        desarrollo_col = self._find_column(['desarrollo', 'project', 'proyecto'])

        if filters.desarrollos:
            if desarrollo_col:
                df = df[df[desarrollo_col].isin(filters.desarrollos)]

        if filters.regiones:
            # Region is in developments table, need to lookup which desarrollos belong to region
            developments_df = data_loader.developments
            region_col = None
            for col in developments_df.columns:
                # Handle encoding issues: check for various forms of "region"
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
                # Get desarrollos that match the selected regions
                matching_desarrollos = developments_df[
                    developments_df[region_col].isin(filters.regiones)
                ][dev_name_col].tolist()
                df = df[df[desarrollo_col].isin(matching_desarrollos)]

        if filters.year:
            df = df[df['year_iso'] == filters.year]

        if filters.month:
            date_col = self._find_column(['fecha_registro', 'fecha_de_registro'])
            if date_col and date_col in df.columns:
                df = df[df[date_col].dt.month == filters.month]

        if filters.week_iso:
            df = df[df['week_iso'] == filters.week_iso]

        if filters.date_from or filters.date_to:
            date_col = self._find_column(['fecha_registro', 'fecha_de_registro'])
            if date_col and date_col in df.columns:
                if filters.date_from:
                    df = df[df[date_col] >= pd.Timestamp(filters.date_from)]
                if filters.date_to:
                    df = df[df[date_col] <= pd.Timestamp(filters.date_to)]

        return df

    def calculate_funnel(self, filters: Optional[FilterParams] = None) -> FunnelResponse:
        df = self._apply_filters(self.df.copy(), filters)

        total_leads = len(df)
        if total_leads == 0:
            return FunnelResponse(stages=[], total_leads=0)

        stages = []
        previous_count = total_leads
        cumulative_mask = pd.Series([True] * len(df), index=df.index)

        for stage_config in self.STAGE_CONFIG:
            stage = stage_config['stage']
            label = stage_config['label']
            col = self._stage_columns.get(stage)

            if stage == 'lead':
                count = total_leads
            else:
                if col and col in df.columns:
                    # La etapa actual requiere tener fecha no nula
                    stage_mask = df[col].notna()

                    # Si esta etapa requiere una etapa previa, combinar mascaras
                    requires = stage_config.get('requires')
                    if requires:
                        req_col = self._stage_columns.get(requires)
                        if req_col and req_col in df.columns:
                            # Solo contar si tambien tiene la etapa anterior
                            cumulative_mask = cumulative_mask & df[req_col].notna()

                    # Contar leads que cumplen con la secuencia hasta esta etapa
                    count = int((stage_mask & cumulative_mask).sum())

                    # Actualizar mascara acumulativa para la siguiente etapa
                    cumulative_mask = cumulative_mask & stage_mask
                else:
                    count = 0

            percentage_of_total = round((count / total_leads * 100), 2) if total_leads > 0 else 0
            conversion_from_previous = round((count / previous_count * 100), 2) if previous_count > 0 else 0

            stages.append(FunnelStageData(
                stage=stage,
                stage_label=label,
                count=count,
                percentage_of_total=percentage_of_total,
                conversion_from_previous=conversion_from_previous
            ))

            previous_count = count if count > 0 else previous_count

        return FunnelResponse(stages=stages, total_leads=total_leads)

    def calculate_trends(self, filters: Optional[FilterParams] = None) -> ConversionTrendResponse:
        """Calcula tendencia de conversiones por mes"""
        df = self._apply_filters(self.df.copy(), filters)

        if df.empty:
            return ConversionTrendResponse(data=[], period_type="monthly")

        # Obtener columna de fecha de registro
        date_col = self._find_column(['fecha_registro', 'fecha_de_registro'])
        if not date_col or date_col not in df.columns:
            return ConversionTrendResponse(data=[], period_type="monthly")

        # Crear columna de periodo (año-mes)
        df['period'] = df[date_col].dt.to_period('M').astype(str)

        # Agrupar por periodo
        grouped = df.groupby('period')

        results = []
        for period, group in grouped:
            total = len(group)
            if total == 0:
                continue

            # Calcular conversiones para cada etapa
            contacto_count = 0
            cita_count = 0
            venta_count = 0
            escrituracion_count = 0

            # Contacto
            col = self._stage_columns.get('contacto')
            if col and col in group.columns:
                contacto_count = group[col].notna().sum()

            # Cita (requiere contacto)
            col_cita = self._stage_columns.get('cita')
            col_contacto = self._stage_columns.get('contacto')
            if col_cita and col_cita in group.columns:
                if col_contacto and col_contacto in group.columns:
                    cita_count = (group[col_cita].notna() & group[col_contacto].notna()).sum()
                else:
                    cita_count = group[col_cita].notna().sum()

            # Venta (requiere cita)
            col_venta = self._stage_columns.get('venta_bruta')
            if col_venta and col_venta in group.columns:
                if col_cita and col_cita in group.columns:
                    venta_count = (group[col_venta].notna() & group[col_cita].notna()).sum()
                else:
                    venta_count = group[col_venta].notna().sum()

            # Escrituración (requiere venta)
            col_escr = self._stage_columns.get('escrituracion')
            if col_escr and col_escr in group.columns:
                if col_venta and col_venta in group.columns:
                    escrituracion_count = (group[col_escr].notna() & group[col_venta].notna()).sum()
                else:
                    escrituracion_count = group[col_escr].notna().sum()

            results.append(ConversionTrendPoint(
                period=str(period),
                leads=total,
                contacto=round(contacto_count / total * 100, 1) if total > 0 else 0,
                cita=round(cita_count / total * 100, 1) if total > 0 else 0,
                venta_bruta=round(venta_count / total * 100, 1) if total > 0 else 0,
                escrituracion=round(escrituracion_count / total * 100, 1) if total > 0 else 0
            ))

        # Ordenar por periodo
        results.sort(key=lambda x: x.period)

        return ConversionTrendResponse(data=results, period_type="monthly")


funnel_service = FunnelAnalysisService()
