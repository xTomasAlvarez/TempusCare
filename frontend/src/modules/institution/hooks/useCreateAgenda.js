import { useState } from 'react';
import { receptionService } from '../services/receptionService';
import { agendaSchema } from '../../../shared/validation/schemas';
import { validateWithSchema, parseBackendError } from '../../../shared/validation/validateForm';

export const useCreateAgenda = (onSuccess) => {
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    profesionalCuil: '',
    cuitConsultorio: '',
    fecha: getTodayStr(),
    horaEntrada: '08:00',
    horaSalida: '12:00',
    duracionTurnoMinutos: 30, // 15, 30, 45, 60
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (error) setError(null);
  };

  // Cálculo dinámico de cantidad aproximada de turnos
  const calculateEstimatedSlots = () => {
    if (!formData.horaEntrada || !formData.horaSalida) return 0;
    const [hEntrada, mEntrada] = formData.horaEntrada.split(':').map(Number);
    const [hSalida, mSalida] = formData.horaSalida.split(':').map(Number);

    const minutosTotales = hSalida * 60 + mSalida - (hEntrada * 60 + mEntrada);
    if (minutosTotales <= 0) return 0;

    return Math.floor(minutosTotales / Number(formData.duracionTurnoMinutos));
  };

  const submitAgenda = async () => {
    setError(null);
    setFieldErrors({});

    const { isValid, errors: validationErrors, data: sanitizedData } = validateWithSchema(
      agendaSchema,
      formData
    );

    if (!isValid) {
      setFieldErrors(validationErrors);
      setError(Object.values(validationErrors)[0]);
      return false;
    }

    const [anio, mes, dia] = sanitizedData.fecha.split('-').map(Number);

    setIsSubmitting(true);
    try {
      const res = await receptionService.createAgenda({
        profesionalCuil: sanitizedData.profesionalCuil,
        cuitConsultorio: sanitizedData.cuitConsultorio,
        dia,
        mes,
        anio,
        horaEntrada: sanitizedData.horaEntrada,
        horaSalida: sanitizedData.horaSalida,
        duracionTurnoMinutos: Number(sanitizedData.duracionTurnoMinutos),
      });

      if (onSuccess) {
        onSuccess(res);
      }
      return true;
    } catch (err) {
      const parsed = parseBackendError(err, 'Error al crear la agenda horaria.');
      setError(parsed.message);
      if (parsed.isDuplicate) {
        setFieldErrors((prev) => ({
          ...prev,
          fecha: 'Ya existe una agenda superpuesta para este médico en esta fecha y horario.',
        }));
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    updateField,
    estimatedSlots: calculateEstimatedSlots(),
    isSubmitting,
    error,
    fieldErrors,
    submitAgenda,
  };
};
