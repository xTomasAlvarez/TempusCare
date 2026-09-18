import React from 'react';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import {
  Calendar,
  Clock,
  User,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Stethoscope,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

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
  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    if (typeof timeStr === 'string') {
      const parts = timeStr.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 1: // Solicitada
        return <Badge variant="warning">Solicitada</Badge>;
      case 2: // Confirmada
        return <Badge variant="primary">Confirmada</Badge>;
      case 3: // Atendida
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Atendida
          </Badge>
        );
      case 4: // Ausente
        return <Badge variant="default">Ausente</Badge>;
      case 5: // Cancelada
        return <Badge variant="danger">Cancelada</Badge>;
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
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5" aria-hidden="true" />
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
                    <span className="font-medium text-teal-700">{activeConsultorio.nombre}</span>
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
              className="w-full sm:w-56 pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
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
          <button
            type="button"
            onClick={() => onStatusFilterChange('ALL')}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Todos ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('PENDING')}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
              statusFilter === 'PENDING'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Pendientes ({stats.pending})
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('ATTENDED')}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
              statusFilter === 'ATTENDED'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Atendidos ({stats.attended})
          </button>
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
          <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
            <Stethoscope className="w-7 h-7" aria-hidden="true" />
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
        <div className="space-y-3">
          {appointments.map((appointment) => {
            const isAttended = appointment.estado === 3;
            return (
              <div
                key={appointment.id}
                className={cn(
                  'group bg-white p-4 sm:p-5 rounded-2xl border transition-all duration-200',
                  'border-slate-200/80 hover:border-teal-300 hover:shadow-md',
                  'flex flex-col sm:flex-row sm:items-center justify-between gap-4'
                )}
              >
                {/* Horario y Datos del Paciente */}
                <div className="flex items-start sm:items-center gap-4">
                  {/* Badge de Horario */}
                  <div className="flex flex-col items-center justify-center w-14 sm:w-16 h-14 rounded-xl bg-slate-50 border border-slate-200/80 group-hover:border-teal-200 group-hover:bg-teal-50/40 transition-colors flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 text-teal-600 mb-0.5" />
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
                      <h3 className="text-base font-bold font-heading text-slate-900 group-hover:text-teal-900 transition-colors">
                        {appointment.pacienteNombre}
                      </h3>
                      {getStatusBadge(appointment.estado)}
                      {getCoberturaBadge(appointment.cobertura)}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
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
                    onClick={() => onSelectPatient(appointment)}
                    variant={isAttended ? 'outline' : 'primary'}
                    size="sm"
                    className="w-full sm:w-auto gap-1.5"
                    aria-label={`Atender y abrir ficha clínica de ${appointment.pacienteNombre}`}
                  >
                    <Stethoscope className="w-4 h-4" aria-hidden="true" />
                    <span>{isAttended ? 'Ver Ficha Clínica' : 'Atender Paciente'}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
