import { useState, useEffect, useCallback } from 'react';
import { patientService } from '../services/patientService';
import { useAuth } from '../../../core/context/AuthContext';

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
      setSubmitError(err.message || 'No se pudo completar la reserva.');
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
