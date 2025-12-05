import React from 'react';
import './Pages.css';
import './MethodologyPage.css';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="methodology-page">
      <header className="methodology-header">
        <h1>Metodologia y Arquitectura</h1>
        <p>
          Documentacion tecnica del dashboard de analisis de cohortes y funnel comercial.
        </p>
      </header>

      <main className="methodology-content">
        {/* Resumen Ejecutivo */}
        <section className="methodology-section">
          <h2>Resumen del Proyecto</h2>
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Objetivo</h3>
              <p>
                Visualizar y analizar el proceso comercial de venta de bienes raices,
                desde la captacion del lead hasta la escrituracion, identificando
                tasas de conversion y cuellos de botella.
              </p>
            </div>
            <div className="summary-card">
              <h3>Datos Procesados</h3>
              <ul>
                <li><strong>136,431</strong> leads</li>
                <li><strong>6,299</strong> registros de inversion</li>
                <li><strong>15</strong> desarrollos</li>
                <li><strong>3</strong> regiones (Norte, Centro, Sur)</li>
              </ul>
            </div>
            <div className="summary-card">
              <h3>Tecnologias</h3>
              <ul>
                <li>React + TypeScript</li>
                <li>ECharts (visualizaciones)</li>
                <li>Leaflet (mapas)</li>
                <li>Python + Pandas (procesamiento)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ==================== SECCION 1: ARQUITECTURA ACTUAL ==================== */}
        <section className="methodology-section architecture-current">
          <h2>
            <span className="badge badge-success">EN USO</span>
            Arquitectura Actual: Datos Estaticos
          </h2>

          <div className="architecture-intro">
            <p>
              <strong>Esta es la arquitectura que usa actualmente el dashboard.</strong> Los datos se
              pre-calculan una sola vez y se despliegan como archivos JSON estaticos en GitHub Pages,
              sin necesidad de un servidor backend activo.
            </p>
          </div>

          <h3>Diagrama de Flujo</h3>
          <div className="architecture-diagram">
            <div className="arch-box">
              <h4>1. Datos Fuente</h4>
              <p>Excel (.xlsx)</p>
              <small>Datos_prueba_v3.xlsx</small>
            </div>
            <div className="arch-arrow">&#8594;</div>
            <div className="arch-box highlight">
              <h4>2. Procesamiento</h4>
              <p>Python Script</p>
              <small>generate_static_data.py</small>
            </div>
            <div className="arch-arrow">&#8594;</div>
            <div className="arch-box">
              <h4>3. JSON Estaticos</h4>
              <p>Pre-calculados</p>
              <small>/public/data/*.json</small>
            </div>
            <div className="arch-arrow">&#8594;</div>
            <div className="arch-box">
              <h4>4. Frontend React</h4>
              <p>SPA + Vite</p>
              <small>Carga JSON locales</small>
            </div>
            <div className="arch-arrow">&#8594;</div>
            <div className="arch-box">
              <h4>5. Hosting</h4>
              <p>GitHub Pages</p>
              <small>Gratuito</small>
            </div>
          </div>

          <h3>Archivos JSON Generados</h3>
          <div className="files-list">
            <div className="file-item">
              <code>filter-options.json</code>
              <span>Opciones disponibles para filtros (desarrollos, regiones, anos, semanas ISO)</span>
            </div>
            <div className="file-item">
              <code>metrics.json</code>
              <span>Metricas pre-calculadas por region, desarrollo, ano y semana ISO</span>
            </div>
            <div className="file-item">
              <code>funnel.json</code>
              <span>Datos del funnel comercial con todas las combinaciones de filtros</span>
            </div>
            <div className="file-item">
              <code>trends.json</code>
              <span>Tendencias de conversion mensuales por cada filtro</span>
            </div>
            <div className="file-item">
              <code>developments.json</code>
              <span>Datos de desarrollos con coordenadas, leads, ventas y conversion</span>
            </div>
          </div>

          <h3>Casos de Uso Ideales</h3>
          <ul className="use-cases">
            <li><strong>Demos y presentaciones:</strong> Dashboard funcional sin infraestructura</li>
            <li><strong>Datos historicos:</strong> Analisis de datos que no cambian frecuentemente</li>
            <li><strong>Bajo presupuesto:</strong> Hosting gratuito en GitHub Pages</li>
            <li><strong>Portabilidad:</strong> Funciona offline despues de cargar</li>
          </ul>

          <div className="pros-cons-grid">
            <div className="pros-box">
              <h4>Ventajas</h4>
              <ul className="pros-list">
                <li>Sin costos de servidor ni mantenimiento</li>
                <li>Carga ultra-rapida (datos ya calculados)</li>
                <li>Hosting 100% gratuito con GitHub Pages</li>
                <li>Sin dependencias en tiempo de ejecucion</li>
                <li>Funciona offline despues del primer load</li>
              </ul>
            </div>
            <div className="cons-box">
              <h4>Limitaciones</h4>
              <ul className="cons-list">
                <li>Datos estaticos (requiere regenerar para actualizar)</li>
                <li>Filtros limitados a combinaciones pre-calculadas</li>
                <li>No apto para datos en tiempo real</li>
                <li>Tamano de archivos JSON puede crecer</li>
              </ul>
            </div>
          </div>

          <h3>Como Actualizar los Datos</h3>
          <div className="code-block">
            <pre>{`# 1. Actualizar el archivo Excel con nuevos datos
# (colocar en backend/data/Datos_prueba_v3.xlsx)

# 2. Regenerar los archivos JSON
cd backend
python generate_static_data.py

# 3. Reconstruir el frontend
cd frontend
npm run build

# 4. Desplegar a GitHub Pages
# (los archivos en dist/ estan listos para subir)`}</pre>
          </div>
        </section>

        {/* ==================== SECCION 2: ARQUITECTURA PROPUESTA ==================== */}
        <section className="methodology-section architecture-proposed">
          <h2>
            <span className="badge badge-info">PROPUESTA</span>
            Arquitectura Alternativa: API REST en Tiempo Real
          </h2>

          <div className="architecture-intro">
            <p>
              <strong>Esta arquitectura esta disponible pero no se usa en produccion.</strong> Implementa
              un backend FastAPI que procesa datos en tiempo real, ideal para escenarios con datos
              dinamicos o integraciones con sistemas externos.
            </p>
          </div>

          <h3>Diagrama de Flujo</h3>
          <div className="architecture-diagram">
            <div className="arch-box">
              <h4>1. Base de Datos</h4>
              <p>PostgreSQL / Excel</p>
              <small>Datos actualizados</small>
            </div>
            <div className="arch-arrow">&#8594;</div>
            <div className="arch-box highlight">
              <h4>2. Backend API</h4>
              <p>FastAPI + Pandas</p>
              <small>Procesa en tiempo real</small>
            </div>
            <div className="arch-arrow">&#8594;</div>
            <div className="arch-box">
              <h4>3. Frontend React</h4>
              <p>Consume API REST</p>
              <small>Filtros dinamicos</small>
            </div>
            <div className="arch-arrow">&#8594;</div>
            <div className="arch-box">
              <h4>4. Servidor Cloud</h4>
              <p>AWS / Azure / GCP</p>
              <small>Costo mensual</small>
            </div>
          </div>

          <h3>Endpoints de la API</h3>
          <div className="api-docs">
            <div className="endpoint">
              <code>GET /api/v1/metrics/</code>
              <p>Retorna metricas de inversion y conversion con filtros opcionales.</p>
              <strong>Parametros de query:</strong>
              <ul>
                <li><code>desarrollos</code> - Lista de desarrollos separados por coma</li>
                <li><code>regiones</code> - Lista de regiones separadas por coma</li>
                <li><code>year</code> - Ano (ej: 2024)</li>
                <li><code>month</code> - Mes (1-12)</li>
                <li><code>week_iso</code> - Semana ISO (ej: 2024-W01)</li>
              </ul>
            </div>

            <div className="endpoint">
              <code>GET /api/v1/funnel/</code>
              <p>Retorna datos del funnel comercial con etapas y conversiones.</p>
            </div>

            <div className="endpoint">
              <code>GET /api/v1/funnel/trends</code>
              <p>Retorna tendencias de conversion por periodo (mensual).</p>
            </div>

            <div className="endpoint">
              <code>GET /api/v1/developments/</code>
              <p>Retorna lista de desarrollos con coordenadas geograficas y metricas.</p>
            </div>

            <div className="endpoint">
              <code>GET /api/v1/filters/options</code>
              <p>Retorna opciones disponibles para filtros (desarrollos, regiones, anos).</p>
            </div>

            <div className="endpoint">
              <code>GET /docs</code>
              <p>Documentacion interactiva Swagger UI (generada automaticamente).</p>
            </div>
          </div>

          <h3>Servicios del Backend</h3>
          <div className="services-grid">
            <div className="service-item">
              <h4>DataLoader</h4>
              <p>Carga y cachea datos desde Excel o base de datos. Pre-calcula metricas al inicio.</p>
            </div>
            <div className="service-item">
              <h4>MetricsCalculator</h4>
              <p>Calcula KPIs, tasas de conversion y costos por etapa en tiempo real.</p>
            </div>
            <div className="service-item">
              <h4>FunnelAnalysis</h4>
              <p>Procesa etapas del funnel respetando la secuencia comercial.</p>
            </div>
            <div className="service-item">
              <h4>CohortAnalysis</h4>
              <p>Genera matrices de cohorts y heatmaps por semana ISO.</p>
            </div>
          </div>

          <h3>Casos de Uso Ideales</h3>
          <ul className="use-cases">
            <li><strong>Datos en tiempo real:</strong> CRM conectado con actualizaciones diarias</li>
            <li><strong>Filtros complejos:</strong> Combinaciones de filtros no predefinidas</li>
            <li><strong>Integraciones:</strong> Conexion con sistemas externos via API</li>
            <li><strong>Escalabilidad:</strong> Millones de registros con paginacion</li>
            <li><strong>Seguridad:</strong> Autenticacion y control de acceso</li>
          </ul>

          <div className="pros-cons-grid">
            <div className="pros-box">
              <h4>Ventajas</h4>
              <ul className="pros-list">
                <li>Datos en tiempo real sin regenerar</li>
                <li>Filtros dinamicos sin limitaciones</li>
                <li>Escalable a millones de registros</li>
                <li>Integracion con sistemas externos</li>
                <li>Autenticacion y seguridad avanzada</li>
                <li>Documentacion automatica (Swagger)</li>
              </ul>
            </div>
            <div className="cons-box">
              <h4>Consideraciones</h4>
              <ul className="cons-list">
                <li>Requiere servidor (costo mensual ~$20-100 USD)</li>
                <li>Mayor complejidad de despliegue</li>
                <li>Necesita mantenimiento del backend</li>
                <li>Latencia en calculos complejos</li>
              </ul>
            </div>
          </div>

          <h3>Como Ejecutar Localmente</h3>
          <div className="code-block">
            <pre>{`# 1. Iniciar el backend
cd backend
./venv/Scripts/python.exe -m uvicorn main:app --reload --port 8000

# 2. Verificar API funcionando
# Abrir http://localhost:8000/docs

# 3. Configurar frontend para usar API
# Cambiar en frontend/src/api/index.ts:
# export * from './client';  # En lugar de staticClient`}</pre>
          </div>
        </section>

        {/* ==================== SECCION 3: COMPARATIVA ==================== */}
        <section className="methodology-section">
          <h2>Comparativa de Arquitecturas</h2>

          <table className="comparison-table">
            <thead>
              <tr>
                <th>Caracteristica</th>
                <th>Estatica (Actual)</th>
                <th>API REST (Propuesta)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Costo de hosting</strong></td>
                <td className="highlight-good">Gratis (GitHub Pages)</td>
                <td>$20-100 USD/mes</td>
              </tr>
              <tr>
                <td><strong>Actualizacion de datos</strong></td>
                <td>Manual (regenerar JSONs)</td>
                <td className="highlight-good">Automatica (tiempo real)</td>
              </tr>
              <tr>
                <td><strong>Velocidad de carga</strong></td>
                <td className="highlight-good">Ultra-rapida</td>
                <td>Depende del servidor</td>
              </tr>
              <tr>
                <td><strong>Filtros disponibles</strong></td>
                <td>Pre-calculados</td>
                <td className="highlight-good">Ilimitados</td>
              </tr>
              <tr>
                <td><strong>Complejidad</strong></td>
                <td className="highlight-good">Baja</td>
                <td>Media-Alta</td>
              </tr>
              <tr>
                <td><strong>Escalabilidad</strong></td>
                <td>Limitada por tamano JSON</td>
                <td className="highlight-good">Alta (millones de registros)</td>
              </tr>
              <tr>
                <td><strong>Integraciones</strong></td>
                <td>No disponibles</td>
                <td className="highlight-good">API REST estandar</td>
              </tr>
              <tr>
                <td><strong>Funcionamiento offline</strong></td>
                <td className="highlight-good">Si</td>
                <td>No</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Metricas del Negocio */}
        <section className="methodology-section">
          <h2>Metricas del Negocio</h2>

          <h3>Etapas del Funnel (Secuencial)</h3>
          <div className="funnel-stages-visual">
            <div className="funnel-stage">
              <span className="stage-name">Lead</span>
              <span className="stage-desc">Prospecto registrado</span>
            </div>
            <div className="funnel-arrow">&#8594;</div>
            <div className="funnel-stage">
              <span className="stage-name">Contacto</span>
              <span className="stage-desc">Comunicacion efectiva</span>
            </div>
            <div className="funnel-arrow">&#8594;</div>
            <div className="funnel-stage">
              <span className="stage-name">Cita</span>
              <span className="stage-desc">Visita agendada</span>
            </div>
            <div className="funnel-arrow">&#8594;</div>
            <div className="funnel-stage">
              <span className="stage-name">Venta Bruta</span>
              <span className="stage-desc">Apartado o compra</span>
            </div>
            <div className="funnel-arrow">&#8594;</div>
            <div className="funnel-stage">
              <span className="stage-name">Escrituracion</span>
              <span className="stage-desc">Firma de escrituras</span>
            </div>
          </div>

          <div className="important-note">
            <h4>Logica Acumulativa del Funnel</h4>
            <p>
              El funnel respeta la secuencia comercial: un lead solo cuenta en "Cita" si tambien
              tiene "Contacto", solo cuenta en "Venta" si tiene "Cita" y "Contacto", etc.
              Esto asegura que el funnel siempre sea <strong>decreciente</strong>.
            </p>
          </div>

          <h3>KPIs Calculados</h3>
          <table className="metrics-table">
            <thead>
              <tr>
                <th>Metrica</th>
                <th>Formula</th>
                <th>Interpretacion</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Costo por Lead</strong></td>
                <td>Inversion Total / Total Leads</td>
                <td>Costo promedio de adquisicion de un prospecto</td>
              </tr>
              <tr>
                <td><strong>Costo por Venta</strong></td>
                <td>Inversion Total / Ventas Brutas</td>
                <td>Costo promedio para lograr una venta</td>
              </tr>
              <tr>
                <td><strong>Conversion Lead &#8594; Contacto</strong></td>
                <td>(Contactos / Leads) * 100</td>
                <td>Efectividad del equipo de contacto</td>
              </tr>
              <tr>
                <td><strong>Conversion Cita &#8594; Venta</strong></td>
                <td>(Ventas / Citas) * 100</td>
                <td>Efectividad de cierre en citas</td>
              </tr>
              <tr>
                <td><strong>Conversion General</strong></td>
                <td>(Escrituraciones / Leads) * 100</td>
                <td>Eficiencia global del proceso comercial (~80%)</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Estructura del Proyecto */}
        <section className="methodology-section">
          <h2>Estructura del Proyecto</h2>
          <div className="code-block">
            <pre>{`cohort-funnel-dashboard/
├── backend/
│   ├── app/
│   │   ├── api/routes/          # Endpoints de la API (version REST)
│   │   ├── models/              # Esquemas Pydantic
│   │   └── services/            # Logica de negocio
│   ├── data/                    # Archivo Excel fuente
│   ├── generate_static_data.py  # Generador de JSON estaticos
│   └── main.py                  # Entry point del backend
│
├── frontend/
│   ├── public/
│   │   └── data/                # JSONs pre-calculados (arquitectura actual)
│   │       ├── filter-options.json
│   │       ├── metrics.json
│   │       ├── funnel.json
│   │       ├── trends.json
│   │       └── developments.json
│   ├── src/
│   │   ├── api/
│   │   │   ├── staticClient.ts  # Cliente para datos estaticos (ACTUAL)
│   │   │   └── client.ts        # Cliente para API REST (propuesta)
│   │   ├── components/          # Componentes React
│   │   ├── context/             # Estado global (filtros)
│   │   ├── pages/               # Paginas de la app
│   │   └── types/               # Tipos TypeScript
│   └── vite.config.ts           # Configuracion de Vite
│
└── README.md`}</pre>
          </div>
        </section>

        {/* Guia de Despliegue */}
        <section className="methodology-section">
          <h2>Guia de Despliegue a GitHub Pages</h2>

          <div className="code-block">
            <pre>{`# 1. Generar datos estaticos (si hay cambios en el Excel)
cd backend
python generate_static_data.py

# 2. Construir el frontend
cd frontend
npm run build

# 3. Crear rama gh-pages (solo la primera vez)
git checkout -b gh-pages

# 4. Copiar contenido de dist/ a la raiz
cp -r dist/* .

# 5. Commit y push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# 6. Configurar GitHub Pages
# Settings > Pages > Source: gh-pages branch`}</pre>
          </div>
        </section>
      </main>
    </div>
  );
};
