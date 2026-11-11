import React from 'react';
import { Clock, Stethoscope, Ban, UserCheck, ClipboardCheck } from 'lucide-react';
import { Badge } from '../../../shared/components/ui/Badge';

export const KanbanCard = ({
  item,
  columnType, // 'disponible' | 'espera' | 'atendiendo' | 'finalizado'
  onMarkArrived,
  onStartAttention,
  onMarkAbsent,
  onCancel,
  isActionLoading = false,
}) => {
  const horaInicioStr = typeof item.horaInicio === 'string' ? item.horaInicio.substring(0, 5) : `${item.horaInicio}`;
  const horaFinStr = item.horaFin ? (typeof item.horaFin === 'string' ? item.horaFin.substring(0, 5) : `${item.horaFin}`) : '';

  // 1. Tarjeta para slot Disponible (Fin de bordes punteados)
  if (columnType === 'disponible') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs transition-shadow hover:shadow-md p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-heading font-semibold text-base text-slate-900">
            <Clock className="w-4 h-4 text-primary-600" strokeWidth={2} aria-hidden="true" />
            <span>{horaInicioStr} {horaFinStr ? `– ${horaFinStr}` : ''} hs</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Disponible
          </span>
        </div>

        <div className="pt-1 flex items-center justify-between text-sm text-slate-500">
          <span>{item.consultorioNombre || 'Consultorio Central'}</span>
          <span className="text-xs text-primary-600 font-medium">Libre</span>
        </div>
      </div>
    );
  }

  // 2. Tarjetas con Cita y Paciente
  const patientName = item.pacienteNombre || 'Paciente Registrado';
  const isEstudio = item.tipo === 3 || item.tipo === 'Estudio';

  return (
    <div
      tabIndex={0}
      className={`bg-white border rounded-xl shadow-xs transition-shadow hover:shadow-md p-4 space-y-3 ${
        columnType === 'atendiendo'
          ? 'border-primary-300 ring-2 ring-primary-500/20'
          : 'border-slate-200'
      }`}
    >
      {/* Hora Prominente y Badges */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-heading font-semibold text-base text-slate-900">
          <Clock className="w-4 h-4 text-primary-600" strokeWidth={2} aria-hidden="true" />
          <span>{horaInicioStr} hs</span>
        </div>

        <div className="flex items-center gap-1.5">
          {isEstudio ? (
            <Badge variant="info" size="sm">Estudio</Badge>
          ) : (
            <Badge variant="primary" size="sm">Consulta</Badge>
          )}

          {columnType === 'espera' && item.hasArrived && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              En Espera
            </span>
          )}
          {columnType === 'espera' && !item.hasArrived && (() => {
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const itemDateStr = (item.fecha || '').split('T')[0];
            const isToday = itemDateStr === todayStr || !item.fecha;

            let isDelayed = false;
            if (isToday && item.horaInicio && (item.estado === 2 || item.estado === 'Confirmada')) {
              const [hIni, mIni] = String(item.horaInicio).split(':').map(Number);
              const schedMins = hIni * 60 + mIni;
              const nowMins = now.getHours() * 60 + now.getMinutes();
              if (nowMins > schedMins + 15) {
                isDelayed = true;
              }
            }

            return isDelayed ? (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Demorado (+15 min)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                Citado
              </span>
            );
          })()}
        </div>
      </div>

      {/* Nombre del Paciente Destacado */}
      <div>
        <h4 className="text-lg font-medium font-heading text-slate-900 line-clamp-1">
          {patientName}
        </h4>
        {/* Metadatos Sutiles */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mt-1">
          <span>CUIL: {item.pacienteCuil || 'N/A'}</span>
          <span>•</span>
          <span className="font-medium text-slate-600">
            {item.cobertura === 2 || item.cobertura === 'ObraSocial' ? 'Obra Social' : 'Particular'}
          </span>
          {item.estudioNombre && (
            <>
              <span>•</span>
              <span className="text-primary-700">{item.estudioNombre}</span>
            </>
          )}
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
        {/* En Sala de Espera / Citados */}
        {columnType === 'espera' && (
          <>
            {!item.hasArrived && (
              <div className="text-[11px] text-amber-800 bg-amber-50/90 px-2 py-1 rounded-md border border-amber-200/80 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span className="leading-tight">El paciente debe registrar su llegada en Sala de Espera antes de ser llamado</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              {!item.hasArrived && onMarkArrived && (
                <button
                  type="button"
                  onClick={() => onMarkArrived(item.id)}
                  disabled={isActionLoading}
                  tabIndex={0}
                  aria-label={`Registrar llegada de ${patientName}`}
                  title="Marcar llegada a Sala de Espera"
                  className="py-2 px-2.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-transform duration-75 active:scale-[0.98] flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2} aria-hidden="true" />
                  <span>Llegó</span>
                </button>
              )}

              {!item.hasArrived && onMarkAbsent && (
                <button
                  type="button"
                  onClick={() => onMarkAbsent(item.id)}
                  disabled={isActionLoading}
                  tabIndex={0}
                  aria-label={`Marcar ausente a ${patientName}`}
                  title="Marcar como Ausente (No-show)"
                  className="py-2 px-2 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-transform duration-75 active:scale-[0.98] flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  <span>Ausente</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => item.hasArrived && onStartAttention(item.id, item)}
                disabled={isActionLoading || !item.hasArrived}
                tabIndex={item.hasArrived ? 0 : -1}
                aria-disabled={!item.hasArrived}
                aria-label={!item.hasArrived
                  ? `No se puede llamar a ${patientName}: debe registrar su llegada en Sala de Espera antes de ser llamado`
                  : `Llamar a consultorio a ${patientName}`}
                title={!item.hasArrived
                  ? 'El paciente debe registrar su llegada en Sala de Espera antes de ser llamado'
                  : 'Llamar a consultorio'}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-transform duration-75 flex items-center justify-center gap-1.5 shadow-xs ${
                  item.hasArrived
                    ? 'text-white bg-primary-600 hover:bg-primary-700 active:scale-[0.98] cursor-pointer'
                    : 'text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed opacity-75 shadow-none'
                }`}
              >
                <Stethoscope className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                <span>Llamar</span>
              </button>

              <button
                type="button"
                onClick={() => onCancel(item.id)}
                disabled={isActionLoading}
                tabIndex={0}
                aria-label={`Cancelar cita de ${patientName}`}
                title="Cancelar cita y liberar turno"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-transform duration-75 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                <Ban className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </>
        )}

        {/* Atendiéndose -> Badge Informativo (Solo el médico finaliza la consulta al guardar evolución) */}
        {columnType === 'atendiendo' && (
          <div className="w-full py-2 px-2.5 rounded-lg bg-primary-50/80 border border-primary-200/80 text-[11px] font-medium text-primary-800 flex items-center justify-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-center">En consulta con el especialista</span>
          </div>
        )}

        {/* Finalizados */}
        {columnType === 'finalizado' && (
          <div className="w-full flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ClipboardCheck className="w-4 h-4 text-emerald-600" strokeWidth={2} aria-hidden="true" />
              Atención Finalizada
            </span>
            {item.puntualidadEncuesta && (
              <span className="font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                ★ {item.puntualidadEncuesta}/5
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
