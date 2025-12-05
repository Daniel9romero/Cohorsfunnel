import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { DevelopmentLocation } from '../../types';
import { fetchDevelopments } from '../../api';
import { InfoTooltip } from '../common/InfoTooltip';
import 'leaflet/dist/leaflet.css';
import './DevelopmentsMap.css';

// Fix for default marker icons in Leaflet with Vite/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const REGION_COLORS: Record<string, string> = {
  Norte: '#3498db',
  Centro: '#27ae60',
  Sur: '#e74c3c'
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Create colored markers using SVG
const createColoredIcon = (color: string) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path fill="${color}" stroke="#fff" stroke-width="1" d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z"/>
      <circle fill="#fff" cx="12" cy="12" r="5"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36]
  });
};

export const DevelopmentsMap: React.FC = () => {
  const [developments, setDevelopments] = useState<DevelopmentLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Centro de México
  const center: [number, number] = [23.6345, -102.5528];

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchDevelopments();
        if (isMounted) {
          setDevelopments(data);
        }
      } catch (err: any) {
        console.error('Error loading developments:', err);
        if (isMounted) {
          setError(err.message || 'Error al cargar desarrollos');
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
  }, []);

  if (isLoading) {
    return <div className="map-loading">Cargando mapa...</div>;
  }

  if (error) {
    return <div className="map-error">{error}</div>;
  }

  const mapInfo = (
    <>
      <p><strong>Mapa de Desarrollos</strong> muestra la ubicacion geografica de todos los proyectos inmobiliarios.</p>
      <ul>
        <li><strong>Marcadores:</strong> Cada punto representa un desarrollo</li>
        <li><strong>Color:</strong> Indica la region (Norte, Centro, Sur)</li>
        <li><strong>Click en marcador:</strong> Ver detalles del desarrollo</li>
      </ul>
      <p>Permite visualizar la distribucion territorial y comparar por ubicacion.</p>
    </>
  );

  const tableInfo = (
    <>
      <p>La tabla muestra el resumen de cada desarrollo:</p>
      <ul>
        <li><strong>Leads:</strong> Prospectos captados para ese desarrollo</li>
        <li><strong>Ventas:</strong> Numero de propiedades vendidas</li>
        <li><strong>Escrituracion:</strong> Ventas formalizadas con escritura</li>
        <li><strong>% Conv:</strong> Porcentaje de leads que llegaron a escrituracion</li>
        <li><strong>Inversion:</strong> Monto invertido en marketing</li>
      </ul>
    </>
  );

  return (
    <div className="map-container">
      <div className="map-header">
        <h3>Mapa de Desarrollos</h3>
        <InfoTooltip title="Mapa de Desarrollos" content={mapInfo} />
      </div>
      <div className="map-legend">
        <h4>Regiones</h4>
        {Object.entries(REGION_COLORS).map(([region, color]) => (
          <div key={region} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: color }} />
            {region}
          </div>
        ))}
      </div>

      <MapContainer
        center={center}
        zoom={5}
        style={{ height: '500px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {developments.map((dev) => (
          <Marker
            key={dev.name}
            position={[dev.latitude, dev.longitude]}
            icon={createColoredIcon(REGION_COLORS[dev.region] || '#999')}
          >
            <Popup>
              <div className="popup-content">
                <h3>{dev.name}</h3>
                <p><strong>Ciudad:</strong> {dev.city}</p>
                <p><strong>Region:</strong> {dev.region}</p>
                <hr />
                <p><strong>Total Leads:</strong> {dev.total_leads.toLocaleString()}</p>
                <p><strong>Total Ventas:</strong> {dev.total_sales.toLocaleString()}</p>
                <p><strong>Inversion:</strong> {formatCurrency(dev.total_investment)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Tabla de desarrollos */}
      <div className="developments-table">
        <div className="table-header">
          <h3>Lista de Desarrollos</h3>
          <InfoTooltip title="Lista de Desarrollos" content={tableInfo} />
        </div>
        <table>
          <thead>
            <tr>
              <th>Desarrollo</th>
              <th>Ciudad</th>
              <th>Region</th>
              <th>Leads</th>
              <th>Ventas</th>
              <th>Escrituracion</th>
              <th>% Conv</th>
              <th>Inversion</th>
            </tr>
          </thead>
          <tbody>
            {developments.map(dev => (
              <tr key={dev.name}>
                <td>{dev.name}</td>
                <td>{dev.city}</td>
                <td>
                  <span
                    className="region-badge"
                    style={{ backgroundColor: REGION_COLORS[dev.region] }}
                  >
                    {dev.region}
                  </span>
                </td>
                <td>{dev.total_leads.toLocaleString()}</td>
                <td>{dev.total_sales.toLocaleString()}</td>
                <td>{dev.total_closings.toLocaleString()}</td>
                <td>{dev.conversion_rate.toFixed(2)}%</td>
                <td>{formatCurrency(dev.total_investment)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
