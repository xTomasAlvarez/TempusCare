import React, { useState, useEffect, useRef, useMemo } from 'react';
import { patientService } from '../services/patientService';
import { CalendarHeart, UserRoundPlus, Clock, Stethoscope, Microscope, ShieldPlus, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { useBooking } from '../hooks/useBooking';
import { useAuth } from '../../../core/context/AuthContext';

export const BookingModal = ({
  isOpen,
  onClose,
  doctor,
  onBookingSuccess,
  patientCuil = null,
  patientName = null,
}) => {
  const { user } = useAuth();
  const [obrasSocialesCatalog, setObrasSocialesCatalog] = useState([]);

  useEffect(() => {
    let isMounted = true;
    patientService.getHealthInsurances().then((data) => {
      if (isMounted && Array.isArray(data)) {
        setObrasSocialesCatalog(data);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);
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
    isSlotPast,
    getTodayStr,
    patientCuil: effectivePatientCuil,
    setPatientCuil,
  } = useBooking(doctor, (res) => {
    onBookingSuccess(res);
    onClose();
  }, patientCuil);

  const slotButtonsRef = useRef([]);

  // Índices de turnos habilitados para navegación por teclado
  const enabledSlotIndices = useMemo(() => {
    return availableSlots
      .map((slot, idx) => {
        const isOccupied = slot.ocupado === true || slot.disponible === false;
        const isPast = isSlotPast ? isSlotPast(slot, selectedDate) : false;
        return isOccupied || isPast ? -1 : idx;
      })
      .filter((idx) => idx !== -1);
  }, [availableSlots, selectedDate, isSlotPast]);

  // Soporte de navegación accesible por teclado mediante flechas (WCAG 2.1 AA / RNF-ACC-02)
  const handleSlotKeyDown = (e, index) => {
    const currentPos = enabledSlotIndices.indexOf(index);
    if (currentPos === -1) return;

    const COLS = window.innerWidth >= 640 ? 4 : 3;
    let targetPos = -1;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      targetPos = currentPos + 1 < enabledSlotIndices.length ? currentPos + 1 : 0;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      targetPos = currentPos - 1 >= 0 ? currentPos - 1 : enabledSlotIndices.length - 1;
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      targetPos = currentPos + COLS < enabledSlotIndices.length ? currentPos + COLS : currentPos;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      targetPos = currentPos - COLS >= 0 ? currentPos - COLS : currentPos;
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setSelectedSlot(availableSlots[index]);
      return;
    }

    if (targetPos !== -1) {
      const targetSlotIndex = enabledSlotIndices[targetPos];
      slotButtonsRef.current[targetSlotIndex]?.focus();
    }
  };

  const [cachedDoctor, setCachedDoctor] = useState(doctor);
  useEffect(() => {
    if (doctor) setCachedDoctor(doctor);
  }, [doctor]);

  const activeDoctor = doctor || cachedDoctor;
  if (!activeDoctor) return null;

  const doctorName = `Dr. ${activeDoctor.nombre} ${activeDoctor.apellido}`;
  const specialty = activeDoctor.especialidades?.[0] || 'Medicina General';

  const todayStr = getTodayStr ? getTodayStr() : new Date().toLocaleDateString('en-CA');
  const sixMonthsFromNowStr = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();
  const isToday = selectedDate === todayStr;

  // Generar opciones de fecha para los próximos 7 días hábiles (Lunes a Viernes, sin Sábados ni Domingos)
  const today = new Date();
  const dateOptions = [];
  let offset = 0;
  while (dateOptions.length < 7) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    offset++;
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dateOptions.push({
      value: `${year}-${month}-${day}`,
      label: d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }),
    });
  }

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
        <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-600 text-white font-heading font-bold text-lg flex items-center justify-center shrink-0">
              {activeDoctor.nombre?.[0]}{activeDoctor.apellido?.[0]}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">{doctorName}</h3>
              <p className="text-xs text-slate-500">
                {activeDoctor.consultorios?.[0] || 'Sanatorio Tucumán'} • Mat. {activeDoctor.matricula}
              </p>
            </div>
          </div>
          <Badge variant="primary" size="sm" title="Flujo optimizado RNF-USA-02 (máximo 4 clics) y accesible por teclado RNF-ACC-02">
            Reserva Rápida ≤ 4 Clics
          </Badge>
        </div>

        {/* Sección de Paciente para Secretaría / Staff (RF-ASI-06) */}
        {(patientName || patientCuil || user?.rol !== 'Paciente') && (
          <div className="bg-primary-50/70 border border-primary-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary-950 uppercase tracking-wider flex items-center gap-1.5">
                <UserRoundPlus className="w-4 h-4 text-primary-600" />
                Asignación de Turno (Recepción)
              </span>
              {patientName && (
                <Badge variant="primary">Paciente Presencial</Badge>
              )}
            </div>
            {patientName ? (
              <div className="text-xs text-primary-900">
                <span className="font-semibold">{patientName}</span> • CUIL/DNI: <span className="font-mono font-medium">{patientCuil || effectivePatientCuil}</span>
              </div>
            ) : (
              <div>
                <label htmlFor="booking-secretary-patient-cuil" className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  CUIL / DNI del Paciente:
                </label>
                <input
                  id="booking-secretary-patient-cuil"
                  type="text"
                  placeholder="Ej: 27123456789 o DNI 38123456"
                  value={effectivePatientCuil || ''}
                  onChange={(e) => setPatientCuil(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-primary-200 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            )}
          </div>
        )}

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
              className={`p-3 rounded-xl border text-left transition-transform duration-75 active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                tipoCita === 1
                  ? 'border-primary-600 bg-primary-50/60 ring-1 ring-primary-500 text-primary-900'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <span className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                <Stethoscope className="w-4 h-4 text-primary-600" strokeWidth={2} aria-hidden="true" />
                Consulta Médica
              </span>
              <span className="text-[11px] text-slate-500">Evaluación y diagnóstico clínico</span>
            </button>

            <button
              type="button"
              onClick={() => setTipoCita(3)}
              disabled={!activeDoctor.estudios || activeDoctor.estudios.length === 0}
              tabIndex={0}
              className={`p-3 rounded-xl border text-left transition-transform duration-75 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                tipoCita === 3
                  ? 'border-primary-600 bg-primary-50/60 ring-1 ring-primary-500 text-primary-900 active:scale-[0.98] cursor-pointer'
                  : !activeDoctor.estudios || activeDoctor.estudios.length === 0
                  ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed text-slate-400'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700 active:scale-[0.98] cursor-pointer'
              }`}
            >
              <span className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                <Microscope className="w-4 h-4 text-primary-600" strokeWidth={2} aria-hidden="true" />
                Estudio Médico
              </span>
              <span className="text-[11px] text-slate-500">
                {activeDoctor.estudios?.length > 0 ? 'Estudios de diagnóstico' : 'No disponible'}
              </span>
            </button>
          </div>

          {/* Selector de Estudio específico si eligió Estudio */}
          {tipoCita === 3 && activeDoctor.estudios?.length > 0 && (
            <div className="mt-3">
              <label htmlFor="select-estudio" className="block text-xs font-semibold text-slate-600 mb-1">
                Selecciona el Estudio Requerido:
              </label>
              <select
                id="select-estudio"
                value={selectedEstudioId}
                onChange={(e) => setSelectedEstudioId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecciona un estudio...</option>
                {activeDoctor.estudios.map((est) => (
                  <option key={est.estudioId} value={est.estudioId}>
                    {est.estudioNombre} ({est.duracionTurno} min)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 2. Selector de Fecha (Próximos días hábiles y selector libre hasta 6 meses) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
              <CalendarHeart className="w-4 h-4 text-primary-600" strokeWidth={2} aria-hidden="true" />
              2. Selecciona la Fecha
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Otra fecha:</span>
              <input
                type="date"
                min={todayStr}
                max={sixMonthsFromNowStr}
                value={selectedDate}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    const parsed = new Date(`${val}T00:00:00`);
                    if (parsed.getDay() === 0 || parsed.getDay() === 6) {
                      return; // Ignorar selección de fin de semana
                    }
                    setSelectedDate(val);
                  }
                }}
                className="h-8 px-2 py-0.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {dateOptions.map((opt) => {
              const isSelected = selectedDate === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedDate(opt.value)}
                  tabIndex={0}
                  className={`shrink-0 px-3.5 py-2 rounded-xl border text-xs font-medium transition-transform duration-75 active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    isSelected
                      ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
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
            <label id="horarios-disponibles-label" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              3. Horarios Disponibles
            </label>
            <span
              className="text-[11px] text-slate-400"
              aria-live="polite"
              aria-atomic="true"
            >
              {availableSlots.length} horarios libres
            </span>
          </div>

          <div className="min-h-[140px] flex flex-col justify-center">
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
              <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
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
              <div
                role="group"
                aria-labelledby="horarios-disponibles-label"
                className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1"
              >
                {availableSlots.map((slot, index) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  const isOccupied = slot.ocupado === true || slot.disponible === false;
                  const isPast = isSlotPast ? isSlotPast(slot, selectedDate) : false;
                  const isDisabled = isOccupied || isPast;
                  // Formatear HoraInicio (TimeSpan o string)
                  const horaStr = slot.horaInicio?.substring ? slot.horaInicio.substring(0, 5) : `${slot.horaInicio}`;
                  const slotLabel = isOccupied
                    ? 'Ocupado'
                    : isPast
                    ? 'Horario pasado'
                    : isSelected
                    ? 'Seleccionado'
                    : 'Disponible';

                  return (
                    <button
                      key={slot.id}
                      ref={(el) => (slotButtonsRef.current[index] = el)}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => !isDisabled && setSelectedSlot(slot)}
                      onKeyDown={(e) => handleSlotKeyDown(e, index)}
                      tabIndex={isDisabled ? -1 : 0}
                      aria-pressed={isSelected}
                      title={isPast ? 'Este horario ya ha transcurrido hoy' : isOccupied ? 'Horario no disponible' : undefined}
                      aria-label={`Horario ${horaStr}, estado: ${slotLabel}`}
                      className={`h-11 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-transform duration-75 focus:outline-none focus:ring-2 focus:ring-primary-500 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 ${
                        isDisabled
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through opacity-60'
                          : isSelected
                          ? 'bg-primary-600 text-white border-primary-600 shadow-sm ring-2 ring-primary-500/30 scale-[1.02] active:scale-[0.98] cursor-pointer'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-primary-400 hover:bg-primary-50/50 hover:text-primary-900 shadow-2xs active:scale-[0.98] cursor-pointer'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{horaStr}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {isToday && (
              <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary-600 shrink-0" aria-hidden="true" />
                <span>Para el día de hoy, los horarios pasados se encuentran bloqueados automáticamente.</span>
              </p>
            )}
          </div>
        </div>

        {/* 4. Cobertura médica */}
        <div>
          <label htmlFor="select-cobertura" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            <ShieldPlus className="w-4 h-4 text-primary-600" strokeWidth={2} aria-hidden="true" />
            4. Cobertura / Obra Social
          </label>
          <select
            id="select-cobertura"
            value={selectedObraSocialId}
            onChange={(e) => setSelectedObraSocialId(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="">Atención Particular (Sin Obra Social)</option>
            {activeDoctor.obrasSociales?.map((os, idx) => {
              const osName = typeof os === 'string' ? os : (os.nombre || '');
              const matched = obrasSocialesCatalog.find(
                (item) => item.nombre?.toLowerCase().trim() === osName.toLowerCase().trim()
              );
              const realId = matched ? matched.id : (typeof os === 'object' && os.id ? os.id : idx + 1);
              return (
                <option key={idx} value={realId}>
                  {osName}
                </option>
              );
            })}
          </select>
        </div>

        {/* Espacio fijo reservado para mensaje de error inline (sin saltos de layout) */}
        <div className="min-h-[22px] flex items-center">
          {submitError && (
            <p
              role="alert"
              aria-live="assertive"
              className="text-xs text-rose-600 flex items-center gap-1.5 animate-in fade-in-0 duration-150 font-medium"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              <span>{submitError}</span>
            </p>
          )}
        </div>

        {/* Acciones del Modal */}
        <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5">
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
