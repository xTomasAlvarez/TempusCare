import React from 'react';
import { Clock, Stethoscope, Ban, CheckCircle2, User, PhoneCall, ArrowRight } from 'lucide-react';
import { Badge } from '../../../shared/components/ui/Badge';

export const KanbanCard = ({
  item,
  columnType, // 'disponible' | 'espera' | 'atendiendo' | 'finalizado'
  onStartAttention,
  onFinishAttention,
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
            <Clock className="w-4 h-4 text-teal-600" aria-hidden="true" />
            <span>{horaInicioStr} {horaFinStr ? `– ${horaFinStr}` : ''} hs</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Disponible
          </span>
        </div>

        <div className="pt-1 flex items-center justify-between text-sm text-slate-500">
          <span>{item.consultorioNombre || 'Consultorio Central'}</span>
          <span className="text-xs text-teal-600 font-medium">Libre</span>
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
          ? 'border-teal-300 ring-2 ring-teal-500/20'
          : 'border-slate-200'
      }`}
    >
      {/* Hora Prominente y Badges */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-heading font-semibold text-base text-slate-900">
          <Clock className="w-4 h-4 text-teal-600" aria-hidden="true" />
          <span>{horaInicioStr} hs</span>
        </div>

        <div className="flex items-center gap-1.5">
          {isEstudio ? (
            <Badge variant="info" size="sm">Estudio</Badge>
          ) : (
            <Badge variant="primary" size="sm">Consulta</Badge>
          )}

          {columnType === 'espera' && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              En Espera
            </span>
          )}
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
              <span className="text-teal-700">{item.estudioNombre}</span>
            </>
          )}
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* En Sala de Espera -> Botón Primario Verde "Llamar a Consultorio" */}
        {columnType === 'espera' && (
          <>
            <button
              type="button"
              onClick={() => onStartAttention(item.id)}
              disabled={isActionLoading}
              tabIndex={0}
              aria-label={`Llamar a consultorio a ${patientName}`}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Stethoscope className="w-4 h-4" aria-hidden="true" />
              <span>Llamar a Consultorio</span>
            </button>

            <button
              type="button"
              onClick={() => onCancel(item.id)}
              disabled={isActionLoading}
              tabIndex={0}
              aria-label={`Cancelar cita de ${patientName}`}
              title="Cancelar cita y liberar turno"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <Ban className="w-4 h-4" aria-hidden="true" />
            </button>
          </>
        )}

        {/* Atendiéndose -> Finalizar Atención */}
        {columnType === 'atendiendo' && (
          <button
            type="button"
            onClick={() => onFinishAttention(item.id)}
            disabled={isActionLoading}
            tabIndex={0}
            aria-label={`Finalizar atención de ${patientName}`}
            className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>Finalizar Atención</span>
          </button>
        )}

        {/* Finalizados */}
        {columnType === 'finalizado' && (
          <div className="w-full flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
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
