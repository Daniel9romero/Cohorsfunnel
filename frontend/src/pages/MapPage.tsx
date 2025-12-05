import React from 'react';
import { DevelopmentsMap } from '../components/map/DevelopmentsMap';
import './Pages.css';

export const MapPage: React.FC = () => {
  return (
    <div className="page-layout page-layout--full">
      <main className="page-content page-content--full">
        <header className="page-header">
          <h1>Mapa de Desarrollos</h1>
          <p>
            Ubicación geográfica de los desarrollos inmobiliarios con métricas
            de leads, ventas e inversión por región.
          </p>
        </header>

        <section className="map-visualization">
          <DevelopmentsMap />
        </section>
      </main>
    </div>
  );
};
