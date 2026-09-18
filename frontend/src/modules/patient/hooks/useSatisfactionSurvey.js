import { useState } from 'react';
import { patientService } from '../services/patientService';

export const useSatisfactionSurvey = (appointment, onSuccess) => {
  const [ratings, setRatings] = useState({
    puntualidad: 5,
    atencion: 5,
    profesionalismo: 5,
  });
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const setRating = (category, value) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const submitSurvey = async () => {
    if (!appointment?.id) return false;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await patientService.submitSatisfactionSurvey({
        citaId: appointment.id,
        puntualidad: Number(ratings.puntualidad),
        atencion: Number(ratings.atencion),
        profesionalismo: Number(ratings.profesionalismo),
        comentario: comentario.trim() || undefined,
      });

      if (onSuccess) {
        onSuccess(result);
      }
      return true;
    } catch (err) {
      setError(err.message || 'Error al enviar la calificación.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    ratings,
    setRating,
    comentario,
    setComentario,
    isSubmitting,
    error,
    submitSurvey,
  };
};
