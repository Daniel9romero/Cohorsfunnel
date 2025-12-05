import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { ConversionTrendResponse } from '../../types';
import { useFilters } from '../../context/FilterContext';
import { fetchConversionTrends } from '../../api';
import './Charts.css';

const STAGE_COLORS: Record<string, string> = {
  contacto: '#5470c6',
  cita: '#91cc75',
  venta_bruta: '#fac858',
  escrituracion: '#ee6666'
};

export const ConversionTrendChart: React.FC = () => {
  const { filters } = useFilters();
  const [data, setData] = useState<ConversionTrendResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const trendData = await fetchConversionTrends(filters);
        if (isMounted) {
          setData(trendData);
        }
      } catch (err: any) {
        console.error('Error loading trends:', err);
        if (isMounted) {
          setError(err.message || 'Error al cargar tendencias');
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
    return <div className="chart-loading">Cargando grafica de tendencias...</div>;
  }

  if (error) {
    return <div className="chart-error">{error}</div>;
  }

  if (!data || data.data.length === 0) {
    return <div className="chart-empty">No hay datos disponibles para mostrar</div>;
  }

  // Formatear periodos para mostrar (2023-01 -> Ene 2023)
  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  const periods = data.data.map(d => formatPeriod(d.period));

  // Calcular rango dinamico del eje Y basado en los datos
  const allValues = data.data.flatMap(d => [d.contacto, d.cita, d.venta_bruta, d.escrituracion]);
  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const padding = (dataMax - dataMin) * 0.1; // 10% de padding
  const yMin = Math.max(0, Math.floor(dataMin - padding));
  const yMax = Math.min(100, Math.ceil(dataMax + padding));

  const option = {
    title: {
      text: 'Tendencia de Conversiones por Mes',
      subtext: '% de leads que alcanzaron cada etapa',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => {
        const period = params[0].axisValue;
        const dataIndex = params[0].dataIndex;
        const leads = data.data[dataIndex].leads;
        let result = `<strong>${period}</strong><br/>`;
        result += `Leads registrados: ${leads.toLocaleString()}<br/><br/>`;
        params.forEach((p: any) => {
          result += `${p.marker} ${p.seriesName}: <strong>${p.value}%</strong><br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['Contacto', 'Cita', 'Venta Bruta', 'Escrituracion'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '18%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: periods,
      axisLabel: {
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      name: '% Conversion',
      min: yMin,
      max: yMax,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: 'Contacto',
        type: 'line',
        data: data.data.map(d => d.contacto),
        smooth: true,
        lineStyle: { width: 3, color: STAGE_COLORS.contacto },
        itemStyle: { color: STAGE_COLORS.contacto },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: 'Cita',
        type: 'line',
        data: data.data.map(d => d.cita),
        smooth: true,
        lineStyle: { width: 3, color: STAGE_COLORS.cita },
        itemStyle: { color: STAGE_COLORS.cita },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: 'Venta Bruta',
        type: 'line',
        data: data.data.map(d => d.venta_bruta),
        smooth: true,
        lineStyle: { width: 3, color: STAGE_COLORS.venta_bruta },
        itemStyle: { color: STAGE_COLORS.venta_bruta },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: 'Escrituracion',
        type: 'line',
        data: data.data.map(d => d.escrituracion),
        smooth: true,
        lineStyle: { width: 3, color: STAGE_COLORS.escrituracion },
        itemStyle: { color: STAGE_COLORS.escrituracion },
        symbol: 'circle',
        symbolSize: 6
      }
    ]
  };

  return (
    <div className="chart-container">
      <ReactECharts
        option={option}
        style={{ height: '400px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
      <div className="chart-help">
        <p><strong>Como leer esta grafica:</strong> Cada linea muestra el porcentaje de leads que alcanzaron esa etapa, agrupados por mes de registro.</p>
      </div>
    </div>
  );
};
