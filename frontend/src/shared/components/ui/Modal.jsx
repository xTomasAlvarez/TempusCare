import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { modalBackdropVariants, modalDialogVariants } from '../../motion';

/**
 * Componente Modal Accesible Universal (WCAG 2.1 AA)
 * - role="dialog" & aria-modal="true"
 * - Cierre con tecla Escape
 * - Atributo aria-label en botón de cerrar
 * - Bloqueo de scroll en body
 * - Ciclo de vida High-Craft: Backdrop con blur y caja con spring amortiguado
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth = 'max-w-xl',
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';

      // Poner foco en el modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }

        // Trampa de foco accesible (Focus Trap) dentro del modal
        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (!focusableElements || focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex justify-center items-center p-3 sm:p-4 overflow-hidden bg-black/75 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            key="modal-dialog"
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-description' : undefined}
            tabIndex={-1}
            variants={modalDialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'relative w-full my-auto bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-5 sm:p-6 outline-none max-h-[calc(100vh-2rem)] flex flex-col',
              maxWidth,
              className
            )}
          >
            {/* Botón de cierre accesible */}
            <button
              type="button"
              onClick={onClose}
              title="Cerrar ventana modal (Esc)"
              aria-label="Cerrar ventana modal"
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 z-10 active:scale-[0.98] duration-75 cursor-pointer"
            >
              <X className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
            </button>

            {/* Encabezado */}
            {(title || description) && (
              <div className="mb-3.5 pr-8 flex-shrink-0">
                {title && (
                  <h2 id="modal-title" title={typeof title === 'string' ? title : 'Título de ventana modal'} className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-slate-900">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" title={typeof description === 'string' ? description : undefined} className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {description}
                  </p>
                )}
              </div>
            )}

            {/* Contenido */}
            <div className="text-slate-800 overflow-y-auto flex-1 min-h-0 pr-1 -mr-1">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
