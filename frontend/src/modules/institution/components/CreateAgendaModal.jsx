import React from 'react';
import { CalendarHeart, Clock, Hospital, Stethoscope, Sparkles, Loader2, Check, AlertCircle } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { useCreateAgenda } from '../hooks/useCreateAgenda';

export const CreateAgendaModal = ({
  isOpen,
  onClose,
  doctors = [],
  consultorios = [],
  onAgendaCreated,
}) => {
  const {
    formData,
    updateField,
    estimatedSlots,
    isSubmitting,
    error,
    fieldErrors,
    submitAgenda,
  } = useCreateAgenda((res) => {
    onAgendaCreated(res);
    onClose();
  });

  const durationOptions = [15, 30, 45, 60];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nueva Agenda de Turnos"
      description="Configura la franja horaria y la duración dinámica de los slots para el profesional."
      maxWidth="max-w-xl"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitAgenda();
        }}
        className="space-y-4"
      >
        {/* Selección de Profesional */}
        <div>
          <label htmlFor="agenda-doctor" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-primary-600" strokeWidth={2} />
            Profesional Médico
          </label>
          <select
            id="agenda-doctor"
            value={formData.profesionalCuil}
            onChange={(e) => updateField('profesionalCuil', e.target.value)}
            className={`w-full h-11 px-3.5 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              fieldErrors.profesionalCuil ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
            }`}
            required
          >
            <option value="">Selecciona un médico...</option>
            {doctors.map((doc) => (
              <option key={doc.cuil} value={doc.cuil}>
                Dr. {doc.nombre} {doc.apellido} ({doc.especialidades?.[0] || 'General'})
              </option>
            ))}
          </select>
          <div className="min-h-[20px] mt-0.5 flex items-center">
            {fieldErrors.profesionalCuil && (
              <p className="text-[11px] text-rose-600 font-medium">{fieldErrors.profesionalCuil}</p>
            )}
          </div>
        </div>

        {/* Selección de Consultorio */}
        <div>
          <label htmlFor="agenda-consultorio" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            <Hospital className="w-3.5 h-3.5 text-primary-600" strokeWidth={2} />
            Consultorio de Atención
          </label>
          <select
            id="agenda-consultorio"
            value={formData.cuitConsultorio}
            onChange={(e) => updateField('cuitConsultorio', e.target.value)}
            className={`w-full h-11 px-3.5 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              fieldErrors.cuitConsultorio ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
            }`}
            required
          >
            <option value="">Selecciona un consultorio...</option>
            {consultorios.map((cons) => (
              <option key={cons.cuit} value={cons.cuit}>
                {cons.nombre}
              </option>
            ))}
          </select>
          <div className="min-h-[20px] mt-0.5 flex items-center">
            {fieldErrors.cuitConsultorio && (
              <p className="text-[11px] text-rose-600 font-medium">{fieldErrors.cuitConsultorio}</p>
            )}
          </div>
        </div>

        {/* Fecha de la Agenda */}
        <div>
          <label htmlFor="agenda-date" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            <CalendarHeart className="w-3.5 h-3.5 text-primary-600" strokeWidth={2} />
            Fecha de Atención
          </label>
          <input
            id="agenda-date"
            type="date"
            value={formData.fecha}
            onChange={(e) => updateField('fecha', e.target.value)}
            className={`w-full h-11 px-3.5 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              fieldErrors.fecha ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
            }`}
            required
          />
          <div className="min-h-[20px] mt-0.5 flex items-center">
            {fieldErrors.fecha && (
              <p className="text-[11px] text-rose-600 font-medium">{fieldErrors.fecha}</p>
            )}
          </div>
        </div>

        {/* Franja Horaria (Entrada y Salida) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="agenda-entry" className="flex items-center gap-1 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              <Clock className="w-3.5 h-3.5 text-primary-600" strokeWidth={2} />
              Hora de Inicio
            </label>
            <input
              id="agenda-entry"
              type="time"
              value={formData.horaEntrada}
              onChange={(e) => updateField('horaEntrada', e.target.value)}
              className={`w-full h-11 px-3.5 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                fieldErrors.horaEntrada ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
              required
            />
            <div className="min-h-[20px] mt-0.5 flex items-center">
              {fieldErrors.horaEntrada && (
                <p className="text-[11px] text-rose-600 font-medium">{fieldErrors.horaEntrada}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="agenda-exit" className="flex items-center gap-1 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              <Clock className="w-3.5 h-3.5 text-primary-600" strokeWidth={2} />
              Hora de Fin
            </label>
            <input
              id="agenda-exit"
              type="time"
              value={formData.horaSalida}
              onChange={(e) => updateField('horaSalida', e.target.value)}
              className={`w-full h-11 px-3.5 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                fieldErrors.horaSalida ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
              required
            />
            <div className="min-h-[20px] mt-0.5 flex items-center">
              {fieldErrors.horaSalida && (
                <p className="text-[11px] text-rose-600 font-medium">{fieldErrors.horaSalida}</p>
              )}
            </div>
          </div>
        </div>

        {/* Duración Dinámica de Slots (15, 30, 45, 60 min) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Duración de Cada Slot (Minutos)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {durationOptions.map((mins) => {
              const isSelected = Number(formData.duracionTurnoMinutos) === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => updateField('duracionTurnoMinutos', mins)}
                  tabIndex={0}
                  aria-pressed={isSelected}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    isSelected
                      ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {mins} min
                </button>
              );
            })}
          </div>
        </div>

        {/* Resumen Informativo de Slots a Generar */}
        <div className="bg-primary-50/70 border border-primary-200/80 rounded-xl p-3.5 flex items-center justify-between text-xs text-primary-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-600 shrink-0" aria-hidden="true" />
            <span className="font-medium">Slots dinámicos calculados:</span>
          </div>
          <span className="font-bold font-mono text-sm bg-primary-600 text-white px-2.5 py-0.5 rounded-md">
            ~{estimatedSlots} turnos
          </span>
        </div>

        {/* Acciones */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
          <div className="min-h-[20px] flex items-center text-xs text-rose-600 font-medium">
            {error && (
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
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
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting || estimatedSlots <= 0}
              tabIndex={0}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Generando Slots...</span>
                </>
              ) : (
                <>
                  <CalendarHeart className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                  <span>Crear y Generar Turnos</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
