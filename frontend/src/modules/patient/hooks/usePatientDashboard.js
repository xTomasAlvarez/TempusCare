import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { patientService } from '../services/patientService';

/**
 * Hook personalizado para el dashboard del paciente.
 * Obtiene la próxima cita programada del paciente y gestiona estados de carga y error.
 */
export const usePatientDashboard = () => {
  const { user } = useAuth();
  const [nextAppointment, setNextAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNextAppointment = useCallback(async () => {
    if (!user?.cuil) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const list = await patientService.getPatientAppointments(user.cuil);
      const future = list.filter(
        (c) =>
          c.estado === 1 ||
          c.estado === 2 ||
          c.estado === 6 ||
          c.estado === 'Solicitada' ||
          c.estado === 'Confirmada' ||
          c.estado === 'EnSalaDeEspera'
      );

      if (future.length > 0) {
        // Ordenar por fecha y hora más próxima
        future.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        setNextAppointment(future[0]);
      } else {
        setNextAppointment(null);
      }
    } catch (err) {
      setError(err.message || 'No se pudo cargar la próxima cita.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.cuil]);

  useEffect(() => {
    fetchNextAppointment();
  }, [fetchNextAppointment]);

  return {
    user,
    nextAppointment,
    isLoading,
    error,
    refreshDashboard: fetchNextAppointment,
  };
};
