import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useMyAppointments } from '../hooks/useMyAppointments';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Toast } from '../../../shared/components/ui/Toast';
import { useConfirmDelete } from '../../../shared/hooks/useConfirmDelete';
import {
  CalendarDays,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Stethoscope,
  Hospital,
  ShieldPlus,
  HeartPulse,
  ListFilter,
  Ban,
  AlertCircle,
  FileText,
  Activity,
} from 'lucide-react';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/**
 * Vista de Calendario Interactivo para las Citas del Paciente (MisTurnosCalendario).
 * Consume CitasController mediante useMyAppointments y mapea cada turno como un evento interactivo.
 */
export const MisTurnosCalendario = () => {
  const { confirmDelete } = useConfirmDelete();
  const {
    appointments,
    isLoading,
    error,
    cancelAppointment,
    cancellingId,
    refreshAppointments,
  } = useMyAppointments();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'future' | 'history'
  const [toastMessage, setToastMessage] = useState(null);

  // Navegación entre meses
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    setCurrentDate(new Date());
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Filtrar citas según estado si aplica
  const filteredAppointments = useMemo(() => {
    if (statusFilter === 'future') {
      return appointments.filter(
        (c) => c.estado === 1 || c.estado === 2 || c.estado === 'Solicitada' || c.estado === 'Confirmada'
      );
    }
    if (statusFilter === 'history') {
      return appointments.filter(
        (c) => c.estado === 3 || c.estado === 4 || c.estado === 5 || c.estado === 'Atendida' || c.estado === 'Cancelada' || c.estado === 'Ausente'
      );
    }
    return appointments;
  }, [appointments, statusFilter]);

  // Diccionario de citas agrupadas por fecha en formato 'YYYY-MM-DD'
  const appointmentsByDate = useMemo(() => {
    const map = {};
    filteredAppointments.forEach((cita) => {
      if (!cita.fecha) return;
      const datePart = typeof cita.fecha === 'string' ? cita.fecha.split('T')[0] : cita.fecha;
      if (!map[datePart]) {
        map[datePart] = [];
      }
      map[datePart].push(cita);
    });

    // Ordenar citas de cada día por hora de inicio
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => {
        const timeA = typeof a.horaInicio === 'string' ? a.horaInicio : '';
        const timeB = typeof b.horaInicio === 'string' ? b.horaInicio : '';
        return timeA.localeCompare(timeB);
      });
    });

    return map;
  }, [filteredAppointments]);

  // Cálculo de la grilla mensual (Lunes a Domingo)
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Ajuste: getDay() devuelve 0 para domingo, 1 para lunes... Lo pasamos a 0 = lunes, 6 = domingo
    let firstDayIndex = firstDayOfMonth.getDay() - 1;
    if (firstDayIndex < 0) firstDayIndex = 6;

    const daysInCurrentMonth = lastDayOfMonth.getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells = [];

    // Días del mes anterior (padding inicial)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const date = new Date(currentYear, currentMonth - 1, d);
      const dateString = date.toISOString().split('T')[0];
      cells.push({
        dayNumber: d,
        dateString,
        isCurrentMonth: false,
        isToday: false,
        events: appointmentsByDate[dateString] || [],
      });
    }

    // Días del mes actual
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNumber: d,
        dateString,
        isCurrentMonth: true,
        isToday: dateString === todayString,
        events: appointmentsByDate[dateString] || [],
      });
    }

    // Días del siguiente mes (padding final para completar filas de 7)
    const remainingCells = 7 - (cells.length % 7);
    if (remainingCells < 7) {
      for (let d = 1; d <= remainingCells; d++) {
        const date = new Date(currentYear, currentMonth + 1, d);
        const dateString = date.toISOString().split('T')[0];
        cells.push({
          dayNumber: d,
          dateString,
          isCurrentMonth: false,
          isToday: false,
          events: appointmentsByDate[dateString] || [],
        });
      }
    }

    return cells;
  }, [currentYear, currentMonth, appointmentsByDate]);

  // Estilos de evento según estado (Instrucción estricta: futuras color primario, pasadas/canceladas apagadas)
  const getEventStyle = (cita) => {
    const estado = cita.estado;
    const isCancelled = estado === 5 || estado === 'Cancelada';
    const isAttended = estado === 3 || estado === 'Atendida';
    const isMissed = estado === 4 || estado === 'Ausente';
    const isFuture = estado === 1 || estado === 2 || estado === 'Solicitada' || estado === 'Confirmada';

    if (isCancelled) {
      return {
        pill: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300',
        dot: 'bg-rose-500',
        label: 'Cancelada',
      };
    }

    if (isAttended) {
      return {
        pill: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/80',
        dot: 'bg-slate-400',
        label: 'Atendida',
      };
    }

    if (isMissed) {
      return {
        pill: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
        dot: 'bg-amber-500',
        label: 'Ausente',
      };
    }

    // Futuras: Color primario (Azul / Verde)
    if (estado === 2 || estado === 'Confirmada') {
      return {
        pill: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 font-medium shadow-2xs',
        dot: 'bg-emerald-500',
        label: 'Confirmada',
      };
    }

    // Solicitada (Color Primario Azul)
    return {
      pill: 'bg-primary-50 text-primary-800 border-primary-200 hover:bg-primary-100 hover:border-primary-300 font-medium shadow-2xs',
      dot: 'bg-primary-500',
      label: 'Solicitada',
    };
  };

  const handleCancelFromModal = async (citaId) => {
    const doctorName = selectedAppointment?.profesionalNombre || 'su médico';
    const ok = await confirmDelete({
      title: '¿Cancelar turno definitivamente?',
      message: '¿Estás seguro de que deseas cancelar esta cita médica? El horario quedará liberado automáticamente para que otro paciente pueda reservarlo (RN-01).',
      itemName: `Cita con ${doctorName}`,
      confirmText: 'Sí, eliminar definitivamente',
      cancelText: 'Cancelar',
    });
    if (!ok) return;

    const success = await cancelAppointment(citaId);
    if (success) {
      setToastMessage({
        type: 'info',
        title: 'Cita Cancelada',
        message: 'Tu cita fue cancelada exitosamente y el horario quedó liberado.',
      });
      setSelectedAppointment(null);
      refreshAppointments();
    } else {
      setToastMessage({
        type: 'error',
        title: 'Error al cancelar',
        message: 'No se pudo cancelar el turno. Inténtalo nuevamente.',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notificación */}
      {toastMessage && (
        <Toast
          type={toastMessage.type}
          title={toastMessage.title}
          message={toastMessage.message}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Cabecera y Controles Principales */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
                Mi Calendario de Turnos
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Visualiza tus consultas médicas y estudios organizados cronológicamente por mes.
              </p>
            </div>
          </div>
        </div>

        {/* Switcher Lista / Calendario y Filtros */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <Link
              to="/patient/appointments"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Ver en Lista</span>
            </Link>
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-primary-700 shadow-2xs flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-primary-600" />
              <span>Calendario</span>
            </span>
          </div>

          {/* Filtros de Citas */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Todas las Citas</option>
            <option value="future">Próximos Turnos</option>
            <option value="history">Historial y Pasadas</option>
          </select>
        </div>
      </div>

      {/* Barra de Navegación del Mes y Leyenda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-5 py-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Selector de Mes */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="w-9 h-9 p-0 rounded-xl"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToday}
            className="text-xs font-semibold px-3 h-9 rounded-xl"
          >
            Hoy
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="w-9 h-9 p-0 rounded-xl"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <span className="text-base sm:text-lg font-bold font-heading text-slate-800 ml-2 tracking-tight">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
        </div>

        {/* Leyenda de Colores (Estricta según especificación) */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Confirmada (Verde)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-500" />
            <span>Solicitada (Azul)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Atendida (Gris)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Cancelada (Rojo)</span>
          </span>
        </div>
      </div>

      {/* Grilla Mensual del Calendario */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Cabecera de Días de la Semana */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/75 text-center">
          {DAY_NAMES.map((day, idx) => (
            <div
              key={idx}
              className="py-3 text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Celdas de los Días */}
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">Cargando tus citas médicas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[580px]">
            {calendarCells.map((cell, idx) => (
              <div
                key={idx}
                className={`p-1.5 sm:p-2.5 flex flex-col transition-colors min-h-[100px] sm:min-h-[120px] ${
                  cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/50 text-slate-400'
                } ${cell.isToday ? 'bg-primary-50/20' : ''}`}
              >
                {/* Número del Día */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                      cell.isToday
                        ? 'bg-primary-600 text-white shadow-xs'
                        : cell.isCurrentMonth
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {cell.events.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400 px-1">
                      {cell.events.length} {cell.events.length === 1 ? 'turno' : 'turnos'}
                    </span>
                  )}
                </div>

                {/* Eventos / Citas del Día */}
                <div className="space-y-1 overflow-y-auto max-h-24 sm:max-h-28 pr-0.5">
                  {cell.events.map((cita) => {
                    const style = getEventStyle(cita);
                    const horaFormatted =
                      typeof cita.horaInicio === 'string'
                        ? cita.horaInicio.substring(0, 5)
                        : cita.horaInicio;

                    return (
                      <button
                        key={cita.id}
                        type="button"
                        onClick={() => setSelectedAppointment(cita)}
                        className={`w-full text-left p-1 sm:p-1.5 rounded-lg border text-[11px] leading-tight transition-all duration-150 flex items-start gap-1.5 ${style.pill}`}
                        title={`Click para ver detalles: Dr. ${cita.profesionalNombre} - ${horaFormatted} hs`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${style.dot}`} />
                        <div className="truncate flex-1">
                          <span className="font-bold mr-1">{horaFormatted}</span>
                          <span className="truncate block font-medium">
                            {cita.estudioNombre ? cita.estudioNombre : `Dr. ${cita.profesionalNombre}`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalle de Cita Médica (Al hacer clic en un turno del calendario) */}
      <Modal
        isOpen={Boolean(selectedAppointment)}
        onClose={() => setSelectedAppointment(null)}
        title="Detalle del Turno Médico"
        description="Información completa de tu atención médica, profesional y consultorio."
        maxWidth="max-w-lg"
      >
        {selectedAppointment && (
          <div className="space-y-5">
            {/* Cabecera con Estado */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Turno #{selectedAppointment.id}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600 font-medium">
                  {selectedAppointment.tipo === 3 || selectedAppointment.tipo === 'Estudio'
                    ? 'Estudio Clínico'
                    : 'Consulta Médica'}
                </span>
              </div>
              <div>
                {selectedAppointment.estado === 1 || selectedAppointment.estado === 'Solicitada' ? (
                  <Badge variant="warning">Solicitada</Badge>
                ) : selectedAppointment.estado === 2 || selectedAppointment.estado === 'Confirmada' ? (
                  <Badge variant="success">Confirmada</Badge>
                ) : selectedAppointment.estado === 3 || selectedAppointment.estado === 'Atendida' ? (
                  <Badge variant="primary">Atendida</Badge>
                ) : selectedAppointment.estado === 5 || selectedAppointment.estado === 'Cancelada' ? (
                  <Badge variant="danger">Cancelada</Badge>
                ) : (
                  <Badge variant="default">{selectedAppointment.estado}</Badge>
                )}
              </div>
            </div>

            {/* Cuadrícula de Información Principal: Médico, Especialidad, Consultorio y Hora */}
            <div className="space-y-3.5">
              {/* Médico */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Profesional Médico
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    Dr(a). {selectedAppointment.profesionalNombre}
                  </p>
                  <span className="text-xs text-slate-500">
                    CUIL Médico: {selectedAppointment.profesionalCuil}
                  </span>
                </div>
              </div>

              {/* Especialidad o Estudio */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Especialidad / Estudio
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedAppointment.estudioNombre
                      ? selectedAppointment.estudioNombre
                      : selectedAppointment.especialidadNombre || 'Medicina General y Preventiva'}
                  </p>
                  {selectedAppointment.estudioNombre && (
                    <span className="text-xs text-emerald-600 font-medium">
                      Estudio programado con preparación específica
                    </span>
                  )}
                </div>
              </div>

              {/* Consultorio / Sede Física */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Hospital className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Sede / Consultorio
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedAppointment.consultorioNombre || 'Consultorio Central de Atención'}
                  </p>
                  <span className="text-xs text-slate-500">
                    San Miguel de Tucumán, Tucumán
                  </span>
                </div>
              </div>

              {/* Fecha y Hora */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Horario Programado
                  </span>
                  <p className="text-sm font-bold text-slate-900 capitalize">
                    {new Date(selectedAppointment.fecha).toLocaleDateString('es-AR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <span className="text-xs font-semibold text-indigo-600">
                    {typeof selectedAppointment.horaInicio === 'string'
                      ? selectedAppointment.horaInicio.substring(0, 5)
                      : selectedAppointment.horaInicio}{' '}
                    hs a{' '}
                    {typeof selectedAppointment.horaFin === 'string'
                      ? selectedAppointment.horaFin.substring(0, 5)
                      : selectedAppointment.horaFin}{' '}
                    hs
                  </span>
                </div>
              </div>
            </div>

            {/* Observaciones Médicas Si Existen */}
            {selectedAppointment.motivoObservacion && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Evolución Médica Registrada</span>
                </div>
                <p className="font-semibold text-slate-800">{selectedAppointment.motivoObservacion}</p>
                {selectedAppointment.detalleObservacion && (
                  <p className="text-slate-600 text-[11px]">{selectedAppointment.detalleObservacion}</p>
                )}
              </div>
            )}

            {/* Botones de Acción */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3">
              {(selectedAppointment.estado === 1 ||
                selectedAppointment.estado === 2 ||
                selectedAppointment.estado === 'Solicitada' ||
                selectedAppointment.estado === 'Confirmada') ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelFromModal(selectedAppointment.id)}
                  disabled={cancellingId === selectedAppointment.id}
                  isLoading={cancellingId === selectedAppointment.id}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1.5 text-xs font-semibold"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancelar Cita</span>
                </Button>
              ) : (
                <div />
              )}

              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedAppointment(null)}
                className="text-xs px-4"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
