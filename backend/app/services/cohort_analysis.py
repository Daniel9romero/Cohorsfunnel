import pandas as pd
import numpy as np
from typing import List, Dict, Optional
from datetime import datetime
from app.models.schemas import FilterParams, CohortData, CohortHeatmapData
from app.services.data_loader import data_loader


class CohortAnalysisService:
    STAGE_COLUMNS = {
        'contacto': ['fecha_contacto', 'fecha_de_contacto', 'contacto'],
        'cita': ['fecha_cita', 'fecha_de_cita', 'cita'],
        'venta_bruta': ['fecha_venta_bruta', 'fecha_de_venta_bruta', 'venta_bruta', 'venta'],
        'escrituracion': ['fecha_escrituracion', 'fecha_de_escrituración', 'escrituracion', 'escrituración']
    }

    def __init__(self):
        self.df = data_loader.leads
        self._cached_cohorts: Optional[List[CohortData]] = None
        self._cached_heatmaps: Dict[str, CohortHeatmapData] = {}
        self._stage_cols: Dict[str, Optional[str]] = {}

        # Pre-identificar columnas
        for stage in self.STAGE_COLUMNS:
            self._stage_cols[stage] = self._get_stage_column(stage)

        # Pre-calcular al inicializar
        self._precalculate_fast()

    def _find_column(self, possible_names: List[str]) -> Optional[str]:
        for name in possible_names:
            for col in self.df.columns:
                if name in col.lower():
                    return col
        return None

    def _get_stage_column(self, stage: str) -> Optional[str]:
        possible_names = self.STAGE_COLUMNS.get(stage, [stage])
        return self._find_column(possible_names)

    def _week_to_timestamp(self, week_str: str) -> pd.Timestamp:
        try:
            year, week = week_str.split('-W')
            dt = datetime.strptime(f'{year}-W{week}-1', '%Y-W%W-%w')
            return pd.Timestamp(dt)
        except:
            return pd.Timestamp.now()

    def _precalculate_fast(self):
        """Pre-calcula todos los cohorts usando operaciones vectorizadas"""
        print("Pre-calculating cohorts (fast mode)...")

        df = self.df
        if df.empty or 'cohort_week' not in df.columns:
            self._cached_cohorts = []
            print("No data to calculate")
            return

        stages = ['contacto', 'cita', 'venta_bruta', 'escrituracion']

        # Obtener cohorts únicos y sus conteos
        cohort_counts = df['cohort_week'].value_counts().sort_index()
        cohort_weeks = cohort_counts.index.tolist()

        # Pre-calcular timestamps de inicio para cada cohort
        cohort_starts = {cw: self._week_to_timestamp(cw) for cw in cohort_weeks}

        # Mapear cohort_week a su timestamp de inicio
        df_copy = df.copy()
        df_copy['_cohort_start'] = df_copy['cohort_week'].map(cohort_starts)

        # Pre-calcular weeks_since para cada etapa
        stage_weeks = {}
        for stage in stages:
            stage_col = self._stage_cols.get(stage)
            if stage_col and stage_col in df_copy.columns:
                valid_mask = df_copy[stage_col].notna()
                weeks = pd.Series(index=df_copy.index, dtype='float64')
                weeks[valid_mask] = ((df_copy.loc[valid_mask, stage_col] -
                                     df_copy.loc[valid_mask, '_cohort_start']).dt.days // 7).clip(lower=0)
                stage_weeks[stage] = weeks

        # Construir cohorts usando groupby
        cohorts = []
        for cohort_week in cohort_weeks:
            initial_leads = int(cohort_counts[cohort_week])
            if initial_leads == 0:
                continue

            mask = df_copy['cohort_week'] == cohort_week
            conversions = {}

            for stage in stages:
                if stage not in stage_weeks:
                    continue

                weeks_data = stage_weeks[stage][mask].dropna()
                if weeks_data.empty:
                    continue

                # Contar por semana
                counts = weeks_data.value_counts().sort_index()

                # Calcular acumulado
                cumsum = counts.cumsum()
                percentages = (cumsum / initial_leads * 100).round(2)
                conversions[stage] = {int(k): float(v) for k, v in percentages.items()}

            cohorts.append(CohortData(
                cohort_week=str(cohort_week),
                initial_leads=initial_leads,
                conversions=conversions
            ))

        self._cached_cohorts = cohorts

        # Pre-calcular heatmaps
        for stage in stages:
            self._cached_heatmaps[stage] = self._build_heatmap(cohorts, stage)

        print(f"Pre-calculation complete! {len(cohorts)} cohorts cached.")

    def _build_heatmap(self, cohorts: List[CohortData], stage: str) -> CohortHeatmapData:
        if not cohorts:
            return CohortHeatmapData(cohort_labels=[], week_labels=[], matrix=[], stage=stage)

        cohort_labels = [c.cohort_week for c in cohorts]

        max_weeks = 0
        for cohort in cohorts:
            stage_data = cohort.conversions.get(stage, {})
            if stage_data:
                max_weeks = max(max_weeks, max(stage_data.keys()))

        week_labels = list(range(max_weeks + 1))

        matrix = []
        for cohort in cohorts:
            stage_data = cohort.conversions.get(stage, {})
            row = [stage_data.get(week, None) for week in week_labels]
            matrix.append(row)

        return CohortHeatmapData(
            cohort_labels=cohort_labels,
            week_labels=week_labels,
            matrix=matrix,
            stage=stage
        )

    def _apply_filters(self, df: pd.DataFrame, filters: FilterParams) -> pd.DataFrame:
        if filters is None:
            return df

        if filters.desarrollos:
            desarrollo_col = self._find_column(['desarrollo', 'project', 'proyecto'])
            if desarrollo_col:
                df = df[df[desarrollo_col].isin(filters.desarrollos)]

        if filters.regiones:
            region_col = self._find_column(['region', 'región', 'zona'])
            if region_col:
                df = df[df[region_col].isin(filters.regiones)]

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

    def _has_filters(self, filters: Optional[FilterParams]) -> bool:
        if filters is None:
            return False
        return bool(
            filters.desarrollos or filters.regiones or filters.year or
            filters.month or filters.week_iso or filters.date_from or filters.date_to
        )

    def calculate_cohorts(self, filters: Optional[FilterParams] = None) -> List[CohortData]:
        if not self._has_filters(filters):
            return self._cached_cohorts or []

        # Con filtros - calcular dinámicamente (poco común)
        df = self._apply_filters(self.df.copy(), filters)
        if df.empty or 'cohort_week' not in df.columns:
            return []

        stages = ['contacto', 'cita', 'venta_bruta', 'escrituracion']
        cohort_counts = df['cohort_week'].value_counts().sort_index()
        cohort_weeks = cohort_counts.index.tolist()

        cohort_starts = {cw: self._week_to_timestamp(cw) for cw in cohort_weeks}
        df['_cohort_start'] = df['cohort_week'].map(cohort_starts)

        cohorts = []
        for cohort_week in cohort_weeks:
            initial_leads = int(cohort_counts[cohort_week])
            if initial_leads == 0:
                continue

            mask = df['cohort_week'] == cohort_week
            cohort_df = df[mask]
            conversions = {}

            for stage in stages:
                stage_col = self._stage_cols.get(stage)
                if not stage_col or stage_col not in cohort_df.columns:
                    continue

                valid_mask = cohort_df[stage_col].notna()
                if not valid_mask.any():
                    continue

                weeks = ((cohort_df.loc[valid_mask, stage_col] -
                         cohort_df.loc[valid_mask, '_cohort_start']).dt.days // 7).clip(lower=0)

                counts = weeks.value_counts().sort_index()
                cumsum = counts.cumsum()
                percentages = (cumsum / initial_leads * 100).round(2)
                conversions[stage] = {int(k): float(v) for k, v in percentages.items()}

            cohorts.append(CohortData(
                cohort_week=str(cohort_week),
                initial_leads=initial_leads,
                conversions=conversions
            ))

        return cohorts

    def get_heatmap_data(self, filters: Optional[FilterParams] = None, stage: str = 'contacto') -> CohortHeatmapData:
        if not self._has_filters(filters) and stage in self._cached_heatmaps:
            return self._cached_heatmaps[stage]

        cohorts = self.calculate_cohorts(filters)
        return self._build_heatmap(cohorts, stage)


cohort_service = CohortAnalysisService()
