import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  SlidersHorizontal, 
  RotateCcw, 
  Stethoscope, 
  ShieldPlus, 
  Building2, 
  X, 
  Star,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { pillVariants } from '../../../shared/motion';

export const SearchFilters = ({
  filters,
  specialties = [],
  healthInsurances = [],
  consultorios = [],
  onFilterChange,
  onReset,
  totalResults = 0,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const hasActiveFilters = Boolean(
    filters.nombre || 
    filters.especialidadId || 
    filters.obraSocialId || 
    filters.consultorioCuit || 
    filters.minRating || 
    filters.sortByRating
  );

  const selectedSpecialty = specialties.find((s) => String(s.id) === String(filters.especialidadId));
  const selectedInsurance = healthInsurances.find((h) => String(h.id) === String(filters.obraSocialId));
  const selectedConsultorio = consultorios.find((c) => String(c.cuit) === String(filters.consultorioCuit));

  const filterFields = (
    <div className="space-y-4">
      {/* 1. Barra de Búsqueda Principal (Prominente y con ancho completo) */}
      <div className="relative">
        <label htmlFor="search-doctor-name" className="sr-only">
          Buscar Médico, Especialidad o Sede
        </label>
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <Search className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
        </div>
        <input
          id="search-doctor-name"
          type="text"
          placeholder="Buscar por nombre de médico, especialidad, patología o sede médica..."
          value={filters.nombre || ''}
          onChange={(e) => onFilterChange('nombre', e.target.value)}
          className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-2xs"
        />
        {filters.nombre && (
          <button
            type="button"
            onClick={() => onFilterChange('nombre', '')}
            aria-label="Limpiar término de búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. Cuadrícula de Filtros en 4 Columnas Espaciadas (Sin truncar textos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Filtro por Especialidad */}
        <div>
          <label
            htmlFor="filter-specialty"
            className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5"
          >
            Especialidad
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Stethoscope className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            </div>
            <select
              id="filter-specialty"
              value={filters.especialidadId || ''}
              onChange={(e) => onFilterChange('especialidadId', e.target.value)}
              className="w-full h-10 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer font-medium"
            >
              <option value="">Todas las especialidades</option>
              {specialties.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtro por Obra Social */}
        <div>
          <label
            htmlFor="filter-insurance"
            className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5"
          >
            Obra Social / Prepaga
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ShieldPlus className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            </div>
            <select
              id="filter-insurance"
              value={filters.obraSocialId || ''}
              onChange={(e) => onFilterChange('obraSocialId', e.target.value)}
              className="w-full h-10 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer font-medium"
            >
              <option value="">Cualquier cobertura / Particular</option>
              {healthInsurances.map((os) => (
                <option key={os.id} value={os.id}>
                  {os.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtro por Consultorio / Sede */}
        <div>
          <label
            htmlFor="filter-consultorio"
            className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5"
          >
            Consultorio / Sede
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Building2 className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            </div>
            <select
              id="filter-consultorio"
              value={filters.consultorioCuit || ''}
              onChange={(e) => onFilterChange('consultorioCuit', e.target.value)}
              className="w-full h-10 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer font-medium"
            >
              <option value="">Todas las sedes</option>
              {consultorios.map((c) => (
                <option key={c.cuit} value={c.cuit}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtro por Calificación Mínima */}
        <div>
          <label
            htmlFor="filter-rating"
            className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5"
          >
            Calificación Mínima
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" strokeWidth={2} aria-hidden="true" />
            </div>
            <select
              id="filter-rating"
              value={filters.minRating || ''}
              onChange={(e) => onFilterChange('minRating', e.target.value)}
              className="w-full h-10 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer font-medium"
            >
              <option value="">Todas las valoraciones</option>
              <option value="3">⭐ 3 o más estrellas</option>
              <option value="4">⭐⭐ 4 o más estrellas</option>
              <option value="5">⭐⭐⭐ 5 estrellas</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Barra Inferior: Ordenamiento y Chips de Filtros Activos */}
      <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Ordenar:
          </span>
          <button
            type="button"
            onClick={() => onFilterChange('sortByRating', !filters.sortByRating)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-transform duration-75 active:scale-[0.98] cursor-pointer ${
              filters.sortByRating
                ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs font-bold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filters.sortByRating ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
            <span>Mejor valorados primero</span>
            {filters.sortByRating && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-0.5" />
            )}
          </button>
        </div>

        {/* Chips de filtros activos para rápida remoción individual */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-0.5">
              Filtros:
            </span>

            <AnimatePresence mode="popLayout">
              {filters.nombre && (
                <motion.span
                  key="chip-nombre"
                  variants={pillVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-xs font-medium"
                >
                  <span className="max-w-[120px] truncate">"{filters.nombre}"</span>
                  <button
                    type="button"
                    onClick={() => onFilterChange('nombre', '')}
                    className="hover:text-slate-900 text-slate-400 active:scale-95 duration-75"
                    title="Quitar filtro de texto"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              )}

              {selectedSpecialty && (
                <motion.span
                  key="chip-specialty"
                  variants={pillVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 border border-primary-200/50 px-2 py-0.5 rounded-lg text-xs font-medium"
                >
                  <span>{selectedSpecialty.nombre}</span>
                  <button
                    type="button"
                    onClick={() => onFilterChange('especialidadId', '')}
                    className="hover:text-primary-900 text-primary-400 active:scale-95 duration-75"
                    title="Quitar especialidad"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              )}

              {selectedInsurance && (
                <motion.span
                  key="chip-insurance"
                  variants={pillVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 border border-primary-200/50 px-2 py-0.5 rounded-lg text-xs font-medium"
                >
                  <span>{selectedInsurance.nombre}</span>
                  <button
                    type="button"
                    onClick={() => onFilterChange('obraSocialId', '')}
                    className="hover:text-primary-900 text-primary-400 active:scale-95 duration-75"
                    title="Quitar obra social"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              )}

              {selectedConsultorio && (
                <motion.span
                  key="chip-consultorio"
                  variants={pillVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 border border-primary-200/50 px-2 py-0.5 rounded-lg text-xs font-medium"
                >
                  <span className="max-w-[140px] truncate">{selectedConsultorio.nombre}</span>
                  <button
                    type="button"
                    onClick={() => onFilterChange('consultorioCuit', '')}
                    className="hover:text-primary-900 text-primary-400 active:scale-95 duration-75"
                    title="Quitar sede"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              )}

              {filters.minRating && (
                <motion.span
                  key="chip-minrating"
                  variants={pillVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-lg text-xs font-medium"
                >
                  <span>⭐ {filters.minRating}+ estrellas</span>
                  <button
                    type="button"
                    onClick={() => onFilterChange('minRating', '')}
                    className="hover:text-amber-900 text-amber-500 active:scale-95 duration-75"
                    title="Quitar calificación mínima"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs mb-6">
      {/* Barra superior de filtros: Título, Contador y Botón Móvil */}
      <div className="flex items-center justify-between gap-4 mb-3 sm:mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800 font-heading tracking-tight">
                Filtrar Profesionales
              </h2>
              <span
                className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium"
                aria-live="polite"
                aria-atomic="true"
              >
                {totalResults} {totalResults === 1 ? 'disponible' : 'disponibles'}
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-400 mt-0.5">
              Filtra por nombre, especialidad médica, cobertura o valoración de pacientes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              aria-label="Restablecer todos los filtros"
              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-primary-50 transition-transform duration-75 active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Limpiar filtros</span>
            </button>
          )}

          {/* Botón para abrir filtros en Móvil */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-transform duration-75 active:scale-[0.98] cursor-pointer"
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
