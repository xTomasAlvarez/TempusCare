import { useState, useEffect, useCallback, useMemo } from 'react';
import { vitalityService } from '../services/vitalityService';
import { useToast } from '../../../shared/components/ui/Toast';

/**
 * Hook para la gestión del flujo de consenso en la creación de Super Administradores.
 * Permite listar solicitudes pendientes, proponer nuevos administradores y aprobar con validación de terceros.
 */
export const useVitalityAdmins = () => {
  const { addToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [reqData, adminData] = await Promise.all([
        vitalityService.getAdminRequests().catch(() => []),
        vitalityService.getSuperAdmins().catch(() => []),
      ]);

      setRequests(reqData || []);
      setAdmins(adminData || []);
    } catch (err) {
      console.error('Error al cargar datos de Super Administradores:', err);
      setError('No se pudieron obtener las solicitudes de administradores.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Solicitudes divididas por estado
  const pendingRequests = useMemo(() => {
    return requests.filter((r) => (r.estado || r.Estado) === 'Pendiente');
  }, [requests]);

  const resolvedRequests = useMemo(() => {
    return requests.filter((r) => (r.estado || r.Estado) !== 'Pendiente');
  }, [requests]);

  // 1. Proponer nuevo Super Admin (queda en estado Pendiente)
  const handleProposeAdmin = async (email) => {
    setIsSubmitting(true);
    try {
      const res = await vitalityService.proposeAdmin(email);
      addToast({
        title: 'Propuesta Registrada',
        description: `Se registró la propuesta para "${email}". Requiere la aprobación de un tercer Super Admin para activarse.`,
        variant: 'info',
      });
      setIsProposeModalOpen(false);
      await fetchData();
      return true;
    } catch (err) {
      addToast({
        title: 'Error al Proponer Admin',
        description: err.message || 'No se pudo enviar la propuesta de nuevo administrador.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Aprobar creación (estricta validación de que aprobador !== proponente)
  const handleApproveAdmin = async (id, emailPropuesto) => {
    setIsSubmitting(true);
    try {
      await vitalityService.approveAdmin(id);
      addToast({
        title: '¡Creación Aprobada!',
        description: `La cuenta de Super Administrador para "${emailPropuesto}" ha sido dada de alta exitosamente por consenso.`,
        variant: 'success',
      });
      await fetchData();
      return true;
    } catch (err) {
      addToast({
        title: 'Consenso Rechazado',
        description: err.message || 'No se pudo aprobar la solicitud.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Rechazar propuesta
  const handleRejectAdmin = async (id, emailPropuesto) => {
    setIsSubmitting(true);
    try {
      await vitalityService.rejectAdmin(id);
      addToast({
        title: 'Propuesta Rechazada',
        description: `La propuesta para "${emailPropuesto}" ha sido rechazada.`,
        variant: 'warning',
      });
      await fetchData();
      return true;
    } catch (err) {
      addToast({
        title: 'Error al Rechazar',
        description: err.message || 'No se pudo rechazar la solicitud.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    requests,
    pendingRequests,
    resolvedRequests,
    admins,
    isLoading,
    isSubmitting,
    isProposeModalOpen,
    setIsProposeModalOpen,
    error,
    proposeAdmin: handleProposeAdmin,
    approveAdmin: handleApproveAdmin,
    rejectAdmin: handleRejectAdmin,
    refreshAdmins: fetchData,
  };
};
