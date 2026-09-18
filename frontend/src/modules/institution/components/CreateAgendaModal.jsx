import React from 'react';
import { Calendar, Clock, Building2, User, Sparkles, Loader2, Check, AlertCircle } from 'lucide-react';
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
          <label htmlFor="agenda-doctor" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Profesional Médico
          </label>
          <select
            id="agenda-doctor"
            value={formData.profesionalCuil}
            onChange={(e) => updateField('profesionalCuil', e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          >
            <option value="">Selecciona un médico...</option>
            {doctors.map((doc) => (
              <option key={doc.cuil} value={doc.cuil}>
                Dr. {doc.nombre} {doc.apellido} ({doc.especialidades?.[0] || 'General'})
              </option>
            ))}
          </select>
        </div>

        {/* Selección de Consultorio */}
        <div>
          <label htmlFor="agenda-consultorio" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Consultorio de Atención
          </label>
          <select
            id="agenda-consultorio"
            value={formData.cuitConsultorio}
            onChange={(e) => updateField('cuitConsultorio', e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          >
            <option value="">Selecciona un consultorio...</option>
            {consultorios.map((cons) => (
              <option key={cons.cuit} value={cons.cuit}>
                {cons.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha de la Agenda */}
        <div>
          <label htmlFor="agenda-date" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Fecha de Atención
          </label>
          <input
            id="agenda-date"
            type="date"
            value={formData.fecha}
            onChange={(e) => updateField('fecha', e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          >
          </input>
        </div>

        {/* Franja Horaria (Entrada y Salida) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="agenda-entry" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Hora de Inicio
            </label>
            <input
              id="agenda-entry"
              type="time"
              value={formData.horaEntrada}
              onChange={(e) => updateField('horaEntrada', e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label htmlFor="agenda-exit" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Hora de Fin
            </label>
            <input
              id="agenda-exit"
              type="time"
              value={formData.horaSalida}
              onChange={(e) => updateField('horaSalida', e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
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
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
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
        <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-3.5 flex items-center justify-between text-xs text-teal-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
            <span className="font-medium">Slots dinámicos calculados:</span>
          </div>
          <span className="font-bold font-mono text-sm bg-teal-600 text-white px-2.5 py-0.5 rounded-md">
            ~{estimatedSlots} turnos
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Acciones */}
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
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>Crear y Generar Turnos</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
