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
    todayStr,
    sixMonthsFromNowStr,
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
        className="space-y-3"
      >
        {/* Selección de Profesional y Consultorio en 2 columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="agenda-doctor" title="Seleccionar profesional médico para la agenda" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              <Stethoscope className="w-3.5 h-3.5 text-primary-600" strokeWidth={2} />
              Profesional Médico
            </label>
            <select
              id="agenda-doctor"
              title="Seleccionar profesional médico"
              value={formData.profesionalCuil}
              onChange={(e) => updateField('profesionalCuil', e.target.value)}
              className={`w-full h-10 px-3 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
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
            {fieldErrors.profesionalCuil && (
              <p className="text-[11px] text-rose-600 font-medium mt-0.5">{fieldErrors.profesionalCuil}</p>
            )}
          </div>

          <div>
            <label htmlFor="agenda-consultorio" title="Seleccionar consultorio de atención" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              <Hospital className="w-3.5 h-3.5 text-primary-600" strokeWidth={2} />
              Consultorio de Atención
            </label>
            <select
              id="agenda-consultorio"
              title="Seleccionar consultorio o sede de atención"
              value={formData.cuitConsultorio}
              onChange={(e) => updateField('cuitConsultorio', e.target.value)}
              className={`w-full h-10 px-3 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
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
            {fieldErrors.cuitConsultorio && (
              <p className="text-[11px] text-rose-600 font-medium mt-0.5">{fieldErrors.cuitConsultorio}</p>
            )}
          </div>
        </div>

        {/* Fecha y Franja Horaria (Entrada y Salida) en 3 columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="agenda-date" title="Seleccionar fecha de atención" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              <CalendarHeart className="w-3.5 h-3.5 text-primary-600" strokeWidth={2} />
              Fecha de Atención
            </label>
            <input
              id="agenda-date"
              type="date"
              title="Fecha de atención de la agenda"
              min={todayStr}
              max={sixMonthsFromNowStr}
              value={formData.fecha}
              onChange={(e) => updateField('fecha', e.target.value)}
              className={`w-full h-10 px-3 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                fieldErrors.fecha ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
              required
            />
            {fieldErrors.fecha && (
              <p className="text-[11px] text-rose-600 font-medium mt-0.5">{fieldErrors.fecha}</p>
            )}
          </div>

          <div>
            <label htmlFor="agenda-entry" title="Seleccionar hora de inicio de jornada" className="flex items-center gap-1 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5 text-primary-600" strokeWidth={2} />
              Hora de Inicio
            </label>
            <input
              id="agenda-entry"
              type="time"
              title="Hora de inicio de atención"
              value={formData.horaEntrada}
              onChange={(e) => updateField('horaEntrada', e.target.value)}
              className={`w-full h-10 px-3 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                fieldErrors.horaEntrada ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
              required
            />
            {fieldErrors.horaEntrada && (
              <p className="text-[11px] text-rose-600 font-medium mt-0.5">{fieldErrors.horaEntrada}</p>
            )}
          </div>

          <div>
            <label htmlFor="agenda-exit" title="Seleccionar hora de finalización de jornada" className="flex items-center gap-1 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5 text-primary-600" strokeWidth={2} />
              Hora de Fin
            </label>
            <input
              id="agenda-exit"
              type="time"
              title="Hora de fin de atención"
              value={formData.horaSalida}
              onChange={(e) => updateField('horaSalida', e.target.value)}
              className={`w-full h-10 px-3 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                fieldErrors.horaSalida ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
              required
            />
            {fieldErrors.horaSalida && (
              <p className="text-[11px] text-rose-600 font-medium mt-0.5">{fieldErrors.horaSalida}</p>
            )}
          </div>
        </div>

        {/* Franja de Pausa / Descanso / Almuerzo Opcional */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.tieneDescanso}
              onChange={(e) => updateField('tieneDescanso', e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
            />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Incluir Pausa de Almuerzo / Descanso
            </span>
          </label>

          {formData.tieneDescanso && (
            <div className="grid grid-cols-2 gap-3 pt-1 animate-in fade-in-0 duration-150">
              <div>
                <label htmlFor="agenda-break-start" className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Inicio del Descanso
                </label>
                <input
                  id="agenda-break-start"
                  type="time"
                  value={formData.horaInicioDescanso}
                  onChange={(e) => updateField('horaInicioDescanso', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="agenda-break-end" className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Fin del Descanso
                </label>
                <input
                  id="agenda-break-end"
                  type="time"
                  value={formData.horaFinDescanso}
                  onChange={(e) => updateField('horaFinDescanso', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Duración Dinámica de Slots (15, 30, 45, 60 min) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Duración de Cada Slot (Minutos)
          </label>
          <div className="grid grid-cols-2 min-[380px]:grid-cols-4 gap-2">
            {durationOptions.map((mins) => {
              const isSelected = Number(formData.duracionTurnoMinutos) === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => updateField('duracionTurnoMinutos', mins)}
                  tabIndex={0}
                  aria-pressed={isSelected}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-transform duration-75 active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 ${
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
