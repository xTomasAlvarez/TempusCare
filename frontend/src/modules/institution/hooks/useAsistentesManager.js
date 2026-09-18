import { useState, useEffect, useCallback } from 'react';
import { institutionAdminService } from '../services/institutionAdminService';
import { useToast } from '../../../shared/components/ui/Toast';

/**
 * Hook para la gestión de Personal Operativo (Asistentes y Secretarios).
 */
export const useAsistentesManager = () => {
  const { addToast } = useToast();
  const [asistentes, setAsistentes] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchAsistentes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [data, insts] = await Promise.all([
        institutionAdminService.getAsistentes(),
        institutionAdminService.getInstituciones().catch(() => []),
      ]);
      setAsistentes(data);
      setInstituciones(insts);
    } catch (err) {
      console.error('Error al cargar asistentes:', err);
      setError(err.message || 'Error al cargar personal operativo.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAsistentes();
  }, [fetchAsistentes]);

  const handleCreateAsistente = async (dto) => {
    try {
      setIsSubmitting(true);
      await institutionAdminService.createAsistente(dto);

      addToast({
        title: 'Asistente Registrado',
        description: `Se dio de alta a "${dto.nombre} ${dto.apellido}" con usuario CUIL ${dto.cuil}.`,
        variant: 'success',
      });

      setIsModalOpen(false);
      await fetchAsistentes();
      return true;
    } catch (err) {
      console.error('Error al crear asistente:', err);
      addToast({
        title: 'Error al Registrar Personal',
        description: err.message || 'No se pudo dar de alta al asistente.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAsistente = async (cuil, nombre) => {
    try {
      await institutionAdminService.deleteAsistente(cuil);
      addToast({
        title: 'Asistente Eliminado',
        description: `El asistente "${nombre}" ha sido dado de baja.`,
        variant: 'info',
      });
      await fetchAsistentes();
      return true;
    } catch (err) {
      console.error('Error al eliminar asistente:', err);
      addToast({
        title: 'Error al Dar de Baja',
        description: err.message || 'No se pudo eliminar al asistente.',
        variant: 'error',
      });
      return false;
    }
  };

  return {
    asistentes,
    instituciones,
    isLoading,
    isSubmitting,
    isModalOpen,
    setIsModalOpen,
    error,
    createAsistente: handleCreateAsistente,
    deleteAsistente: handleDeleteAsistente,
    refreshAsistentes: fetchAsistentes,
  };
};
