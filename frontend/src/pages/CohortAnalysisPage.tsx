import React, { useEffect, useState } from 'react';
import { FilterPanel } from '../components/filters/FilterPanel';
import { ConversionTrendChart } from '../components/charts/ConversionTrendChart';
import { useFilters } from '../context/FilterContext';
import { fetchFunnel } from '../api';
import type { FunnelResponse } from '../types';
import './Pages.css';

// Conversion Summary Component
const ConversionSummary: React.FC = () => {
  const { filters } = useFilters();
  const [funnel, setFunnel] = useState<FunnelResponse | null>(null);

  useEffect(() => {
    fetchFunnel(filters).then(setFunnel).catch(console.error);
  }, [filters]);

  if (!funnel || funnel.stages.length === 0) return null;

  const stages = funnel.stages;

  return (
    <div className="conversion-summary">
      <h3>Conversiones del Funnel</h3>
      <p className="summary-description">
        Porcentaje de leads que avanzan de una etapa a la siguiente
      </p>
      <div className="conversion-flow">
        {stages.map((stage, index) => (
          <div key={stage.stage} className="conversion-item">
            <div className="conversion-stage">
              <span className="stage-name">{stage.stage_label}</span>
              <span className="stage-count">{stage.count.toLocaleString()}</span>
            </div>
            {index < stages.length - 1 && (
              <div className="conversion-arrow">
                <span className="arrow-line"></span>
                <span className="conversion-rate">
                  {stages[index + 1].conversion_from_previous}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="conversion-total">
        <strong>Conversion total (Lead → Escrituracion):</strong> {stages[stages.length - 1].percentage_of_total}%
      </div>
    </div>
  );
};

export const CohortAnalysisPage: React.FC = () => {
  return (
    <div className="page-layout">
      <FilterPanel />

      <main className="page-content">
        <header className="page-header">
          <h1>Analisis de Conversiones</h1>
          <p>
            Ve cuantos leads avanzan a cada etapa del proceso comercial
            y como evolucionan las tasas de conversion mes a mes.
          </p>
        </header>

        <ConversionSummary />

        <section className="trend-visualization">
          <ConversionTrendChart />
        </section>
      </main>
    </div>
  );
};
