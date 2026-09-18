import { useState, useEffect, useCallback } from 'react';
import { professionalService } from '../services/professionalService';
import { useAuth } from '../../../core/context/AuthContext';
import { useToast } from '../../../shared/components/ui/Toast';

/**
 * Hook para gestionar la Ficha Clínica Unificada y registro de evoluciones (RN-04).
 * Carga antecedentes, timeline histórico y persiste nuevas observaciones.
 */
export const useClinicalRecord = (appointment, onAppointmentUpdated) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [clinicalHistory, setClinicalHistory] = useState(null);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Formulario de evolución de la consulta actual
  const [motivo, setMotivo] = useState(appointment?.motivoObservacion || '');
  const [detalle, setDetalle] = useState(appointment?.detalleObservacion || '');
  const [markAsAttended, setMarkAsAttended] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const pacienteCuil = appointment?.pacienteCuil;

  const loadPatientData = useCallback(async () => {
    if (!pacienteCuil) return;

    try {
      setIsLoading(true);
      setError(null);

      const [history, pastCitas] = await Promise.all([
        professionalService.getPatientClinicalHistory(pacienteCuil),
        professionalService.getPatientAppointments(pacienteCuil),
      ]);

      setClinicalHistory(history);
      setPastAppointments(pastCitas || []);
    } catch (err) {
      setError(err.message || 'Error al cargar los antecedentes clínicos del paciente.');
    } finally {
      setIsLoading(false);
    }
  }, [pacienteCuil]);

  useEffect(() => {
    loadPatientData();
    setMotivo(appointment?.motivoObservacion || '');
    setDetalle(appointment?.detalleObservacion || '');
    setIsSaved(appointment?.estado === 3);
  }, [appointment, loadPatientData]);

  /**
   * Guarda la evolución en ObservacionesController (RN-04) y actualiza automáticamente
   * el estado de la cita a Atendida en la misma transacción atómica en backend.
   */
  const saveEvolution = async () => {
    if (!motivo.trim()) {
      addToast({
        title: 'Campo Requerido',
        description: 'Por favor ingrese el motivo o diagnóstico de la consulta.',
        variant: 'warning',
      });
      return false;
    }

    if (!detalle.trim()) {
      addToast({
        title: 'Campo Requerido',
        description: 'Por favor ingrese el detalle o plan terapéutico de la evolución clínica.',
        variant: 'warning',
      });
      return false;
    }

    try {
      setIsSaving(true);
      setError(null);

      const doctorCuil = appointment?.profesionalCuil || user?.cuil || '20123456789';

      // 1. Guardar Observación en la Historia Clínica Unificada (RN-04).
      // El backend actualiza automáticamente la Cita a Atendida y los turnos a Atendido bajo transacción ACID.
      await professionalService.saveClinicalObservation({
        citaId: appointment.id,
        historiaClinicaId: clinicalHistory?.id || null,
        profesionalCuil: doctorCuil,
        motivo: motivo.trim(),
        detalle: detalle.trim(),
      });

      setIsSaved(true);
      addToast({
        title: 'Evolución Registrada',
        description: 'La consulta médica ha sido guardada en la historia clínica unificada.',
        variant: 'success',
      });

      // Recargar la historia para reflejar la nueva observación en el timeline
      await loadPatientData();

      if (onAppointmentUpdated) {
        onAppointmentUpdated();
      }

      return true;
    } catch (err) {
      setError(err.message || 'Ocurrió un error al guardar la evolución.');
      addToast({
        title: 'Error al Guardar',
        description: err.message || 'No se pudo guardar la evolución clínica.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    clinicalHistory,
    pastAppointments,
    isLoading,
    isSaving,
    isSaved,
    error,
    motivo,
    setMotivo,
    detalle,
    setDetalle,
    markAsAttended,
    setMarkAsAttended,
    saveEvolution,
    refreshPatientData: loadPatientData,
  };
};
