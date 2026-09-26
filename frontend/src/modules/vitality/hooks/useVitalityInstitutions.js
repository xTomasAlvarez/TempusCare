import { useState, useEffect, useCallback, useMemo } from 'react';
import { vitalityService } from '../services/vitalityService';
import { useToast } from '../../../shared/components/ui/Toast';
import { useConfirmDelete } from '../../../shared/hooks/useConfirmDelete';

/**
 * Hook para la gestión integral de Clientes B2B (Instituciones) por parte del Super Administrador.
 * Soporta Alta, Modificación (Email, Plan, Nombre), Baja y Listado.
 */
export const useVitalityInstitutions = () => {
  const { addToast } = useToast();
  const { confirmDelete } = useConfirmDelete();
  const [institutions, setInstitutions] = useState([]);
  const [planMap, setPlanMap] = useState(() => {
    return {
      '30111222334': 'Enterprise',
      '30555666778': 'Profesional',
    };
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState(null);
  const [error, setError] = useState(null);

  const fetchInstitutions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await vitalityService.getInstitutions();
      setInstitutions(data);
    } catch (err) {
      setError(err.message || 'Error al obtener la lista de clientes B2B.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  const handleCreateInstitution = async ({ nombre, cuit, email, plan }) => {
    try {
      setIsSubmitting(true);
      const res = await vitalityService.createInstitution({ nombre, cuit, email, plan });

      if (plan) {
        setPlanMap((prev) => ({ ...prev, [cuit]: plan }));
      }

      addToast({
        title: 'Institución Contratada',
        description: `Se dio de alta "${nombre}" exitosamente con Plan ${plan || 'Profesional'}.`,
        variant: 'success',
      });

      setIsModalOpen(false);
      await fetchInstitutions();
      return true;
    } catch (err) {
      addToast({
        title: 'Error en el Alta',
        description: err.message || 'No se pudo dar de alta la institución médica.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateInstitution = async ({ id, nombre, cuit, email, plan }) => {
    try {
      setIsSubmitting(true);
      await vitalityService.updateInstitution({ id, nombre, cuit, email, plan });

      if (plan && cuit) {
        setPlanMap((prev) => ({ ...prev, [cuit]: plan }));
      }

      addToast({
        title: 'Institución Actualizada',
        description: `Los datos y el plan de "${nombre}" se actualizaron con éxito.`,
        variant: 'success',
      });

      setIsEditModalOpen(false);
      setEditingInstitution(null);
      await fetchInstitutions();
      return true;
    } catch (err) {
      addToast({
        title: 'Error al Actualizar',
        description: err.message || 'No se pudieron guardar los cambios de la institución.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInstitution = async (id, nombre) => {
    const ok = await confirmDelete({
      title: '¿Eliminar institución definitivamente?',
      message: `¿Estás seguro de que deseas eliminar la institución "${nombre}"? Se desvinculará del sistema Tempus Care junto con todos sus consultorios y profesionales asociados.`,
      itemName: nombre,
      confirmText: 'Sí, eliminar definitivamente',
      cancelText: 'Cancelar',
    });
    if (!ok) return false;

    try {
      await vitalityService.deleteInstitution(id);
      addToast({
        title: 'Cliente Desvinculado',
        description: `La institución "${nombre}" ha sido dada de baja del ecosistema Tempus Care.`,
        variant: 'info',
      });
      await fetchInstitutions();
      return true;
    } catch (err) {
      addToast({
        title: 'Error al Desvincular',
        description: err.message || 'No se pudo eliminar la institución.',
        variant: 'error',
      });
      return false;
    }
  };

  const openEditModal = (institution) => {
    setEditingInstitution(institution);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingInstitution(null);
  };

  // Enriquecer datos con planes de suscripción
  const enrichedInstitutions = useMemo(() => {
    return institutions.map((inst) => {
      const assignedPlan = inst.plan || planMap[inst.cuit] || (inst.id % 2 === 0 ? 'Profesional' : 'Enterprise');
      return {
        ...inst,
        plan: assignedPlan,
      };
    });
  }, [institutions, planMap]);

  // Métricas globales del SaaS
  const stats = useMemo(() => {
    const totalClients = institutions.length;
    const totalConsultorios = institutions.reduce(
      (acc, curr) => acc + (curr.consultoriosNombres?.length || 0),
      0
    );
    const totalAsistentes = institutions.reduce(
      (acc, curr) => acc + (curr.asistentesNombres?.length || 0),
      0
    );
    return {
      totalClients,
      totalConsultorios,
      totalAsistentes,
    };
  }, [institutions]);

  return {
    institutions: enrichedInstitutions,
    stats,
    isLoading,
    isSubmitting,
    isModalOpen,
    setIsModalOpen,
    isEditModalOpen,
    editingInstitution,
    openEditModal,
    closeEditModal,
    error,
    createInstitution: handleCreateInstitution,
    updateInstitution: handleUpdateInstitution,
    deleteInstitution: handleDeleteInstitution,
    refreshInstitutions: fetchInstitutions,
  };
};
