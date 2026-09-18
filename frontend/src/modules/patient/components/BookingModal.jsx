import React from 'react';
import { Calendar, Clock, Stethoscope, Shield, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { useBooking } from '../hooks/useBooking';

export const BookingModal = ({
  isOpen,
  onClose,
  doctor,
  onBookingSuccess,
}) => {
  const {
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
  } = useBooking(doctor, (res) => {
    onBookingSuccess(res);
    onClose();
  });

  if (!doctor) return null;

  const doctorName = `Dr. ${doctor.nombre} ${doctor.apellido}`;
  const specialty = doctor.especialidades?.[0] || 'Medicina General';

  // Generar opciones de fecha para los próximos 7 días
  const today = new Date();
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      value: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }),
    };
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agendar Turno Médico"
      description={`Reserva de cita con ${doctorName} (${specialty})`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Banner del Profesional */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-600 text-white font-heading font-bold text-lg flex items-center justify-center shrink-0">
            {doctor.nombre?.[0]}{doctor.apellido?.[0]}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-heading">{doctorName}</h3>
            <p className="text-xs text-slate-500">
              {doctor.consultorios?.[0] || 'Sanatorio Tucumán'} • Mat. {doctor.matricula}
            </p>
          </div>
        </div>

        {/* 1. Selector de Tipo de Cita */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            1. Tipo de Atención
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipoCita(1)}
              tabIndex={0}
              className={`p-3 rounded-xl border text-left transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                tipoCita === 1
                  ? 'border-teal-600 bg-teal-50/60 ring-1 ring-teal-500 text-teal-900'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <span className="block font-bold text-xs sm:text-sm">Consulta Médica</span>
              <span className="text-[11px] text-slate-500">Evaluación y diagnóstico clínico</span>
            </button>

            <button
              type="button"
              onClick={() => setTipoCita(3)}
              disabled={!doctor.estudios || doctor.estudios.length === 0}
              tabIndex={0}
              className={`p-3 rounded-xl border text-left transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                tipoCita === 3
                  ? 'border-teal-600 bg-teal-50/60 ring-1 ring-teal-500 text-teal-900'
                  : !doctor.estudios || doctor.estudios.length === 0
                  ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed text-slate-400'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <span className="block font-bold text-xs sm:text-sm">Estudio Médico</span>
              <span className="text-[11px] text-slate-500">
                {doctor.estudios?.length > 0 ? 'Estudios de diagnóstico' : 'No disponible'}
              </span>
            </button>
          </div>

          {/* Selector de Estudio específico si eligió Estudio */}
          {tipoCita === 3 && doctor.estudios?.length > 0 && (
            <div className="mt-3">
              <label htmlFor="select-estudio" className="block text-xs font-semibold text-slate-600 mb-1">
                Selecciona el Estudio Requerido:
              </label>
              <select
                id="select-estudio"
                value={selectedEstudioId}
                onChange={(e) => setSelectedEstudioId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Selecciona un estudio...</option>
                {doctor.estudios.map((est) => (
                  <option key={est.estudioId} value={est.estudioId}>
                    {est.estudioNombre} ({est.duracionTurno} min)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 2. Selector de Fecha */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            2. Selecciona la Fecha
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {dateOptions.map((opt) => {
              const isSelected = selectedDate === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedDate(opt.value)}
                  tabIndex={0}
                  className={`shrink-0 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="capitalize">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Horarios Disponibles con SKELETON LOADER */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              3. Horarios Disponibles
            </label>
            <span className="text-[11px] text-slate-400">
              {availableSlots.length} horarios libres
            </span>
          </div>

          {isLoadingSlots ? (
            /* Skeleton Loader animado imitando los chips de turnos */
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 py-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div
                  key={n}
                  className="h-11 rounded-xl bg-slate-200 animate-pulse border border-slate-200"
                  aria-hidden="true"
                />
              ))}
            </div>
          ) : slotError ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{slotError}</span>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <Clock className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-600">No hay turnos libres para esta fecha</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Prueba seleccionando otro día en el calendario.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
              {availableSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                // Formatear HoraInicio (TimeSpan o string)
                const horaStr = slot.horaInicio?.substring ? slot.horaInicio.substring(0, 5) : `${slot.horaInicio}`;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    tabIndex={0}
                    aria-label={`Seleccionar horario ${horaStr}`}
                    className={`h-11 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs scale-[1.02]'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-teal-300 hover:bg-teal-50/50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{horaStr}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Cobertura médica */}
        <div>
          <label htmlFor="select-cobertura" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            4. Cobertura / Obra Social
          </label>
          <select
            id="select-cobertura"
            value={selectedObraSocialId}
            onChange={(e) => setSelectedObraSocialId(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Atención Particular (Sin Obra Social)</option>
            {doctor.obrasSociales?.map((os, idx) => (
              <option key={idx} value={idx + 1}>
                {os}
              </option>
            ))}
          </select>
        </div>

        {/* Mensaje de error al confirmar */}
        {submitError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Acciones del Modal */}
        <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5">
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
            onClick={confirmBooking}
            disabled={!selectedSlot || isSubmitting}
            tabIndex={0}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Confirmando Reserva...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>Confirmar Turno</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
