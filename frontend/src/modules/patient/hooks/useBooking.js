import { useState, useEffect, useCallback } from 'react';
import { patientService } from '../services/patientService';
import { useAuth } from '../../../core/context/AuthContext';
import { parseBackendError } from '../../../shared/validation/validateForm';

export const useBooking = (doctor, onSuccess) => {
  const { user } = useAuth();

  // Fecha en formato local YYYY-MM-DD
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState(null);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [tipoCita, setTipoCita] = useState(1); // 1: Consulta, 3: Estudio
  const [selectedEstudioId, setSelectedEstudioId] = useState('');
  const [selectedObraSocialId, setSelectedObraSocialId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Carga de slots disponibles al cambiar médico o fecha
  const fetchSlots = useCallback(async () => {
    if (!doctor?.cuil) return;

    setIsLoadingSlots(true);
    setSlotError(null);
    setSelectedSlot(null);

    try {
      const slots = await patientService.getAvailableSlots(doctor.cuil, selectedDate);
      setAvailableSlots(slots);
    } catch (err) {
      setSlotError(err.message || 'No se pudieron cargar los horarios disponibles.');
    } finally {
      setIsLoadingSlots(false);
    }
  }, [doctor?.cuil, selectedDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Confirmar reserva
  const confirmBooking = async () => {
    if (!selectedSlot) {
      setSubmitError('Por favor selecciona un horario disponible.');
      return false;
    }

    if (!user?.cuil) {
      setSubmitError('Debes tener un perfil de paciente activo con CUIL para reservar.');
      return false;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await patientService.bookAppointment({
        pacienteCuil: user.cuil,
        profesionalCuil: doctor.cuil,
        turnoId: selectedSlot.id,
        tipo: Number(tipoCita),
        obraSocialId: selectedObraSocialId ? Number(selectedObraSocialId) : null,
        estudioId: tipoCita === 3 && selectedEstudioId ? Number(selectedEstudioId) : null,
      });

      if (onSuccess) {
        onSuccess(result);
      }
      return true;
    } catch (err) {
      const parsed = parseBackendError(err, 'No se pudo completar la reserva.');
      let friendlyMsg = parsed.message;
      if (
        parsed.isDuplicate ||
        err.status === 409 ||
        String(err.message || '').toLowerCase().includes('ocupado') ||
        String(err.message || '').toLowerCase().includes('reservado') ||
        String(err.message || '').toLowerCase().includes('concurren')
      ) {
        friendlyMsg = 'El horario seleccionado acaba de ser tomado por otro paciente. Se actualizaron los turnos disponibles.';
        fetchSlots();
      }
      setSubmitError(friendlyMsg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    availableSlots,
    isLoadingSlots,
    slotError,
    selectedSlot,
    setSelectedSlot,
    tipoCita,
    setTipoCita,
    selectedEstudioId,
    setSelectedEstudioId,
    selectedObraSocialId,
    setSelectedObraSocialId,
    isSubmitting,
    submitError,
    confirmBooking,
    refreshSlots: fetchSlots,
  };
};
