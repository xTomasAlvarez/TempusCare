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

  // Estado local para turnos en curso (atendiéndose) y sala de espera
  const [inConsultationIds, setInConsultationIds] = useState(new Set());
  const [arrivedPatientIds, setArrivedPatientIds] = useState(new Set());

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
  // 1. Marcar como "Llegó a Sala de Espera"
  const markAsArrived = (citaId) => {
    setArrivedPatientIds((prev) => new Set([...prev, citaId]));
  };

  // 2. Pasar a Consulta (Atendiéndose)
  const startAttention = (citaId) => {
    setInConsultationIds((prev) => new Set([...prev, citaId]));
    setArrivedPatientIds((prev) => {
      const next = new Set(prev);
      next.delete(citaId);
      return next;
    });
  };

  // 3. Finalizar Atención Médica (pasa a Atendida en Backend)
  const finishAttention = async (citaId) => {
    setIsActionLoading(true);
    try {
      // 3 = EstadoCita.Atendida
      await receptionService.updateAppointmentStatus(citaId, 3);
      setInConsultationIds((prev) => {
        const next = new Set(prev);
        next.delete(citaId);
        return next;
      });
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
      setInConsultationIds((prev) => {
        const next = new Set(prev);
        next.delete(citaId);
        return next;
      });
      setArrivedPatientIds((prev) => {
        const next = new Set(prev);
        next.delete(citaId);
        return next;
      });
      await fetchDashboardData();
      return true;
    } catch (err) {
      setError(err.message || 'No se pudo cancelar la cita.');
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Clasificación de las 4 Columnas del Kanban:
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

  // 2. En Sala de Espera: Citas confirmadas/solicitadas que NO están siendo atendidas y NO están finalizadas
  const columnEspera = citas
    .filter(
      (c) =>
        (c.estado === 1 || c.estado === 2 || c.estado === 'Solicitada' || c.estado === 'Confirmada') &&
        !inConsultationIds.has(c.id)
    )
    .map((c) => ({
      ...c,
      hasArrived: arrivedPatientIds.has(c.id),
    }));

  // 3. Atendiéndose: Citas en curso
  const columnAtendiendose = citas.filter((c) => inConsultationIds.has(c.id));

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
