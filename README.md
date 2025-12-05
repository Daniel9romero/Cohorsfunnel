# Dashboard de Análisis de Cohorts y Funnel Comercial

Dashboard web para análisis de leads inmobiliarios con cohorts semanales ("cosechas") y funnel comercial.

## Descripción

Esta aplicación reemplaza los reportes de Power BI para el análisis de leads inmobiliarios. Permite:

- **Análisis de Cohorts**: Visualizar cosechas semanales de leads y su progresión a través del funnel
- **Funnel Comercial**: Analizar tasas de conversión Lead → Contacto → Cita → Venta → Escrituración
- **Mapa de Desarrollos**: Ver ubicación geográfica de los 15 desarrollos con métricas
- **Métricas**: Inversión, costo por conversión, tasas de conversión
- **Filtros Dinámicos**: Por desarrollo, región, año, mes, semana ISO

## Stack Tecnológico

### Backend
- **FastAPI**: Framework web asíncrono para APIs REST
- **Pandas**: Procesamiento y análisis de datos
- **Pydantic**: Validación de datos
- **Uvicorn**: Servidor ASGI

### Frontend
- **React 18**: Librería de UI
- **Vite**: Build tool
- **TypeScript**: Tipado estático
- **ECharts**: Visualizaciones (heatmaps, funnels)
- **Leaflet**: Mapas interactivos
- **React Router**: Navegación

## Requisitos

- Python 3.10+
- Node.js 18+
- npm o yarn

## Instalación

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd cohort-funnel-dashboard
```

### 2. Backend
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Frontend
```bash
cd frontend
npm install
```

### 4. Datos
Asegúrate de que el archivo `Datos_prueba_v3.xlsx` esté en `backend/data/`

## Ejecución

### Backend (Terminal 1)
```bash
cd backend
venv\Scripts\activate  # Windows
uvicorn main:app --reload --port 8000
```

La API estará disponible en:
- http://localhost:8000
- Documentación Swagger: http://localhost:8000/docs

### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

La aplicación estará disponible en:
- http://localhost:5173

## Estructura del Proyecto

```
cohort-funnel-dashboard/
├── backend/
│   ├── main.py                 # Entry point FastAPI
│   ├── requirements.txt
│   ├── app/
│   │   ├── api/routes/         # Endpoints de la API
│   │   ├── models/             # Schemas Pydantic
│   │   └── services/           # Lógica de negocio
│   └── data/
│       └── Datos_prueba_v3.xlsx
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── api/                # Cliente API
│       ├── components/         # Componentes React
│       ├── context/            # Context API
│       ├── pages/              # Páginas
│       └── types/              # Tipos TypeScript
│
└── notebooks/                  # Jupyter notebooks (procesamiento)
```

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/filters/options` | Opciones para filtros |
| POST | `/api/v1/cohorts` | Datos de cohorts |
| POST | `/api/v1/cohorts/heatmap` | Datos para heatmap |
| POST | `/api/v1/funnel` | Datos del funnel |
| POST | `/api/v1/metrics` | Métricas calculadas |
| GET | `/api/v1/developments` | Desarrollos con ubicación |

## Características

### Análisis de Cohorts
- Heatmap de conversiones por semana
- Selección de etapa del funnel
- Interpretación visual de rendimiento

### Funnel Comercial
- Gráfico de embudo
- Tabla de conversiones
- Métricas por etapa

### Mapa
- Ubicaciones geolocalizadas
- Marcadores por región
- Métricas por desarrollo

### Metodología
- Botón flotante que abre documentación
- Explicación de fuentes de datos
- Metodología de cálculos
- Stack tecnológico

## Desarrollo

### Backend
```bash
cd backend
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm run dev
```

## Notas

- Los filtros se aplican en tiempo real
- El mapa usa OpenStreetMap (gratuito)
- Las coordenadas son aproximadas por ciudad

## Autor

Desarrollado como alternativa web a Power BI para análisis de cohorts y funnel comercial.
