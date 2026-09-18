import { useState, useEffect, useCallback } from 'react';
import { receptionService } from '../services/receptionService';

export const useReceptionDashboard = () => {
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const [doctors, setDoctors] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [selectedDoctorCuil, setSelectedDoctorCuil] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayStr());

  const [availableTurnos, setAvailableTurnos] = useState([]);
  const [citas, setCitas] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carga inicial de doctores y consultorios
  useEffect(() => {
    let isMounted = true;
    async function initCatalogs() {
      try {
        const [docs, cons] = await Promise.all([
          receptionService.getProfessionals().catch(() => []),
          receptionService.getConsultorios().catch(() => []),
        ]);

        if (isMounted) {
          setDoctors(docs);
          setConsultorios(cons);
          if (docs.length > 0 && !selectedDoctorCuil) {
            setSelectedDoctorCuil(docs[0].cuil);
          }
        }
      } catch (err) {
        if (isMounted) setError('Error al cargar datos institucionales.');
      }
    }

    initCatalogs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Carga de turnos y citas para el doctor y fecha seleccionados
  const fetchDashboardData = useCallback(async () => {
    if (!selectedDoctorCuil) return;

    setIsLoading(true);
    setError(null);

    try {
      const [turnosData, citasData] = await Promise.all([
        receptionService.getAvailableTurnos(selectedDoctorCuil, selectedDate).catch(() => []),
        receptionService.getAppointmentsByDoctorAndDate(selectedDoctorCuil, selectedDate).catch(() => []),
      ]);

      // Filtrar turnos disponibles para que no incluyan los que ya tienen cita agendada
      const bookedTurnoIds = new Set(citasData.map((c) => c.turnoId));
      const filteredDisponibles = turnosData.filter((t) => !bookedTurnoIds.has(t.id));

      setAvailableTurnos(filteredDisponibles);
      setCitas(citasData);
    } catch (err) {
      setError(err.message || 'Error al obtener la información de turnos.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDoctorCuil, selectedDate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Acciones Rápidas del Asistente
  // 1. Marcar como "Llegó a Sala de Espera" (persiste EstadoCita.EnSalaDeEspera = 6)
  const markAsArrived = async (citaId) => {
    setIsActionLoading(true);
    try {
      await receptionService.updateAppointmentStatus(citaId, 6);
      await fetchDashboardData();
      return true;
    } catch (err) {
      setError(err.message || 'No se pudo registrar la llegada a sala de espera.');
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // 2. Pasar a Consulta (persiste EstadoCita.EnAtencion = 7)
  const startAttention = async (citaId) => {
    setIsActionLoading(true);
    try {
      await receptionService.updateAppointmentStatus(citaId, 7);
      await fetchDashboardData();
      return true;
    } catch (err) {
      setError(err.message || 'No se pudo llamar al paciente a consulta.');
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // 3. Finalizar Atención Médica (persiste EstadoCita.Atendida = 3)
  const finishAttention = async (citaId) => {
    setIsActionLoading(true);
    try {
      await receptionService.updateAppointmentStatus(citaId, 3);
      await fetchDashboardData();
      return true;
    } catch (err) {
      setError(err.message || 'No se pudo finalizar la cita.');
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // 4. Cancelar Cita (cumpliendo RN-01 liberando el turno)
  const cancelCita = async (citaId) => {
    setIsActionLoading(true);
    try {
      await receptionService.cancelAppointment(citaId);
      await fetchDashboardData();
      return true;
    } catch (err) {
      setError(err.message || 'No se pudo cancelar la cita.');
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Clasificación de las 4 Columnas del Kanban con persistencia backend:
  // 1. Disponibles: turnos libres sin cita asociada
  const columnDisponibles = availableTurnos.map((t) => ({
    id: `turno-${t.id}`,
    turnoId: t.id,
    horaInicio: t.horaInicio,
    horaFin: t.horaFin,
    tipo: 'slot',
    estadoTurno: 'Disponible',
    consultorioNombre: t.consultorioNombre,
  }));

  // 2. En Sala de Espera / Citados: Citas agendadas o ya presentes en sala de espera
  const columnEspera = citas
    .filter(
      (c) =>
        c.estado === 1 ||
        c.estado === 2 ||
        c.estado === 6 ||
        c.estado === 'Solicitada' ||
        c.estado === 'Confirmada' ||
        c.estado === 'EnSalaDeEspera'
    )
    .map((c) => ({
      ...c,
      hasArrived: c.estado === 6 || c.estado === 'EnSalaDeEspera',
    }));

  // 3. Atendiéndose: Citas en curso en el consultorio
  const columnAtendiendose = citas.filter(
    (c) => c.estado === 7 || c.estado === 'EnAtencion'
  );

  // 4. Finalizados: Citas atendidas o completadas
  const columnFinalizados = citas.filter(
    (c) => c.estado === 3 || c.estado === 'Atendida' || c.estado === 4 || c.estado === 'Ausente'
  );

  return {
    doctors,
    consultorios,
    selectedDoctorCuil,
    setSelectedDoctorCuil,
    selectedDate,
    setSelectedDate,
    columnDisponibles,
    columnEspera,
    columnAtendiendose,
    columnFinalizados,
    isLoading,
    isActionLoading,
    error,
    markAsArrived,
    startAttention,
    finishAttention,
    cancelCita,
    refreshDashboard: fetchDashboardData,
  };
};
