import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { CohortHeatmapData, FunnelStage } from '../../types';
import { useFilters } from '../../context/FilterContext';
import { fetchCohortHeatmap } from '../../api';
import { InfoTooltip } from '../common/InfoTooltip';
import './Charts.css';

interface CohortHeatmapProps {
  stage: FunnelStage;
}

const STAGE_LABELS: Record<FunnelStage, string> = {
  contacto: 'Contacto',
  cita: 'Cita',
  venta_bruta: 'Venta Bruta',
  escrituracion: 'Escrituración'
};

export const CohortHeatmap: React.FC<CohortHeatmapProps> = ({ stage }) => {
  const { filters } = useFilters();
  const [data, setData] = useState<CohortHeatmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const heatmapData = await fetchCohortHeatmap(filters, stage);
        if (isMounted) {
          setData(heatmapData);
        }
      } catch (err: any) {
        console.error('Error loading cohorts:', err);
        if (isMounted) {
          setError(err.message || 'Error al cargar cohorts');
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
  }, [filters, stage]);

  if (isLoading) {
    return <div className="chart-loading">Cargando heatmap...</div>;
  }

  if (error) {
    return <div className="chart-error">{error}</div>;
  }

  if (!data || data.cohort_labels.length === 0) {
    return <div className="chart-empty">No hay datos disponibles para mostrar</div>;
  }

  // Preparar datos para ECharts
  const chartData: [number, number, number | null][] = [];
  data.matrix.forEach((row, cohortIndex) => {
    row.forEach((value, weekIndex) => {
      chartData.push([weekIndex, cohortIndex, value]);
    });
  });

  const option = {
    title: {
      text: `Análisis de Cohorts - ${STAGE_LABELS[stage]}`,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        const [week, cohort, value] = params.data;
        if (value === null) return 'Sin datos';
        return `
          <strong>Cosecha: ${data.cohort_labels[cohort]}</strong><br/>
          Semana +${week}: <strong>${value.toFixed(1)}%</strong>
        `;
      }
    },
    grid: {
      left: '15%',
      right: '12%',
      top: '15%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: data.week_labels.map(w => `+${w}`),
      name: 'Semanas desde registro',
      nameLocation: 'middle',
      nameGap: 35,
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: data.cohort_labels,
      name: 'Semana de cosecha',
      nameLocation: 'middle',
      nameGap: 90,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'vertical',
      right: '2%',
      top: 'center',
      inRange: {
        color: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b']
      },
      text: ['100%', '0%'],
      textStyle: {
        color: '#333'
      }
    },
    series: [{
      name: 'Conversión',
      type: 'heatmap',
      data: chartData.filter(d => d[2] !== null),
      label: {
        show: data.cohort_labels.length <= 20,
        formatter: (params: any) => {
          const value = params.data[2];
          return value !== null ? `${value.toFixed(0)}%` : '';
        },
        fontSize: 10
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  const cohortInfo = (
    <>
      <p><strong>Que es un Cohort (Cosecha)?</strong></p>
      <p>Un cohort agrupa todos los leads que se registraron en la misma semana. Por ejemplo, "2024-W05" son todos los leads de la semana 5 de 2024.</p>

      <p><strong>Como leer esta tabla:</strong></p>
      <ul>
        <li><strong>Cada fila</strong> es un cohort (semana de registro)</li>
        <li><strong>Cada columna (+0, +1, +2...)</strong> indica semanas transcurridas desde el registro</li>
        <li><strong>El porcentaje</strong> muestra cuantos leads de ese cohort ya alcanzaron esta etapa ({STAGE_LABELS[stage]})</li>
      </ul>

      <p><strong>Ejemplo:</strong> Si la celda "2024-W05" en columna "+2" muestra <strong>45%</strong>, significa que el 45% de los leads registrados en la semana 5 ya tuvieron {stage === 'contacto' ? 'contacto' : stage === 'cita' ? 'cita' : stage === 'venta_bruta' ? 'venta' : 'escrituracion'} dentro de las primeras 2 semanas.</p>

      <p><strong>Para que sirve?</strong></p>
      <ul>
        <li>Comparar velocidad de conversion entre semanas</li>
        <li>Detectar si campanas recientes convierten mejor o peor</li>
        <li>Identificar el tiempo promedio para alcanzar cada etapa</li>
      </ul>
    </>
  );

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Analisis de Cohorts - {STAGE_LABELS[stage]}</h3>
        <InfoTooltip title="Analisis de Cohorts" content={cohortInfo} />
      </div>
      <ReactECharts
        option={option}
        style={{ height: '500px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};
