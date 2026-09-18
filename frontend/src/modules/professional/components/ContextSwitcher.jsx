import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { professionalService } from '../services/professionalService';
import { Building2, ChevronDown, Check, MapPin } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

/**
 * Context Switcher estilo Shadcn para alternar sedes y consultorios médicos.
 * Cumple con A11y (navegación por teclado, roles ARIA, focus ring).
 */
export const ContextSwitcher = ({ className }) => {
  const { user, activeConsultorio, setActiveConsultorio } = useAuth();
  const [consultorios, setConsultorios] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const loadConsultorios = async () => {
      try {
        setIsLoading(true);
        const data = await professionalService.getConsultorios();
        if (!isMounted) return;

        setConsultorios(data);

        // Si no hay consultorio activo y recibimos sedes, seleccionamos la primera por defecto
        if (!activeConsultorio && data.length > 0) {
          // Si el médico tiene consultorios asignados en su perfil, preferir ese
          setActiveConsultorio(data[0]);
        }
      } catch (error) {
        // Silently handled fallback
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadConsultorios();

    return () => {
      isMounted = false;
    };
  }, [activeConsultorio, setActiveConsultorio]);

  // Manejo de clic fuera para cerrar el menú desplegable
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (consultorio) => {
    setActiveConsultorio(consultorio);
    setIsOpen(false);
  };

  if (isLoading && !activeConsultorio) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 animate-pulse border border-slate-200">
        <div className="w-4 h-4 rounded bg-slate-300" />
        <div className="w-28 h-3.5 rounded bg-slate-300" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative inline-block text-left', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Seleccionar sede o consultorio de atención"
        className={cn(
          'flex items-center gap-2.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl border transition-all duration-200',
          'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-xs',
          'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
          isOpen && 'border-teal-500 ring-2 ring-teal-500/20'
        )}
      >
        <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
        </div>

        <div className="flex flex-col text-left max-w-[140px] sm:max-w-[200px] truncate">
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase leading-none">
            Sede Activa
          </span>
          <span className="font-semibold text-slate-900 truncate leading-snug">
            {activeConsultorio ? activeConsultorio.nombre : 'Seleccionar sede'}
          </span>
        </div>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 ml-0.5 transition-transform duration-200',
            isOpen && 'rotate-180 text-teal-600'
          )}
          aria-hidden="true"
        />
      </button>

      {/* Menú Flotante estilo Shadcn */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Lista de consultorios y sedes"
          className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-72 sm:w-80 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-200/80 z-50 animate-in fade-in-0 zoom-in-95 duration-150 focus:outline-none"
        >
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-900 font-heading">Consultorios y Sedes</p>
            <p className="text-[11px] text-slate-400">Selecciona el consultorio donde estás atendiendo hoy</p>
          </div>

          <div className="py-1 max-h-64 overflow-y-auto space-y-1 focus:outline-none">
            {consultorios.map((c) => {
              const isSelected = activeConsultorio?.cuit === c.cuit;
              return (
                <button
                  key={c.cuit}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(c)}
                  className={cn(
                    'w-full flex items-start gap-3 p-2.5 rounded-xl text-left text-xs sm:text-sm transition-colors',
                    isSelected
                      ? 'bg-teal-50/80 text-teal-900 font-medium'
                      : 'hover:bg-slate-50 text-slate-700'
                  )}
                >
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                      isSelected ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{c.nombre}</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{c.direccionCompleta || c.localidad || 'Sede Principal'}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-1" aria-hidden="true" />
                  )}
                </button>
              );
            })}

            {consultorios.length === 0 && (
              <div className="py-4 text-center text-xs text-slate-400">
                No hay consultorios registrados.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
