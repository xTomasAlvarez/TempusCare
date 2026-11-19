import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  Check
} from 'lucide-react';
import { pillVariants } from '../../../shared/motion';

const RATING_OPTIONS = [
  { value: '', stars: 0, label: 'Todas las valoraciones', shortLabel: 'Todas las valoraciones' },
  { value: '5', stars: 5, label: '5 estrellas', shortLabel: '5 estrellas' },
  { value: '4', stars: 4, label: '4 o más estrellas', shortLabel: '4 o más' },
  { value: '3', stars: 3, label: '3 o más estrellas', shortLabel: '3 o más' },
  { value: '2', stars: 2, label: '2 o más estrellas', shortLabel: '2 o más' },
  { value: '1', stars: 1, label: '1 o más estrellas', shortLabel: '1 o más' },
];

const StarIcons = ({ count }) => (
  <span className="inline-flex items-center gap-0.5 shrink-0" aria-hidden="true">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`w-3.5 h-3.5 ${
          n <= count
            ? 'fill-current text-amber-500'
            : 'fill-none text-slate-300'
        }`}
        strokeWidth={2}
      />
    ))}
  </span>
);

const RatingFilterSelect = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  const selectedOption =
    RATING_OPTIONS.find((opt) => String(opt.value) === String(value || '')) || RATING_OPTIONS[0];

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const idx = RATING_OPTIONS.findIndex((o) => String(o.value) === String(value || ''));
      const nextIdx =
        e.key === 'ArrowDown'
          ? (idx + 1) % RATING_OPTIONS.length
          : (idx - 1 + RATING_OPTIONS.length) % RATING_OPTIONS.length;
      onChange(RATING_OPTIONS[nextIdx].value);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        id="filter-rating"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Calificación mínima: ${selectedOption.label}`}
        title={`Filtrar por calificación mínima (${selectedOption.label})`}
        className={`w-full h-10 px-3 rounded-xl border bg-white text-xs sm:text-sm text-slate-800 flex items-center justify-between gap-2 transition-all cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
          isOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {selectedOption.stars > 0 ? (
            <>
              <StarIcons count={selectedOption.stars} />
              <span className="truncate text-slate-800 font-semibold">{selectedOption.shortLabel}</span>
            </>
          ) : (
            <>
              <Star className="w-4 h-4 fill-amber-400 text-amber-500 shrink-0" strokeWidth={2} aria-hidden="true" />
              <span className="truncate">{selectedOption.label}</span>
            </>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180 text-primary-600' : ''}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            role="listbox"
            aria-label="Seleccionar calificación mínima"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 sm:left-0 mt-1.5 z-40 rounded-xl bg-white border border-slate-200/90 shadow-xl p-1.5 space-y-0.5 min-w-[235px] w-full"
          >
            {RATING_OPTIONS.map((opt) => {
              const isSelected = String(opt.value) === String(value || '');
              return (
                <li key={opt.value || 'all'} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full px-2.5 py-2 rounded-lg text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-primary-50 text-primary-800 font-bold'
                        : 'text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {opt.stars > 0 ? (
                        <>
                          <StarIcons count={opt.stars} />
                          <span className="truncate">{opt.label}</span>
                        </>
                      ) : (
                        <span className="truncate">{opt.label}</span>
                      )}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary-600 shrink-0" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomFilterSelect = ({
  id,
  label,
  icon: Icon,
  value,
  options = [],
  placeholder = 'Seleccionar...',
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  const allOptions = [{ value: '', label: placeholder }, ...options];
  const selectedOption =
    allOptions.find((opt) => String(opt.value) === String(value || '')) || allOptions[0];

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const idx = allOptions.findIndex((o) => String(o.value) === String(value || ''));
      const nextIdx =
        e.key === 'ArrowDown'
          ? (idx + 1) % allOptions.length
          : (idx - 1 + allOptions.length) % allOptions.length;
      onChange(allOptions[nextIdx].value);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${label}: ${selectedOption.label}`}
        title={`${label}: ${selectedOption.label}`}
        className={`w-full h-10 px-3 rounded-xl border bg-white text-xs sm:text-sm text-slate-800 flex items-center justify-between gap-2 transition-all cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
          isOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {Icon && <Icon className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={2} aria-hidden="true" />}
          <span className={`truncate ${value ? 'text-slate-900 font-semibold' : 'text-slate-800'}`}>
            {selectedOption.label}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180 text-primary-600' : ''}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            role="listbox"
            aria-label={`Seleccionar ${label}`}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 mt-1.5 z-40 rounded-xl bg-white border border-slate-200/90 shadow-xl p-1.5 space-y-0.5 max-h-60 overflow-y-auto"
          >
            {allOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value || '');
              return (
                <li key={String(opt.value) || 'all'} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full px-2.5 py-2 rounded-lg text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-primary-50 text-primary-800 font-bold'
                        : 'text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary-600 shrink-0" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

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

      {/* 2. Cuadrícula de Filtros en 4 Columnas Espaciadas (Alineación vertical uniforme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Filtro por Especialidad */}
        <div className="min-w-0">
          <label
            htmlFor="filter-specialty"
            className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5"
          >
            Especialidad
          </label>
          <CustomFilterSelect
            id="filter-specialty"
            label="Especialidad"
            icon={Stethoscope}
            value={filters.especialidadId || ''}
            placeholder="Todas las especialidades"
            options={specialties.map((esp) => ({ value: esp.id, label: esp.nombre }))}
            onChange={(val) => onFilterChange('especialidadId', val)}
          />
        </div>

        {/* Filtro por Obra Social */}
        <div className="min-w-0">
          <label
            htmlFor="filter-insurance"
            className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5"
          >
            Obra Social / Prepaga
          </label>
          <CustomFilterSelect
            id="filter-insurance"
            label="Obra Social / Prepaga"
            icon={ShieldPlus}
            value={filters.obraSocialId || ''}
            placeholder="Cualquier cobertura / Particular"
            options={healthInsurances.map((os) => ({ value: os.id, label: os.nombre }))}
            onChange={(val) => onFilterChange('obraSocialId', val)}
          />
        </div>

        {/* Filtro por Consultorio / Sede */}
        <div className="min-w-0">
          <label
            htmlFor="filter-consultorio"
            className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5"
          >
            Consultorio / Sede
          </label>
          <CustomFilterSelect
            id="filter-consultorio"
            label="Consultorio / Sede"
            icon={Building2}
            value={filters.consultorioCuit || ''}
            placeholder="Todas las sedes"
            options={consultorios.map((c) => ({ value: c.cuit, label: c.nombre }))}
            onChange={(val) => onFilterChange('consultorioCuit', val)}
          />
        </div>

        {/* Filtro por Calificación Mínima */}
        <div className="min-w-0">
          <label
            htmlFor="filter-rating"
            className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5"
          >
            Calificación Mínima
          </label>
          <RatingFilterSelect
            value={filters.minRating || ''}
            onChange={(val) => onFilterChange('minRating', val)}
          />
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
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" strokeWidth={2} aria-hidden="true" />
                  <span>
                    {Number(filters.minRating) === 5
                      ? '5 estrellas'
                      : `${filters.minRating} o más estrellas`}
                  </span>
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
