import { useState } from 'react';
import { receptionService } from '../services/receptionService';

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

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    if (!formData.profesionalCuil) {
      setError('Debes seleccionar un profesional médico.');
      return false;
    }
    if (!formData.cuitConsultorio) {
      setError('Debes seleccionar un consultorio de atención.');
      return false;
    }
    if (!formData.fecha) {
      setError('Debes seleccionar una fecha.');
      return false;
    }

    const [anio, mes, dia] = formData.fecha.split('-').map(Number);

    setIsSubmitting(true);
    try {
      const res = await receptionService.createAgenda({
        profesionalCuil: formData.profesionalCuil,
        cuitConsultorio: formData.cuitConsultorio,
        dia,
        mes,
        anio,
        horaEntrada: formData.horaEntrada,
        horaSalida: formData.horaSalida,
        duracionTurnoMinutos: Number(formData.duracionTurnoMinutos),
      });

      if (onSuccess) {
        onSuccess(res);
      }
      return true;
    } catch (err) {
      setError(err.message || 'Error al crear la agenda horaria.');
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
    submitAgenda,
  };
};
