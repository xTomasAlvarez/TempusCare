import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Type, RotateCcw, Check, Sparkles, Sliders } from 'lucide-react';
import { useAccessibility, FONT_SCALES } from '../../../core/context/AccessibilityContext';
import { toastVariants } from '../../motion';

export const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { highContrast, toggleHighContrast, fontScale, setFontScale, resetAccessibility } = useAccessibility();
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  // Cerrar al pulsar Escape o hacer clic fuera
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !triggerRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left">
      {/* Botón Disparador del Menú */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title="Opciones de Accesibilidad Web (Alto contraste y tamaño de texto)"
        aria-label="Abrir panel de opciones de accesibilidad (Alto contraste y tamaño de fuente)"
        className={`h-9 px-2.5 sm:px-3 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-transform duration-75 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer ${
          isOpen || highContrast || fontScale !== FONT_SCALES.NORMAL
            ? 'bg-primary-50 text-primary-900 border-primary-300 shadow-xs'
            : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
        }`}
      >
        <Eye className="w-4 h-4 text-primary-600 shrink-0" strokeWidth={2} aria-hidden="true" />
        <span className="hidden md:inline">Accesibilidad</span>
        {(highContrast || fontScale !== FONT_SCALES.NORMAL) && (
          <span className="w-2 h-2 rounded-full bg-primary-600" aria-label="Ajustes de accesibilidad activos" />
        )}
      </button>

      {/* Panel Desplegable Accesible con Motion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="accessibility-panel"
            ref={menuRef}
            role="dialog"
            aria-modal="false"
            aria-label="Configuración de Accesibilidad Web"
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-4 z-50 text-slate-900 focus:outline-none"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary-600" aria-hidden="true" />
                <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-slate-800">
                  Accesibilidad (WCAG)
                </h3>
              </div>
              <button
                type="button"
                onClick={resetAccessibility}
                aria-label="Restablecer valores predeterminados de accesibilidad"
                className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 p-1 rounded-md hover:bg-slate-100 transition-transform duration-75 active:scale-[0.98] cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Opción 1: Alto Contraste (RNF-ACC-01 / RI-USR-07) */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Modo Alto Contraste</span>
                  <span className="text-[11px] text-slate-500 block">Bordes nítidos y contraste AAA</span>
                </div>
                <button
                  type="button"
                  onClick={toggleHighContrast}
                  role="switch"
                  aria-checked={highContrast}
                  aria-label="Activar o desactivar modo de alto contraste"
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    highContrast ? 'bg-primary-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-150 ease-in-out ${
                      highContrast ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Opción 2: Escalado Dinámico de Fuente (RNF-ACC-01 / RI-USR-07) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Type className="w-3.5 h-3.5 text-primary-600" aria-hidden="true" />
                    Tamaño del Texto
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {fontScale === FONT_SCALES.NORMAL ? '100%' : fontScale === FONT_SCALES.LARGE ? '112%' : '125%'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFontScale(FONT_SCALES.NORMAL)}
                    aria-pressed={fontScale === FONT_SCALES.NORMAL}
                    className={`py-2 px-1 rounded-xl border text-center text-xs font-semibold transition-transform duration-75 active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      fontScale === FONT_SCALES.NORMAL
                        ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-xs">Normal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFontScale(FONT_SCALES.LARGE)}
                    aria-pressed={fontScale === FONT_SCALES.LARGE}
                    className={`py-2 px-1 rounded-xl border text-center text-xs font-semibold transition-transform duration-75 active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      fontScale === FONT_SCALES.LARGE
                        ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-sm font-bold">A+</span>
                    <span className="block text-[10px] opacity-80">Grande</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFontScale(FONT_SCALES.XLARGE)}
                    aria-pressed={fontScale === FONT_SCALES.XLARGE}
                    className={`py-2 px-1 rounded-xl border text-center text-xs font-semibold transition-transform duration-75 active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      fontScale === FONT_SCALES.XLARGE
                        ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-base font-bold">A++</span>
                    <span className="block text-[10px] opacity-80">Extra</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
