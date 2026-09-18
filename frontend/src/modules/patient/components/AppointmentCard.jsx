import React from 'react';
import { Calendar, Clock, MapPin, User, Stethoscope, FileText, Ban, Star, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';

export const AppointmentCard = ({
  appointment,
  onCancel,
  onRate,
  isCancelling = false,
}) => {
  const {
    id,
    profesionalNombre,
    fecha,
    horaInicio,
    estado,
    tipo,
    cobertura,
    estudioNombre,
    puntualidadEncuesta,
  } = appointment;

  // Formatear Fecha
  const dateObj = new Date(fecha);
  const formattedDate = dateObj.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const horaStr = typeof horaInicio === 'string' ? horaInicio.substring(0, 5) : `${horaInicio}`;

  // Estado badge
  const getStatusBadge = () => {
    // 1=Solicitada, 2=Confirmada, 3=Atendida, 4=Ausente, 5=Cancelada
    switch (estado) {
      case 1:
      case 'Solicitada':
        return <Badge variant="warning">Solicitada</Badge>;
      case 2:
      case 'Confirmada':
        return <Badge variant="success">Confirmada</Badge>;
      case 3:
      case 'Atendida':
        return <Badge variant="primary">Atendida</Badge>;
      case 4:
      case 'Ausente':
        return <Badge variant="default">Ausente</Badge>;
      case 5:
      case 'Cancelada':
        return <Badge variant="danger">Cancelada</Badge>;
      default:
        return <Badge variant="default">{estado}</Badge>;
    }
  };

  const isFuture = estado === 1 || estado === 2 || estado === 'Solicitada' || estado === 'Confirmada';
  const isCompleted = estado === 3 || estado === 'Atendida';
  const isCancelled = estado === 5 || estado === 'Cancelada';

  return (
    <Card className={`transition-all duration-200 border-slate-200/80 ${isCancelled ? 'opacity-70 bg-slate-50/50' : 'hover:border-teal-200'}`}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            {/* Cabecera con Estado y Tipo */}
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge()}
              <span className="text-xs text-slate-500 font-medium">
                {tipo === 3 || tipo === 'Estudio' ? `Estudio: ${estudioNombre || 'Diagnóstico'}` : 'Consulta Médica'}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {cobertura === 2 || cobertura === 'ObraSocial' ? 'Obra Social' : 'Particular'}
              </span>
            </div>

            {/* Profesional */}
            <h3 className="text-lg font-bold font-heading text-slate-900">
              Dr. {profesionalNombre}
            </h3>

            {/* Fecha y Hora */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-teal-600" aria-hidden="true" />
                <span className="capitalize">{formattedDate}</span>
              </div>

              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-teal-600" aria-hidden="true" />
                <span>{horaStr} hs</span>
              </div>
            </div>
          </div>

          {/* Acciones Disponibles */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {/* Botón de Cancelar Cita (RN-01) */}
            {isFuture && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(id)}
                disabled={isCancelling}
                aria-label={`Cancelar cita con Dr. ${profesionalNombre}`}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 gap-1.5 text-xs"
              >
                <Ban className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isCancelling ? 'Cancelando...' : 'Cancelar Cita'}</span>
              </Button>
            )}

            {/* Botón de Calificar Atención (CuestionariosController) */}
            {isCompleted && !puntualidadEncuesta && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onRate(appointment)}
                aria-label={`Calificar atención de cita con Dr. ${profesionalNombre}`}
                className="gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>Calificar Atención</span>
              </Button>
            )}

            {/* Si ya fue calificada */}
            {isCompleted && puntualidadEncuesta && (
              <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>Calificada</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
