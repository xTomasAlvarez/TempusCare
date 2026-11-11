import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, LogOut, X } from 'lucide-react';
import { Button } from './Button';
import { modalBackdropVariants, modalDialogVariants } from '../../motion';

/**
 * Modal de Advertencia Global para Acciones Destructivas y Cierre de Sesión.
 * Cumple estrictamente con las clases requeridas: bg-white rounded-xl shadow-lg p-6
 * Motion: Entrada táctil con spring rápido amortiguado y backdrop blur centrado sin scroll.
 */
export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Confirmar eliminación?',
  message = 'Esta acción es irreversible. Se eliminarán los datos definitivamente de la plataforma.',
  itemName = null,
  confirmText = 'Sí, eliminar definitivamente',
  cancelText = 'Cancelar',
  iconType = 'delete',
  isLoading = false,
}) => {
  const confirmButtonRef = useRef(null);
  const modalContainerRef = useRef(null);
  const isLogout = iconType === 'logout';

  // Bloquear scroll de fondo y auto-foco
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 50);
      return () => {
        document.body.style.overflow = 'unset';
        clearTimeout(timer);
      };
    }
  }, [isOpen]);

  // Manejar tecla Escape y Trampa de Foco (RNF-ACC-02)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape' && !isLoading) {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalContainerRef.current) {
        const focusable = modalContainerRef.current.querySelectorAll(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="confirm-delete-backdrop"
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          aria-describedby="confirm-delete-desc"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden bg-black/75 backdrop-blur-sm font-sans"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isLoading) onClose();
          }}
        >
          {/* Contenedor del Modal centrado sin scroll: bg-white rounded-2xl shadow-2xl p-6 */}
          <motion.div
            key="confirm-delete-dialog"
            ref={modalContainerRef}
            variants={modalDialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-slate-200/80 relative my-auto font-sans"
          >
            {/* Botón cerrar opcional */}
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              title="Cerrar ventana de confirmación (Esc)"
              aria-label="Cerrar modal de advertencia"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-transform duration-75 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icono de Advertencia o Cierre de Sesión */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3.5 ring-8 ring-rose-50">
                {isLogout ? (
                  <LogOut className="w-6 h-6 stroke-[2.2]" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="w-6 h-6 stroke-[2.2]" aria-hidden="true" />
                )}
              </div>

              <h3
                id="confirm-delete-title"
                title={title}
                className="text-lg sm:text-xl font-bold text-slate-900 font-heading leading-tight"
              >
                {title}
              </h3>

              <p id="confirm-delete-desc" className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-sans">
                {message}
              </p>

              {/* Nombre del ítem o cuenta resaltado si se especifica */}
              {itemName && (
                <div className="w-full mt-3.5 p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs font-semibold text-rose-800 break-words font-sans">
                  {itemName}
                </div>
              )}
            </div>

            {/* Acciones Requeridas */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onClose}
                disabled={isLoading}
                title={cancelText}
                className="w-full sm:w-auto text-slate-700 border-slate-200 hover:bg-slate-100 font-semibold text-xs sm:text-sm"
              >
                {cancelText}
              </Button>

              <button
                ref={confirmButtonRef}
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                title={confirmText}
                className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-transform duration-75 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-sans"
              >
                {isLogout ? <LogOut className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                <span>{isLoading ? 'Procesando...' : confirmText}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
