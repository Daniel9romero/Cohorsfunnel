import React from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

export const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <header className="hero">
        <h1>Dashboard de Análisis Comercial</h1>
        <p className="subtitle">
          Análisis de Cohorts Semanales y Funnel Comercial para Desarrollos Inmobiliarios
        </p>
        <p className="description">
          Este dashboard permite visualizar el desempeño de las campañas por desarrollo,
          midiendo conversión, conversión acumulada y costo por conversión en cada etapa
          del funnel comercial, organizado por cosechas semanales.
        </p>
      </header>

      <section className="features">
        <Link to="/cohorts" className="feature-card">
          <div className="feature-icon-bar cohorts-bar"></div>
          <h2>Análisis de Cohorts</h2>
          <p>
            Visualiza el comportamiento de "cosechas" semanales de leads
            y su progresión a través del funnel comercial en el tiempo.
          </p>
          <span className="feature-link">Ver Cohorts →</span>
        </Link>

        <Link to="/funnel" className="feature-card">
          <div className="feature-icon-bar funnel-bar"></div>
          <h2>Funnel Comercial</h2>
          <p>
            Analiza las tasas de conversión en cada etapa:
            Lead → Contacto → Cita → Venta Bruta → Escrituración.
          </p>
          <span className="feature-link">Ver Funnel →</span>
        </Link>

        <Link to="/map" className="feature-card">
          <div className="feature-icon-bar map-bar"></div>
          <h2>Mapa de Desarrollos</h2>
          <p>
            Explora la ubicación geográfica de los desarrollos
            y sus métricas de rendimiento por región.
          </p>
          <span className="feature-link">Ver Mapa →</span>
        </Link>
      </section>

      <section className="info-section">
        <h2>Acerca del Dashboard</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3>Métricas Clave</h3>
            <ul>
              <li>Inversión publicitaria y costo por conversión</li>
              <li>Tasas de conversión entre etapas del funnel</li>
              <li>Rendimiento de cohorts semanales (cosechas)</li>
              <li>Comparativas regionales (Norte, Centro, Sur)</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>Filtros Disponibles</h3>
            <ul>
              <li>Por desarrollo inmobiliario</li>
              <li>Por región geográfica</li>
              <li>Por año, mes y semana ISO</li>
              <li>Por rango de fechas personalizado</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>Datos</h3>
            <ul>
              <li>15 desarrollos inmobiliarios</li>
              <li>Inversión desde enero 2024</li>
              <li>Leads desde enero 2023</li>
              <li>3 regiones: Norte, Centro, Sur</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <p>
          Desarrollado como alternativa web a Power BI.
          Utiliza el botón de <strong>Metodología</strong> para conocer los detalles técnicos.
        </p>
      </footer>
    </div>
  );
};
