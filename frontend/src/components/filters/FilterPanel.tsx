import React, { useState } from 'react';
import { useFilters } from '../../context/FilterContext';
import './FilterPanel.css';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const FilterPanel: React.FC = () => {
  const { filters, options, setFilter, resetFilters, isLoading } = useFilters();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDesarrolloChange = (desarrollo: string) => {
    const newDesarrollos = filters.desarrollos.includes(desarrollo)
      ? filters.desarrollos.filter(d => d !== desarrollo)
      : [...filters.desarrollos, desarrollo];
    setFilter('desarrollos', newDesarrollos);
  };

  const handleRegionChange = (region: string) => {
    const newRegiones = filters.regiones.includes(region)
      ? filters.regiones.filter(r => r !== region)
      : [...filters.regiones, region];
    setFilter('regiones', newRegiones);
  };

  const activeFiltersCount =
    filters.desarrollos.length +
    filters.regiones.length +
    (filters.year ? 1 : 0) +
    (filters.month ? 1 : 0) +
    (filters.weekIso ? 1 : 0);

  return (
    <aside className={`filter-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="filter-panel__header">
        <button
          className="btn-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expandir filtros' : 'Colapsar filtros'}
        >
          {isCollapsed ? '>' : '<'}
          {isCollapsed && activeFiltersCount > 0 && (
            <span className="filter-badge">{activeFiltersCount}</span>
          )}
        </button>
        {!isCollapsed && (
          <>
            <h2>Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}</h2>
            <button className="btn-reset" onClick={resetFilters}>
              Limpiar
            </button>
          </>
        )}
      </div>

      {!isCollapsed && (
        <>
          {isLoading ? (
            <p>Cargando filtros...</p>
          ) : (
            <div className="filter-panel__content">
              {/* Region */}
              <div className="filter-group">
                <label>Region</label>
                <div className="checkbox-group">
                  {options.regiones.map(region => (
                    <label key={region} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.regiones.includes(region)}
                        onChange={() => handleRegionChange(region)}
                      />
                      {region}
                    </label>
                  ))}
                </div>
              </div>

              {/* Desarrollo */}
              <div className="filter-group">
                <label>Desarrollo</label>
                <div className="checkbox-group scrollable">
                  {options.desarrollos.map(desarrollo => (
                    <label key={desarrollo} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.desarrollos.includes(desarrollo)}
                        onChange={() => handleDesarrolloChange(desarrollo)}
                      />
                      {desarrollo}
                    </label>
                  ))}
                </div>
              </div>

              {/* Ano */}
              <div className="filter-group">
                <label>Ano</label>
                <select
                  value={filters.year || ''}
                  onChange={(e) => setFilter('year', e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Todos</option>
                  {options.years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Mes */}
              <div className="filter-group">
                <label>Mes</label>
                <select
                  value={filters.month || ''}
                  onChange={(e) => setFilter('month', e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Todos</option>
                  {options.months.map(month => (
                    <option key={month} value={month}>{MONTH_NAMES[month - 1]}</option>
                  ))}
                </select>
              </div>

              {/* Semana ISO */}
              <div className="filter-group">
                <label>Semana ISO</label>
                <select
                  value={filters.weekIso || ''}
                  onChange={(e) => setFilter('weekIso', e.target.value || null)}
                >
                  <option value="">Todas</option>
                  {options.weeks.map(week => (
                    <option key={week} value={week}>{week}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </>
      )}
    </aside>
  );
};
