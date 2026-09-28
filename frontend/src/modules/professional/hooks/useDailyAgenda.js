import { useState, useEffect, useCallback, useMemo } from 'react';
import { professionalService } from '../services/professionalService';
import { useAuth } from '../../../core/context/AuthContext';

/**
 * Hook para gestionar la agenda médica diaria del profesional.
 * Carga citas del día, permite seleccionar un paciente para consulta y buscar por nombre/CUIL.
 */
export const useDailyAgenda = (initialDate = new Date()) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(
    initialDate instanceof Date ? initialDate.toISOString().split('T')[0] : initialDate
  );
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // El CUIL del profesional autenticado
  const profesionalCuil = user?.cuil || '20123456789';

  const fetchDailyAppointments = useCallback(async () => {
    if (!profesionalCuil) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await professionalService.getDailyAppointments(profesionalCuil, selectedDate);
      setAppointments(data);

      // Si el turno seleccionado se actualizó en la lista, sincronizarlo
      if (selectedAppointment) {
        const updated = data.find((a) => a.id === selectedAppointment.id);
        if (updated) {
          setSelectedAppointment(updated);
        }
      }
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los turnos del día.');
    } finally {
      setIsLoading(false);
    }
  }, [profesionalCuil, selectedDate, selectedAppointment?.id]);

  useEffect(() => {
    fetchDailyAppointments();
  }, [fetchDailyAppointments]);

  // Helper para verificar si una cita está atendida
  const isAttendedStatus = (estado) =>
    estado === 3 || estado === 'Atendida' || estado === 'Atendido';

  // Helper para verificar si una cita está pendiente de atención
  const isPendingStatus = (estado) =>
    estado === 1 ||
    estado === 2 ||
    estado === 6 ||
    estado === 7 ||
    estado === 'Solicitada' ||
    estado === 'Confirmada' ||
    estado === 'EnSalaDeEspera' ||
    estado === 'EnAtencion' ||
    estado === 'Pendiente';

  // Helper para verificar si una cita fue cancelada
  const isCancelledStatus = (estado) =>
    estado === 5 || estado === 'Cancelada';

  // Filtrado de citas según búsqueda y estado (cuando statusFilter === 'ALL', incluye TODAS las citas: Pendientes, Confirmadas y Atendidas)
  const filteredAppointments = useMemo(() => {
    return appointments.filter((cita) => {
      const matchesSearch =
        !searchQuery ||
        cita.pacienteNombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cita.pacienteCuil?.includes(searchQuery);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PENDING' && isPendingStatus(cita.estado)) ||
        (statusFilter === 'ATTENDED' && isAttendedStatus(cita.estado)) ||
        (statusFilter === 'CANCELLED' && isCancelledStatus(cita.estado));

      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchQuery, statusFilter]);

  // Métricas rápidas
  const stats = useMemo(() => {
    const total = appointments.length;
    const attended = appointments.filter((c) => isAttendedStatus(c.estado)).length;
    const pending = appointments.filter((c) => isPendingStatus(c.estado)).length;
    return { total, attended, pending };
  }, [appointments]);

  const selectPatientAppointment = useCallback((appointment) => {
    setSelectedAppointment(appointment);
  }, []);

  const clearSelectedAppointment = useCallback(() => {
    setSelectedAppointment(null);
  }, []);

  return {
    selectedDate,
    setSelectedDate,
    appointments: filteredAppointments,
    allAppointments: appointments,
    selectedAppointment,
    selectPatientAppointment,
    clearSelectedAppointment,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    stats,
    isLoading,
    error,
    refreshAgenda: fetchDailyAppointments,
  };
};
