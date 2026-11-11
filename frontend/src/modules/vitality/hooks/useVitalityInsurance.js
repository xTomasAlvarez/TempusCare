import { useState, useEffect, useCallback, useMemo } from 'react';
import { vitalityService } from '../services/vitalityService';
import { useToast } from '../../../shared/components/ui/Toast';
import { useConfirmDelete } from '../../../shared/hooks/useConfirmDelete';

/**
 * Hook para la administración global de Obras Sociales y Prepagas (Super Admin).
 */
export const useVitalityInsurance = () => {
  const { addToast } = useToast();
  const { confirmDelete } = useConfirmDelete();
  const [insuranceList, setInsuranceList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(null);
  const [error, setError] = useState(null);

  const fetchInsurance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await vitalityService.getObrasSociales();
      setInsuranceList(data || []);
    } catch (err) {
      setError(err.message || 'Error al obtener el catálogo de obras sociales.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsurance();
  }, [fetchInsurance]);

  const openCreateModal = () => {
    setEditingInsurance(null);
    setIsModalOpen(true);
  };

  const openEditModal = (insurance) => {
    setEditingInsurance(insurance);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingInsurance(null);
  };

  const handleSaveInsurance = async ({ id, nombre, catalogo }) => {
    try {
      setIsSubmitting(true);
      if (id) {
        await vitalityService.updateObraSocial({ id, nombre, catalogo });
        addToast({
          title: 'Obra Social Actualizada',
          description: `Se modificó "${nombre}" exitosamente.`,
          variant: 'success',
        });
      } else {
        await vitalityService.createObraSocial({ nombre, catalogo });
        addToast({
          title: 'Obra Social Registrada',
          description: `Se dio de alta "${nombre}" en el catálogo global.`,
          variant: 'success',
        });
      }
      closeModal();
      await fetchInsurance();
      return true;
    } catch (err) {
      addToast({
        title: 'Error al Guardar',
        description: err.message || 'No se pudo guardar la obra social.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInsurance = async (id, nombre) => {
    const ok = await confirmDelete({
      title: '¿Eliminar obra social definitivamente?',
      message: `¿Estás seguro de que deseas eliminar la obra social "${nombre}" del catálogo global? No estará disponible para nuevas asignaciones.`,
      itemName: nombre,
      confirmText: 'Sí, eliminar definitivamente',
      cancelText: 'Cancelar',
    });
    if (!ok) return false;

    try {
      await vitalityService.deleteObraSocial(id);
      addToast({
        title: 'Obra Social Eliminada',
        description: `Se eliminó "${nombre}" del catálogo.`,
        variant: 'info',
      });
      await fetchInsurance();
      return true;
    } catch (err) {
      addToast({
        title: 'Error al Eliminar',
        description: err.message || 'No se pudo eliminar la obra social.',
        variant: 'error',
      });
      return false;
    }
  };

  const stats = useMemo(() => {
    const total = insuranceList.length;
    return {
      totalInsurance: total,
    };
  }, [insuranceList]);

  return {
    insuranceList,
    stats,
    isLoading,
    isSubmitting,
    isModalOpen,
    editingInsurance,
    openCreateModal,
    openEditModal,
    closeModal,
    saveInsurance: handleSaveInsurance,
    deleteInsurance: handleDeleteInsurance,
    refreshInsurance: fetchInsurance,
    error,
  };
};
