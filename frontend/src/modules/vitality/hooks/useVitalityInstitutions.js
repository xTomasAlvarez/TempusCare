import { useState, useEffect, useCallback, useMemo } from 'react';
import { vitalityService } from '../services/vitalityService';
import { useToast } from '../../../shared/components/ui/Toast';

/**
 * Hook para la gestión integral de Clientes B2B (Instituciones) por parte del Super Administrador.
 */
export const useVitalityInstitutions = () => {
  const { addToast } = useToast();
  const [institutions, setInstitutions] = useState([]);
  const [planMap, setPlanMap] = useState(() => {
    // Planes por defecto para clientes iniciales
    return {
      '30111222334': 'Enterprise',
      '30555666778': 'Profesional',
    };
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

      // Asociar el plan seleccionado al CUIT como fallback
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

  const handleDeleteInstitution = async (id, nombre) => {
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
    error,
    createInstitution: handleCreateInstitution,
    deleteInstitution: handleDeleteInstitution,
    refreshInstitutions: fetchInstitutions,
  };
};
