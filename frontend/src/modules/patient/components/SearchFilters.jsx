import React, { useState } from 'react';
import { Search, SlidersHorizontal, RotateCcw, Stethoscope, ShieldCheck, X } from 'lucide-react';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';

export const SearchFilters = ({
  filters,
  specialties = [],
  healthInsurances = [],
  onFilterChange,
  onReset,
  totalResults = 0,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const hasActiveFilters = Boolean(
    filters.nombre || filters.especialidadId || filters.obraSocialId
  );

  const filterFields = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Búsqueda por Nombre */}
      <div>
        <Input
          id="search-doctor-name"
          label="Buscar por Nombre"
          placeholder="Ej: Dr. Pérez, Carlos..."
          value={filters.nombre}
          onChange={(e) => onFilterChange('nombre', e.target.value)}
          icon={<Search className="w-4 h-4 text-slate-400" aria-hidden="true" />}
        />
      </div>

      {/* Filtro por Especialidad */}
      <div>
        <label
          htmlFor="filter-specialty"
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          Especialidad
        </label>
        <div className="relative">
          <select
            id="filter-specialty"
            value={filters.especialidadId}
            onChange={(e) => onFilterChange('especialidadId', e.target.value)}
            className="w-full h-11 px-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all cursor-pointer"
          >
            <option value="">Todas las especialidades</option>
            {specialties.map((esp) => (
              <option key={esp.id} value={esp.id}>
                {esp.nombre}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Stethoscope className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Filtro por Obra Social */}
      <div>
        <label
          htmlFor="filter-insurance"
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          Obra Social / Prepaga
        </label>
        <div className="relative">
          <select
            id="filter-insurance"
            value={filters.obraSocialId}
            onChange={(e) => onFilterChange('obraSocialId', e.target.value)}
            className="w-full h-11 px-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all cursor-pointer"
          >
            <option value="">Cualquier cobertura / Particular</option>
            {healthInsurances.map((os) => (
              <option key={os.id} value={os.id}>
                {os.nombre}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs mb-6">
      {/* Barra superior de filtros: Contador y Botón Móvil */}
      <div className="flex items-center justify-between gap-4 mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-teal-600" aria-hidden="true" />
          <h2 className="text-sm font-bold text-slate-800 font-heading tracking-tight">
            Filtrar Profesionales
          </h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
            {totalResults} disponibles
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              aria-label="Restablecer filtros"
              className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Limpiar</span>
            </button>
          )}

          {/* Botón para abrir filtros en Móvil */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700"
          >
            {isMobileOpen ? <X className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
            <span>{isMobileOpen ? 'Cerrar' : 'Filtros'}</span>
          </button>
        </div>
      </div>

      {/* Contenido en Escritorio */}
      <div className="hidden md:block">{filterFields}</div>

      {/* Drawer / Desplegable en Móvil */}
      {isMobileOpen && (
        <div className="md:hidden pt-3 border-t border-slate-100 animate-in fade-in duration-150">
          {filterFields}
        </div>
      )}
    </div>
  );
};
