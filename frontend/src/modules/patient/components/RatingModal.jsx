import React from 'react';
import { Star, MessageSquare, HeartHandshake, Clock, Award, Loader2, Check, AlertCircle } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { useSatisfactionSurvey } from '../hooks/useSatisfactionSurvey';

export const RatingModal = ({
  isOpen,
  onClose,
  appointment,
  onSurveySuccess,
}) => {
  const {
    ratings,
    setRating,
    comentario,
    setComentario,
    isSubmitting,
    error,
    submitSurvey,
  } = useSatisfactionSurvey(appointment, (res) => {
    onSurveySuccess(res);
    onClose();
  });

  if (!appointment) return null;

  const doctorName = appointment.profesionalNombre || 'Profesional tratante';

  const StarSelector = ({ category, label, icon: Icon, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" aria-hidden="true" />
        </div>
        <span className="text-xs sm:text-sm font-semibold text-slate-800">{label}</span>
      </div>

      {/* Selector de 5 estrellas accesible */}
      <div
        role="radiogroup"
        aria-label={`Calificación para ${label}`}
        className="flex items-center gap-1.5"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= value;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} estrella${star > 1 ? 's' : ''} de 5`}
              onClick={() => setRating(category, star)}
              tabIndex={0}
              className="p-1 rounded-lg hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  isFilled
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-slate-300 hover:text-amber-300'
                }`}
                aria-hidden="true"
              />
            </button>
          );
        })}
        <span className="text-xs font-bold text-slate-700 ml-1 w-4">{value}</span>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Calificar Atención Médica"
      description={`Tu opinión nos ayuda a mejorar. Califica tu cita con ${doctorName}.`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Categorías de calificación */}
        <StarSelector
          category="puntualidad"
          label="Puntualidad"
          icon={Clock}
          value={ratings.puntualidad}
        />

        <StarSelector
          category="atencion"
          label="Atención y Trato"
          icon={HeartHandshake}
          value={ratings.atencion}
        />

        <StarSelector
          category="profesionalismo"
          label="Profesionalismo Médico"
          icon={Award}
          value={ratings.profesionalismo}
        />

        {/* Comentario Adicional */}
        <div>
          <label
            htmlFor="survey-comment"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Comentario u observaciones (Opcional)
          </label>
          <textarea
            id="survey-comment"
            rows={3}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Comparte tu experiencia durante la consulta o estudio..."
            className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none"
          />
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Botones de acción */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
            tabIndex={0}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={submitSurvey}
            disabled={isSubmitting}
            tabIndex={0}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>Enviar Calificación</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
