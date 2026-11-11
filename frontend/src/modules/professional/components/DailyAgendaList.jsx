import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import {
  CalendarHeart,
  Clock,
  UserRound,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Stethoscope,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { staggerContainerVariants, staggerItemVariants, snappySpring } from '../../../shared/motion';

/**
 * Vista de Agenda Diaria del Profesional Médico.
 * Muestra lista limpia de pacientes programados para el día actual con filtros rápidos y acceso a la ficha.
 */
export const DailyAgendaList = ({
  appointments = [],
  allAppointments = [],
  selectedDate,
  onDateChange,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  stats,
  isLoading,
  onSelectPatient,
  activeConsultorio,
}) => {
  const [pendingOutOfScheduleAppointment, setPendingOutOfScheduleAppointment] = React.useState(null);
  const [cachedPendingApt, setCachedPendingApt] = React.useState(null);
  React.useEffect(() => {
    if (pendingOutOfScheduleAppointment) setCachedPendingApt(pendingOutOfScheduleAppointment);
  }, [pendingOutOfScheduleAppointment]);
  const activePendingApt = pendingOutOfScheduleAppointment || cachedPendingApt;

  const handlePatientAction = (appointment) => {
    const isAttended = isCitaAtendida(appointment.estado);
    if (isAttended) {
      onSelectPatient(appointment, false);
      return;
    }

    const isInWaitingRoom = appointment.estado === 6 || appointment.estado === 'EnSalaDeEspera';
    const isAlreadyInAttention = appointment.estado === 7 || appointment.estado === 'EnAtencion';

    // Si ya está en atención, ingresar a la ficha clínica
    if (isAlreadyInAttention) {
      onSelectPatient(appointment, true, false);
      return;
    }

    // Regla de Negocio: Debe estar en Sala de Espera para poder ser llamado a consulta
    if (!isInWaitingRoom) {
      return;
    }

    // Validación de ventana de horario (tolerancia razonable de ±45 min)
    const now = new Date();
    const appointmentDateStr = (appointment.fecha || '').split('T')[0];
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const isSameDay = appointmentDateStr === todayStr;

    let isWithinTimeWindow = false;
    if (isSameDay && appointment.horaInicio) {
      const [hIni, mIni] = String(appointment.horaInicio).split(':').map(Number);
      const [hFin, mFin] = String(appointment.horaFin || appointment.horaInicio).split(':').map(Number);
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const startMin = hIni * 60 + mIni;
      const endMin = hFin * 60 + mFin;
      if (nowMin >= startMin - 45 && nowMin <= endMin + 45) {
        isWithinTimeWindow = true;
      }
    }

    if (!isSameDay || !isWithinTimeWindow) {
      setPendingOutOfScheduleAppointment(appointment);
    } else {
      onSelectPatient(appointment, true, false);
    }
  };
  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    if (typeof timeStr === 'string') {
      const parts = timeStr.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  };

  const isCitaAtendida = (estado) =>
    estado === 3 || estado === 'Atendida' || estado === 'Atendido';

  const getStatusBadge = (estado) => {
    if (isCitaAtendida(estado)) {
      return (
        <Badge variant="success" className="gap-1 bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Atendido</span>
        </Badge>
      );
    }

    switch (estado) {
      case 1:
      case 'Solicitada':
        return <Badge variant="warning">Solicitada</Badge>;
      case 2:
      case 'Confirmada':
        return <Badge variant="primary">Confirmada</Badge>;
      case 4:
      case 'Ausente':
        return <Badge variant="default">Ausente</Badge>;
      case 5:
      case 'Cancelada':
        return <Badge variant="danger">Cancelada</Badge>;
      case 6:
      case 'EnSalaDeEspera':
        return <Badge variant="info">En Sala de Espera</Badge>;
      case 7:
      case 'EnAtencion':
        return <Badge variant="primary">En Atención</Badge>;
      default:
        return <Badge variant="default">Pendiente</Badge>;
    }
  };

  const getCoberturaBadge = (cobertura) => {
    switch (cobertura) {
      case 1:
        return <Badge variant="indigo" size="sm">Particular</Badge>;
      case 2:
        return <Badge variant="info" size="sm">Obra Social</Badge>;
      case 3:
        return <Badge variant="primary" size="sm">Prepaga</Badge>;
      default:
        return <Badge variant="default" size="sm">Cobertura</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra Superior de Controles y Resumen */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Información de la Jornada y Sede */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0">
              <CalendarHeart className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-slate-900 leading-snug">
                Agenda Diaria de Consultas
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Hoy'}</span>
                {activeConsultorio && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-primary-700">{activeConsultorio.nombre}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controles de Filtro y Fecha */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar paciente o CUIL..."
              className="w-full sm:w-56 pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-sans"
            aria-label="Seleccionar fecha de agenda"
          />

          <Button
            size="sm"
            variant="outline"
            onClick={() => onDateChange(new Date().toISOString().split('T')[0])}
            className="text-xs"
          >
            Hoy
          </Button>
        </div>
      </div>

      {/* Métricas y Tabs de Filtrado de Estado */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'ALL', label: `Todos (${stats.total})`, activeColor: 'text-slate-900' },
            { id: 'PENDING', label: `Pendientes (${stats.pending})`, activeColor: 'text-primary-700' },
            { id: 'ATTENDED', label: `Atendidos (${stats.attended})`, activeColor: 'text-emerald-700' },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusFilterChange(tab.id)}
                className={cn(
                  'relative px-3 py-1 rounded-lg text-xs font-semibold transition-colors duration-150 active:scale-[0.98] cursor-pointer',
                  isActive ? tab.activeColor : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="daily-agenda-tab"
                    transition={snappySpring}
                    className="absolute inset-0 bg-white rounded-lg shadow-xs"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Mostrando {appointments.length} de {allAppointments.length} turnos
        </span>
      </div>

      {/* Lista de Turnos / Pacientes */}
      {isLoading ? (
        <div className="space-y-3" role="status" aria-label="Cargando agenda de pacientes">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 animate-pulse flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-200" />
                <div className="space-y-2">
                  <div className="w-40 h-4 bg-slate-200 rounded" />
                  <div className="w-24 h-3 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="w-28 h-9 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
            <Stethoscope className="w-7 h-7" strokeWidth={2} aria-hidden="true" />
          </div>
          <h3 className="text-base font-bold font-heading text-slate-900">
            No hay pacientes programados
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'No se encontraron pacientes que coincidan con la búsqueda actual.'
              : 'No existen turnos asignados para la fecha seleccionada en este consultorio.'}
          </p>
        </div>
      ) : (
        <motion.div
          key={statusFilter + '_' + selectedDate}
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {appointments.map((appointment) => {
            const isAttended = isCitaAtendida(appointment.estado);
            const isAlreadyInAttention = appointment.estado === 7 || appointment.estado === 'EnAtencion';
            const isInWaitingRoom = appointment.estado === 6 || appointment.estado === 'EnSalaDeEspera';
            const canAttend = isAttended || isAlreadyInAttention || isInWaitingRoom;

            return (
              <motion.div
                key={appointment.id}
                variants={staggerItemVariants}
                className={cn(
                  'group p-4 sm:p-5 rounded-2xl border transition-all duration-150',
                  'flex flex-col sm:flex-row sm:items-center justify-between gap-4',
                  isAttended
                    ? 'bg-slate-50/70 border-slate-200/90 hover:border-emerald-300 hover:bg-slate-50/90'
                    : 'bg-white border-slate-200/80 hover:border-primary-300 hover:shadow-md'
                )}
              >
                {/* Horario y Datos del Paciente */}
                <div className="flex items-start sm:items-center gap-4">
                  {/* Badge de Horario */}
                  <div
                    className={cn(
                      'flex flex-col items-center justify-center w-14 sm:w-16 h-14 rounded-xl border transition-colors flex-shrink-0',
                      isAttended
                        ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-900 group-hover:bg-emerald-50'
                        : 'bg-slate-50 border-slate-200/80 group-hover:border-primary-200 group-hover:bg-primary-50/40'
                    )}
                  >
                    {isAttended ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mb-0.5" strokeWidth={2} />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-primary-600 mb-0.5" strokeWidth={2} />
                    )}
                    <span className="text-xs font-bold font-heading text-slate-900">
                      {formatTime(appointment.horaInicio)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatTime(appointment.horaFin)}
                    </span>
                  </div>

                  {/* Detalle del Paciente */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold font-heading text-slate-900 group-hover:text-primary-900 transition-colors">
                        {appointment.pacienteNombre}
                      </h3>
                      {getStatusBadge(appointment.estado)}
                      {getCoberturaBadge(appointment.cobertura)}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <UserRound className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                        CUIL: {appointment.pacienteCuil}
                      </span>
                      {appointment.estudioNombre && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-slate-700">
                            {appointment.estudioNombre}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 sm:self-center">
                  <Button
                    onClick={() => handlePatientAction(appointment)}
                    disabled={!canAttend}
                    variant={isAttended ? 'outline' : 'primary'}
                    size="sm"
                    className={cn(
                      'w-full sm:w-auto gap-1.5',
                      isAttended && 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900',
                      !canAttend && 'opacity-60 bg-slate-100 text-slate-400 border border-slate-200 shadow-none cursor-not-allowed hover:bg-slate-100'
                    )}
                    title={!canAttend ? 'El paciente debe registrar su llegada en Sala de Espera antes de ser llamado' : ''}
                    aria-label={
                      !canAttend
                        ? `No se puede atender a ${appointment.pacienteNombre}: debe registrar su llegada en Sala de Espera`
                        : `${isAttended ? 'Ver ficha y evolución clínica' : 'Atender paciente'} de ${appointment.pacienteNombre}`
                    }
                  >
                    {isAttended ? (
                      <>
                        <FileText className="w-4 h-4 text-emerald-600" strokeWidth={2} aria-hidden="true" />
                        <span>Ver Ficha / Evolución</span>
                      </>
                    ) : (
                      <>
                        <Stethoscope className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                        <span>{isAlreadyInAttention ? 'Continuar Consulta' : 'Atender Paciente'}</span>
                      </>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Modal de Advertencia y Confirmación de Atención Fuera de Horario */}
      <Modal
        isOpen={Boolean(pendingOutOfScheduleAppointment)}
        onClose={() => setPendingOutOfScheduleAppointment(null)}
        title="Aviso de Horario"
        description="Verificación de horario programado de la cita médica"
        maxWidth="max-w-md"
      >
        {activePendingApt && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed space-y-1.5">
                <p className="text-sm">
                  Aviso de Horario: Este turno está programado para las{' '}
                  <strong>{formatTime(activePendingApt.horaInicio)} hs</strong> y actualmente son las{' '}
                  <strong>{new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</strong>.
                </p>
                <p className="font-semibold text-slate-900 pt-1">
                  ¿Desea iniciar la atención fuera del horario estipulado?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPendingOutOfScheduleAppointment(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => {
                  const apt = pendingOutOfScheduleAppointment || activePendingApt;
                  setPendingOutOfScheduleAppointment(null);
                  if (apt) onSelectPatient(apt, true, true);
                }}
              >
                Iniciar Atención
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
