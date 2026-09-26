import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal';

const ConfirmDeleteContext = createContext(null);

/**
 * Proveedor Global de Confirmación para Acciones Destructivas.
 * Permite que cualquier componente invoque un modal modal de advertencia antes de borrar.
 */
export const ConfirmDeleteProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '¿Confirmar eliminación?',
    message: 'Esta acción no se puede deshacer. Se eliminarán los datos definitivamente de la plataforma.',
    itemName: null,
    confirmText: 'Sí, eliminar definitivamente',
    cancelText: 'Cancelar',
    isLoading: false,
  });

  const resolverRef = useRef(null);

  /**
   * Abre el modal de confirmación y retorna una Promesa que resuelve a `true` si el usuario
   * confirma en el botón rojo "Sí, eliminar definitivamente", o `false` si cancela.
   */
  const confirmDelete = useCallback(
    ({
      title = '¿Confirmar eliminación?',
      message = 'Esta acción no se puede deshacer. Se eliminarán los datos definitivamente de la plataforma.',
      itemName = null,
      confirmText = 'Sí, eliminar definitivamente',
      cancelText = 'Cancelar',
    } = {}) => {
      return new Promise((resolve) => {
        resolverRef.current = resolve;
        setModalState({
          isOpen: true,
          title,
          message,
          itemName,
          confirmText,
          cancelText,
          isLoading: false,
        });
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleClose = useCallback(() => {
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <ConfirmDeleteContext.Provider value={{ confirmDelete }}>
      {children}
      <ConfirmDeleteModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        itemName={modalState.itemName}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        isLoading={modalState.isLoading}
        onConfirm={handleConfirm}
        onClose={handleClose}
      />
    </ConfirmDeleteContext.Provider>
  );
};

/**
 * Custom Hook para invocar el sistema estricto de confirmación de eliminaciones.
 * Ej:
 * const { confirmDelete } = useConfirmDelete();
 * const ok = await confirmDelete({ title: '...', itemName: '...' });
 * if (!ok) return;
 */
export const useConfirmDelete = () => {
  const context = useContext(ConfirmDeleteContext);
  if (!context) {
    throw new Error('useConfirmDelete debe usarse dentro de un ConfirmDeleteProvider');
  }
  return context;
};
