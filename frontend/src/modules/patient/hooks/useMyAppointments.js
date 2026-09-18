import { useState, useEffect, useCallback } from 'react';
import { patientService } from '../services/patientService';
import { useAuth } from '../../../core/context/AuthContext';

export const useMyAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('future'); // 'future' | 'history'

  const [cancellingId, setCancellingId] = useState(null);
  const [cancelError, setCancelError] = useState(null);

  // Modal de calificación
  const [selectedAppointmentForRating, setSelectedAppointmentForRating] = useState(null);

  const fetchAppointments = useCallback(async () => {
    if (!user?.cuil) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await patientService.getPatientAppointments(user.cuil);
      // Ordenar por fecha y hora descendente
      const sorted = [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setAppointments(sorted);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar tus citas.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.cuil]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Cancelar cita (RN-01: libera el turno en backend)
  const cancelAppointment = async (citaId) => {
    setCancellingId(citaId);
    setCancelError(null);

    try {
      await patientService.cancelAppointment(citaId);
      // Actualizar estado local optimistamente o recargar
      await fetchAppointments();
      return true;
    } catch (err) {
      setCancelError(err.message || 'No se pudo cancelar la cita.');
      return false;
    } finally {
      setCancellingId(null);
    }
  };

  // Filtrar citas futuras vs históricas
  // EstadoCita: 1=Solicitada, 2=Confirmada, 3=Atendida, 4=Ausente, 5=Cancelada
  const futureAppointments = appointments.filter(
    (c) => (c.estado === 1 || c.estado === 2 || c.estado === 'Solicitada' || c.estado === 'Confirmada')
  );

  const pastAppointments = appointments.filter(
    (c) => (c.estado === 3 || c.estado === 4 || c.estado === 5 || c.estado === 'Atendida' || c.estado === 'Ausente' || c.estado === 'Cancelada')
  );

  return {
    appointments,
    futureAppointments,
    pastAppointments,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    cancellingId,
    cancelError,
    cancelAppointment,
    refreshAppointments: fetchAppointments,
    selectedAppointmentForRating,
    setSelectedAppointmentForRating,
  };
};
