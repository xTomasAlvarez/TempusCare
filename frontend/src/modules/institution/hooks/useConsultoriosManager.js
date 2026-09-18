import { useState, useEffect, useCallback } from 'react';
import { institutionAdminService } from '../services/institutionAdminService';
import { useToast } from '../../../shared/components/ui/Toast';

/**
 * Hook para la gestión de Sedes Físicas y Consultorios Médicos.
 */
export const useConsultoriosManager = () => {
  const { addToast } = useToast();
  const [consultorios, setConsultorios] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchConsultorios = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [data, insts] = await Promise.all([
        institutionAdminService.getConsultorios(),
        institutionAdminService.getInstituciones().catch(() => []),
      ]);
      setConsultorios(data);
      setInstituciones(insts);
    } catch (err) {
      console.error('Error al cargar consultorios:', err);
      setError(err.message || 'Error al cargar sedes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConsultorios();
  }, [fetchConsultorios]);

  const handleCreateConsultorio = async (dto) => {
    try {
      setIsSubmitting(true);
      await institutionAdminService.createConsultorio(dto);

      addToast({
        title: 'Sede Registrada',
        description: `El consultorio "${dto.nombre}" ha sido registrado correctamente.`,
        variant: 'success',
      });

      setIsModalOpen(false);
      await fetchConsultorios();
      return true;
    } catch (err) {
      console.error('Error al crear consultorio:', err);
      addToast({
        title: 'Error al Registrar Sede',
        description: err.message || 'No se pudo crear el consultorio.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConsultorio = async (cuit, nombre) => {
    try {
      await institutionAdminService.deleteConsultorio(cuit);
      addToast({
        title: 'Sede Eliminada',
        description: `El consultorio "${nombre}" ha sido eliminado.`,
        variant: 'info',
      });
      await fetchConsultorios();
      return true;
    } catch (err) {
      console.error('Error al eliminar consultorio:', err);
      addToast({
        title: 'Error al Eliminar',
        description: err.message || 'No se pudo eliminar el consultorio.',
        variant: 'error',
      });
      return false;
    }
  };

  return {
    consultorios,
    instituciones,
    isLoading,
    isSubmitting,
    isModalOpen,
    setIsModalOpen,
    error,
    createConsultorio: handleCreateConsultorio,
    deleteConsultorio: handleDeleteConsultorio,
    refreshConsultorios: fetchConsultorios,
  };
};
