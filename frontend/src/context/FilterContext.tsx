import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { FilterState, FilterOptions } from '../types';
import { fetchFilterOptions } from '../api';

interface FilterContextType {
  filters: FilterState;
  options: FilterOptions;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  isLoading: boolean;
}

const initialFilters: FilterState = {
  desarrollos: [],
  regiones: [],
  year: null,
  month: null,
  weekIso: null,
};

const initialOptions: FilterOptions = {
  desarrollos: [],
  regiones: [],
  years: [],
  months: [],
  weeks: [],
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [options, setOptions] = useState<FilterOptions>(initialOptions);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const data = await fetchFilterOptions();
        setOptions(data);
      } catch (error) {
        console.error('Error loading filter options:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadOptions();
  }, []);

  const setFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  return (
    <FilterContext.Provider value={{
      filters,
      options,
      setFilter,
      resetFilters,
      isLoading
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return context;
};
