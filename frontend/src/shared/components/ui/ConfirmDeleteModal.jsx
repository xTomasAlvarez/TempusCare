import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from './Button';

/**
 * Modal de Advertencia Global para Acciones Destructivas.
 * Cumple estrictamente con las clases requeridas: bg-white rounded-xl shadow-lg p-6
 * y los botones requeridos: "Sí, eliminar definitivamente" (rojo) y "Cancelar".
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
  isLoading = false,
}) => {
  const confirmButtonRef = useRef(null);

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

  // Manejar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
    >
      {/* Contenedor del Modal con especificación estricta: bg-white rounded-xl shadow-lg p-6 */}
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full border border-slate-100 relative animate-scaleUp">
        {/* Botón cerrar opcional */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Cerrar modal de advertencia"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icono de Advertencia Destructiva */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 ring-8 ring-rose-50">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" aria-hidden="true" />
          </div>

          <h3
            id="confirm-delete-title"
            className="text-lg font-bold text-slate-900 font-heading leading-tight"
          >
            {title}
          </h3>

          <p id="confirm-delete-desc" className="text-xs sm:text-sm text-slate-600 mt-2">
            {message}
          </p>

          {/* Nombre del ítem resaltado si se especifica */}
          {itemName && (
            <div className="w-full mt-3 p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/80 text-xs font-semibold text-rose-800 break-words font-mono">
              {itemName}
            </div>
          )}
        </div>

        {/* Acciones Requeridas: "Sí, eliminar definitivamente" (Rojo) y "Cancelar" */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto text-slate-700 border-slate-200 hover:bg-slate-100 font-medium text-xs sm:text-sm"
          >
            {cancelText}
          </Button>

          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isLoading ? 'Eliminando...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
