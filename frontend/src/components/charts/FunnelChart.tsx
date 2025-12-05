import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { FunnelResponse } from '../../types';
import { useFilters } from '../../context/FilterContext';
import { fetchFunnel } from '../../api';
import { InfoTooltip } from '../common/InfoTooltip';
import './Charts.css';

const STAGE_COLORS: Record<string, string> = {
  lead: '#5470c6',
  contacto: '#91cc75',
  cita: '#fac858',
  venta_bruta: '#ee6666',
  escrituracion: '#73c0de'
};

export const FunnelChart: React.FC = () => {
  const { filters } = useFilters();
  const [data, setData] = useState<FunnelResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const funnelData = await fetchFunnel(filters);
        if (isMounted) {
          setData(funnelData);
        }
      } catch (err: any) {
        console.error('Error loading funnel:', err);
        if (isMounted) {
          setError(err.message || 'Error al cargar funnel');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  if (isLoading) {
    return <div className="chart-loading">Cargando funnel...</div>;
  }

  if (error) {
    return <div className="chart-error">{error}</div>;
  }

  if (!data || data.stages.length === 0) {
    return <div className="chart-empty">No hay datos disponibles para mostrar</div>;
  }

  const option = {
    title: {
      text: 'Funnel Comercial',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const stage = data.stages.find(s => s.stage_label === params.name);
        if (!stage) return '';
        return `
          <strong>${stage.stage_label}</strong><br/>
          Cantidad: ${stage.count.toLocaleString()}<br/>
          % del total: ${stage.percentage_of_total}%<br/>
          Conversión: ${stage.conversion_from_previous}%
        `;
      }
    },
    series: [{
      name: 'Funnel',
      type: 'funnel',
      left: '10%',
      width: '80%',
      top: '15%',
      bottom: '10%',
      minSize: '20%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        position: 'inside',
        formatter: (params: any) => {
          const stage = data.stages.find(s => s.stage_label === params.name);
          if (!stage) return params.name;
          return `${stage.stage_label}\n${stage.count.toLocaleString()}`;
        },
        fontSize: 12,
        color: '#fff'
      },
      labelLine: {
        length: 10,
        lineStyle: {
          width: 1,
          type: 'solid'
        }
      },
      emphasis: {
        label: {
          fontSize: 14
        }
      },
      data: data.stages.map(stage => ({
        name: stage.stage_label,
        value: stage.count,
        itemStyle: {
          color: STAGE_COLORS[stage.stage] || '#999'
        }
      }))
    }]
  };

  const funnelInfo = (
    <>
      <p><strong>Funnel Comercial</strong> visualiza el flujo de prospectos a traves de las etapas de venta.</p>
      <ul>
        <li><strong>Lead:</strong> Prospectos registrados inicialmente</li>
        <li><strong>Contacto:</strong> Leads que fueron contactados</li>
        <li><strong>Cita:</strong> Contactos que agendaron cita</li>
        <li><strong>Venta Bruta:</strong> Citas que resultaron en venta</li>
        <li><strong>Escrituracion:</strong> Ventas formalizadas legalmente</li>
      </ul>
      <p>El ancho de cada etapa representa la cantidad relativa de prospectos.</p>
    </>
  );

  const tableInfo = (
    <>
      <p>La tabla muestra el detalle numerico de cada etapa:</p>
      <ul>
        <li><strong>Cantidad:</strong> Numero total en esa etapa</li>
        <li><strong>% Total:</strong> Porcentaje respecto al total de leads</li>
        <li><strong>Conversion:</strong> Porcentaje que convirtio desde la etapa anterior</li>
      </ul>
    </>
  );

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Funnel Comercial</h3>
        <InfoTooltip title="Funnel Comercial" content={funnelInfo} />
      </div>
      <ReactECharts
        option={option}
        style={{ height: '450px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />

      {/* Tabla de detalles */}
      <div className="funnel-table">
        <div className="table-header">
          <h4>Detalle por Etapa</h4>
          <InfoTooltip title="Detalle del Funnel" content={tableInfo} />
        </div>
        <table>
          <thead>
            <tr>
              <th>Etapa</th>
              <th>Cantidad</th>
              <th>% Total</th>
              <th>Conversión</th>
            </tr>
          </thead>
          <tbody>
            {data.stages.map(stage => (
              <tr key={stage.stage}>
                <td>
                  <span
                    className="stage-dot"
                    style={{ backgroundColor: STAGE_COLORS[stage.stage] }}
                  />
                  {stage.stage_label}
                </td>
                <td>{stage.count.toLocaleString()}</td>
                <td>{stage.percentage_of_total}%</td>
                <td>{stage.conversion_from_previous}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
