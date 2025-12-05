import React, { useEffect, useState } from 'react';
import type { MetricsResponse } from '../../types';
import { useFilters } from '../../context/FilterContext';
import { fetchMetrics } from '../../api';
import { InfoTooltip } from '../common/InfoTooltip';
import './MetricsGrid.css';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  type?: 'primary' | 'success' | 'warning' | 'danger';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, type = 'primary' }) => (
  <div className={`metric-card metric-card--${type}`}>
    <h3 className="metric-card__title">{title}</h3>
    <p className="metric-card__value">{value}</p>
    {subtitle && <span className="metric-card__subtitle">{subtitle}</span>}
  </div>
);

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-MX').format(value);
};

export const MetricsGrid: React.FC = () => {
  const { filters } = useFilters();
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const metricsData = await fetchMetrics(filters, abortController.signal);
        if (isMounted && !abortController.signal.aborted) {
          setData(metricsData);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return; // Ignore aborted requests
        }
        console.error('Error loading metrics:', err);
        if (isMounted) {
          setError(err.message || 'Error al cargar metricas');
        }
      } finally {
        if (isMounted && !abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [filters]);

  if (isLoading) {
    return <div className="metrics-loading">Cargando métricas...</div>;
  }

  if (error) {
    return <div className="metrics-error">{error}</div>;
  }

  if (!data) {
    return <div className="metrics-empty">No hay datos disponibles</div>;
  }

  const totalesInfo = (
    <>
      <p>Muestra los <strong>volumenes totales</strong> de cada etapa del proceso comercial:</p>
      <ul>
        <li><strong>Inversion:</strong> Total invertido en marketing y publicidad</li>
        <li><strong>Leads:</strong> Prospectos captados</li>
        <li><strong>Contactos:</strong> Leads que fueron contactados exitosamente</li>
        <li><strong>Citas:</strong> Prospectos que asistieron a cita</li>
        <li><strong>Ventas/Escrituraciones:</strong> Cierres de venta</li>
      </ul>
    </>
  );

  const costosInfo = (
    <>
      <p>Indica cuanto cuesta en promedio lograr cada conversion:</p>
      <ul>
        <li><strong>Costo por Lead:</strong> Inversion / Total Leads</li>
        <li><strong>Costo por Contacto:</strong> Inversion / Contactos</li>
        <li><strong>Costo por Venta:</strong> Inversion / Ventas</li>
      </ul>
      <p>A menor costo, mayor eficiencia del proceso comercial.</p>
    </>
  );

  const conversionInfo = (
    <>
      <p>Porcentaje de conversion entre etapas consecutivas:</p>
      <ul>
        <li><strong>Lead a Contacto:</strong> % de leads contactados</li>
        <li><strong>Contacto a Cita:</strong> % que agenda cita</li>
        <li><strong>Cita a Venta:</strong> % de cierre de ventas</li>
        <li><strong>Conversion General:</strong> De lead a escrituracion</li>
      </ul>
      <p>Permite identificar cuellos de botella en el proceso.</p>
    </>
  );

  return (
    <div className="metrics-container">
      <h2 className="metrics-title">Metricas Generales</h2>

      {/* Totales */}
      <div className="metrics-section">
        <div className="section-header">
          <h3>Totales</h3>
          <InfoTooltip title="Totales" content={totalesInfo} />
        </div>
        <div className="metrics-grid">
          <MetricCard
            title="Inversión Total"
            value={formatCurrency(data.total_investment)}
            type="primary"
          />
          <MetricCard
            title="Total Leads"
            value={formatNumber(data.total_leads)}
            type="primary"
          />
          <MetricCard
            title="Contactos"
            value={formatNumber(data.total_contacts)}
            type="success"
          />
          <MetricCard
            title="Citas"
            value={formatNumber(data.total_appointments)}
            type="success"
          />
          <MetricCard
            title="Ventas Brutas"
            value={formatNumber(data.total_gross_sales)}
            type="warning"
          />
          <MetricCard
            title="Escrituraciones"
            value={formatNumber(data.total_closings)}
            type="danger"
          />
        </div>
      </div>

      {/* Costos por conversión */}
      <div className="metrics-section">
        <div className="section-header">
          <h3>Costo por Conversion</h3>
          <InfoTooltip title="Costos de Conversion" content={costosInfo} />
        </div>
        <div className="metrics-grid">
          <MetricCard
            title="Costo por Lead"
            value={formatCurrency(data.cost_per_lead)}
          />
          <MetricCard
            title="Costo por Contacto"
            value={formatCurrency(data.cost_per_contact)}
          />
          <MetricCard
            title="Costo por Cita"
            value={formatCurrency(data.cost_per_appointment)}
          />
          <MetricCard
            title="Costo por Venta"
            value={formatCurrency(data.cost_per_sale)}
          />
          <MetricCard
            title="Costo por Escrituración"
            value={formatCurrency(data.cost_per_closing)}
          />
        </div>
      </div>

      {/* Tasas de conversión */}
      <div className="metrics-section">
        <div className="section-header">
          <h3>Tasas de Conversion</h3>
          <InfoTooltip title="Tasas de Conversion" content={conversionInfo} />
        </div>
        <div className="metrics-grid">
          <MetricCard
            title="Lead → Contacto"
            value={`${data.conversion_lead_to_contact}%`}
            type="success"
          />
          <MetricCard
            title="Contacto → Cita"
            value={`${data.conversion_contact_to_appointment}%`}
            type="success"
          />
          <MetricCard
            title="Cita → Venta"
            value={`${data.conversion_appointment_to_sale}%`}
            type="warning"
          />
          <MetricCard
            title="Venta → Escrituración"
            value={`${data.conversion_sale_to_closing}%`}
            type="warning"
          />
          <MetricCard
            title="Conversión General"
            value={`${data.overall_conversion}%`}
            subtitle="Lead a Escrituración"
            type="danger"
          />
        </div>
      </div>
    </div>
  );
};
