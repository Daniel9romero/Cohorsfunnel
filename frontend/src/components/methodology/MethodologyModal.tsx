import React, { useState } from 'react';
import './MethodologyModal.css';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('arquitectura');

  if (!isOpen) return null;

  const sections = [
    { id: 'arquitectura', label: 'Arquitectura' },
    { id: 'fuentes', label: 'Fuentes de Datos' },
    { id: 'procesamiento', label: 'Procesamiento' },
    { id: 'cohorts', label: 'Analisis de Cohorts' },
    { id: 'funnel', label: 'Funnel Comercial' },
    { id: 'stack', label: 'Stack Tecnologico' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Metodologia del Dashboard</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <nav className="methodology-nav">
            {sections.map(section => (
              <button
                key={section.id}
                className={`nav-button ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </nav>

          <div className="methodology-content">
            {activeSection === 'arquitectura' && (
              <section>
                <h3>Arquitectura del Dashboard</h3>

                <div className="concept-box highlight">
                  <h4>Enfoque: API Backend con Filtros Dinamicos</h4>
                  <p>
                    Este dashboard utiliza una <strong>API REST en FastAPI</strong> que procesa
                    el Excel y permite <strong>filtros dinamicos</strong> en tiempo real.
                  </p>
                </div>

                <div className="process-step">
                  <h4>Flujo de Datos</h4>
                  <div className="flow-diagram">
                    <span className="flow-item">Excel (Datos_prueba_v3.xlsx)</span>
                    <span className="flow-arrow">→</span>
                    <span className="flow-item">Backend FastAPI/Pandas</span>
                    <span className="flow-arrow">→</span>
                    <span className="flow-item">API REST</span>
                    <span className="flow-arrow">→</span>
                    <span className="flow-item">Frontend React</span>
                  </div>
                </div>

                <div className="data-source">
                  <h4>Endpoints API</h4>
                  <ul>
                    <li><code>/api/v1/funnel/</code> - Funnel comercial con filtros</li>
                    <li><code>/api/v1/cohorts/heatmap/</code> - Heatmap de cohorts por etapa</li>
                    <li><code>/api/v1/metrics/</code> - Metricas generales y KPIs</li>
                    <li><code>/api/v1/developments/</code> - Desarrollos con coordenadas</li>
                    <li><code>/api/v1/filters/</code> - Opciones de filtros disponibles</li>
                  </ul>
                </div>

                <div className="why-box">
                  <h4>Caracteristicas</h4>
                  <ol>
                    <li><strong>Filtros dinamicos:</strong> Region, desarrollo, ano, mes, rango de fechas</li>
                    <li><strong>Pre-calculo al inicio:</strong> Metricas base cacheadas en memoria</li>
                    <li><strong>Secuencia de funnel:</strong> Respeta que Cita requiere Contacto, etc.</li>
                    <li><strong>API documentada:</strong> Swagger UI en /docs</li>
                  </ol>
                </div>
              </section>
            )}

            {activeSection === 'fuentes' && (
              <section>
                <h3>1. Fuentes de Datos</h3>
                <p>El analisis se basa en un archivo Excel con tres hojas de datos:</p>

                <div className="data-source">
                  <h4>Hoja "Inversion"</h4>
                  <ul>
                    <li>Inversion publicitaria diaria desde enero 2024</li>
                    <li>Datos para 15 desarrollos inmobiliarios</li>
                    <li>Permite calcular costo por conversion en cada etapa</li>
                  </ul>
                </div>

                <div className="data-source">
                  <h4>Hoja "Desarrollos"</h4>
                  <ul>
                    <li>Catalogo de 15 desarrollos con nombre y ubicacion</li>
                    <li>Clasificacion por ciudad (Monterrey, CDMX, Guadalajara, etc.)</li>
                    <li>Agrupacion por region: Norte, Centro, Sur</li>
                    <li>Coordenadas geograficas para visualizacion en mapa</li>
                  </ul>
                </div>

                <div className="data-source">
                  <h4>Hoja "Leads" (136,431 registros)</h4>
                  <ul>
                    <li>Registros de prospectos desde enero 2023</li>
                    <li>Fecha de registro (generacion del lead)</li>
                    <li>Fecha de contacto efectivo</li>
                    <li>Fecha de cita agendada</li>
                    <li>Fecha de venta bruta</li>
                    <li>Fecha de escrituracion</li>
                  </ul>
                </div>
              </section>
            )}

            {activeSection === 'procesamiento' && (
              <section>
                <h3>2. Procesamiento de Datos (Python/Pandas)</h3>

                <div className="process-step">
                  <h4>2.1 Carga y Limpieza</h4>
                  <ul>
                    <li>Importacion de las 3 hojas del Excel usando <code>pandas.read_excel()</code></li>
                    <li>Conversion de columnas de fecha a formato <code>datetime</code></li>
                    <li>Normalizacion de nombres de columnas (minusculas, sin espacios)</li>
                    <li>Tratamiento de valores nulos</li>
                  </ul>
                </div>

                <div className="process-step">
                  <h4>2.2 Geolocalizacion</h4>
                  <ul>
                    <li>Mapeo de ciudades a coordenadas geograficas</li>
                    <li>Diccionario de 20+ ciudades mexicanas con lat/lng</li>
                    <li>Asignacion automatica segun ciudad del desarrollo</li>
                  </ul>
                </div>

                <div className="process-step">
                  <h4>2.3 Calculo de Semanas ISO</h4>
                  <ul>
                    <li>Extraccion de ano y semana ISO de cada fecha de registro</li>
                    <li>Formato: <code>YYYY-WNN</code> (ej: 2024-W01)</li>
                    <li>Base para agrupacion de cohorts</li>
                  </ul>
                </div>

                <div className="process-step">
                  <h4>2.4 Pre-calculo de Cohorts</h4>
                  <ul>
                    <li>Operaciones vectorizadas con pandas para maxima eficiencia</li>
                    <li>Calculo de semanas desde registro hasta cada conversion</li>
                    <li>Porcentajes acumulados por semana transcurrida</li>
                    <li>Generacion de matrices heatmap por etapa</li>
                  </ul>
                </div>
              </section>
            )}

            {activeSection === 'cohorts' && (
              <section>
                <h3>3. Analisis de Cohorts (Cosechas)</h3>

                <div className="concept-box">
                  <h4>Que es un Cohort (Cosecha)?</h4>
                  <p>
                    Un <strong>cohort</strong> es un grupo de leads que se registraron en la misma semana.
                    Por ejemplo, "2024-W05" agrupa todos los leads de la semana 5 de 2024.
                  </p>
                </div>

                <div className="interpretation-box">
                  <h4>Como Leer el Heatmap</h4>
                  <p>La tabla muestra el % de leads que han alcanzado una etapa segun el tiempo transcurrido:</p>
                  <ul>
                    <li><strong>Cada fila</strong> = un cohort (semana de registro del lead)</li>
                    <li><strong>Cada columna (+0, +1, +2...)</strong> = semanas desde el registro</li>
                    <li><strong>El numero/color</strong> = % de leads que ya alcanzaron esa etapa</li>
                  </ul>
                </div>

                <div className="concept-box highlight">
                  <h4>Ejemplo Practico</h4>
                  <p>
                    Si en la fila <strong>"2024-W05"</strong>, columna <strong>"+2"</strong> ves <strong>45%</strong>
                    en la vista de "Contacto", significa:
                  </p>
                  <p>
                    <em>"El 45% de los leads registrados en la semana 5 de 2024 ya fueron contactados
                    dentro de las primeras 2 semanas desde su registro."</em>
                  </p>
                </div>

                <div className="why-box">
                  <h4>Para que Sirve?</h4>
                  <ol>
                    <li><strong>Comparar velocidad:</strong> Ver si cosechas recientes convierten mas rapido o lento</li>
                    <li><strong>Evaluar campanas:</strong> Detectar si leads de ciertas semanas tienen mejor calidad</li>
                    <li><strong>Medir tiempos:</strong> Saber cuanto tarda en promedio llegar a cada etapa</li>
                    <li><strong>Predecir:</strong> Estimar conversiones futuras basadas en patrones historicos</li>
                  </ol>
                </div>

                <div className="visualization-box">
                  <h4>Interpretacion de Colores</h4>
                  <ul>
                    <li><strong>Azul oscuro (80-100%):</strong> Alta conversion - muy buena cosecha</li>
                    <li><strong>Azul medio (40-80%):</strong> Conversion normal</li>
                    <li><strong>Azul claro (0-40%):</strong> Baja conversion o pocas semanas transcurridas</li>
                    <li><strong>Sin color:</strong> No hay datos (cosecha muy reciente)</li>
                  </ul>
                </div>
              </section>
            )}

            {activeSection === 'funnel' && (
              <section>
                <h3>4. Metodologia del Funnel Comercial</h3>

                <div className="funnel-stages">
                  <h4>Etapas del Funnel (Secuenciales)</h4>
                  <div className="stage-flow">
                    <span className="stage">Lead</span>
                    <span className="arrow">→</span>
                    <span className="stage">Contacto</span>
                    <span className="arrow">→</span>
                    <span className="stage">Cita</span>
                    <span className="arrow">→</span>
                    <span className="stage">Venta Bruta</span>
                    <span className="arrow">→</span>
                    <span className="stage">Escrituracion</span>
                  </div>
                </div>

                <div className="concept-box highlight">
                  <h4>Logica de Secuencia</h4>
                  <p>
                    El funnel respeta la secuencia comercial: un lead solo cuenta en "Cita" si tambien
                    tiene "Contacto", solo cuenta en "Venta" si tiene "Cita" y "Contacto", etc.
                  </p>
                  <p>
                    Esto asegura que el funnel siempre sea <strong>decreciente</strong> (cada etapa
                    tiene igual o menos leads que la anterior).
                  </p>
                </div>

                <div className="metrics-definition">
                  <h4>Metricas por Etapa</h4>
                  <ul>
                    <li><strong>Cantidad:</strong> Numero de registros que alcanzaron la etapa</li>
                    <li><strong>% del total:</strong> Conversion acumulada desde el inicio</li>
                    <li><strong>% de conversion:</strong> Tasa desde la etapa anterior</li>
                    <li><strong>Costo por conversion:</strong> Inversion total / Conversiones</li>
                  </ul>
                </div>

                <div className="formulas-box">
                  <h4>Formulas</h4>
                  <div className="formula">
                    <code>Tasa de conversion = (Conversiones en etapa N) / (Conversiones en etapa N-1) x 100</code>
                  </div>
                  <div className="formula">
                    <code>Costo por Lead = Inversion Total / Total Leads</code>
                  </div>
                  <div className="formula">
                    <code>Costo por Escrituracion = Inversion Total / Total Escrituraciones</code>
                  </div>
                  <div className="formula">
                    <code>Conversion General = Total Escrituraciones / Total Leads x 100</code>
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'stack' && (
              <section>
                <h3>5. Stack Tecnologico</h3>

                <div className="tech-section">
                  <h4>Backend (Python/FastAPI)</h4>
                  <ul>
                    <li><strong>FastAPI:</strong> Framework web moderno y rapido</li>
                    <li><strong>Pandas:</strong> Procesamiento y analisis de datos tabulares</li>
                    <li><strong>NumPy:</strong> Operaciones numericas vectorizadas</li>
                    <li><strong>Uvicorn:</strong> Servidor ASGI de alto rendimiento</li>
                    <li><strong>Pydantic:</strong> Validacion de datos y esquemas</li>
                  </ul>
                </div>

                <div className="tech-section">
                  <h4>Frontend (TypeScript/React)</h4>
                  <ul>
                    <li><strong>React 18:</strong> Libreria de UI con componentes reactivos</li>
                    <li><strong>Vite:</strong> Build tool con Hot Module Replacement</li>
                    <li><strong>TypeScript:</strong> Tipado estatico para mayor seguridad</li>
                    <li><strong>ECharts:</strong> Libreria de visualizacion para heatmaps y funnels</li>
                    <li><strong>Leaflet:</strong> Mapas interactivos con OpenStreetMap</li>
                    <li><strong>React Router:</strong> Navegacion entre paginas</li>
                  </ul>
                </div>

                <div className="tech-section">
                  <h4>Arquitectura de Datos</h4>
                  <ul>
                    <li><strong>API REST:</strong> Endpoints para cada tipo de datos</li>
                    <li><strong>Cache en memoria:</strong> Metricas pre-calculadas al inicio</li>
                    <li><strong>Filtros dinamicos:</strong> Parametros de query para filtrar datos</li>
                    <li><strong>CORS habilitado:</strong> Permite consumo desde el frontend</li>
                  </ul>
                </div>

                <div className="why-box">
                  <h4>Ventajas de esta Arquitectura</h4>
                  <ol>
                    <li><strong>Filtros dinamicos:</strong> Datos segmentados en tiempo real</li>
                    <li><strong>Escalabilidad:</strong> Facil agregar nuevos endpoints</li>
                    <li><strong>Documentacion:</strong> Swagger UI automatico en /docs</li>
                    <li><strong>Open Source:</strong> Sin costos de licencias</li>
                    <li><strong>Python ecosystem:</strong> Facil integracion con ML/analytics</li>
                  </ol>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Boton para abrir el modal
export const MethodologyButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="methodology-button" onClick={() => setIsOpen(true)}>
        Metodologia
      </button>
      <MethodologyModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
