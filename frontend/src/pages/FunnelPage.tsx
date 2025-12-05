import React from 'react';
import { FilterPanel } from '../components/filters/FilterPanel';
import { FunnelChart } from '../components/charts/FunnelChart';
import { MetricsGrid } from '../components/metrics/MetricsGrid';
import './Pages.css';

export const FunnelPage: React.FC = () => {
  return (
    <div className="page-layout">
      <FilterPanel />

      <main className="page-content">
        <header className="page-header">
          <h1>Funnel Comercial</h1>
          <p>
            Analiza las tasas de conversión en cada etapa del proceso de venta,
            desde la generación del lead hasta la escrituración.
          </p>
        </header>

        <MetricsGrid />

        <section className="funnel-visualization">
          <FunnelChart />
        </section>

        <section className="funnel-explanation">
          <h3>Etapas del Funnel</h3>
          <div className="stages-grid">
            <div className="stage-card">
              <div className="stage-number">1</div>
              <h4>Lead</h4>
              <p>Prospecto registrado a través de campañas publicitarias o formularios.</p>
            </div>
            <div className="stage-card">
              <div className="stage-number">2</div>
              <h4>Contacto</h4>
              <p>Lead con el que se estableció comunicación efectiva.</p>
            </div>
            <div className="stage-card">
              <div className="stage-number">3</div>
              <h4>Cita</h4>
              <p>Lead que agendó visita al desarrollo.</p>
            </div>
            <div className="stage-card">
              <div className="stage-number">4</div>
              <h4>Venta Bruta</h4>
              <p>Lead que realizó apartado o compra inicial.</p>
            </div>
            <div className="stage-card">
              <div className="stage-number">5</div>
              <h4>Escrituración</h4>
              <p>Venta completada con firma de escrituras.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
