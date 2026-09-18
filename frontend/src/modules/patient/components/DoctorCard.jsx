import React from 'react';
import { Star, MapPin, Calendar, CheckCircle2, Award, Stethoscope } from 'lucide-react';
import { Card, CardContent } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';

export const DoctorCard = ({
  doctor,
  onBook,
  onHover,
  isHighlighted = false,
}) => {
  const {
    cuil,
    nombre,
    apellido,
    matricula,
    puntuacion = 5.0,
    especialidades = [],
    obrasSociales = [],
    consultorios = [],
    estudios = [],
  } = doctor;

  const fullName = `Dr. ${nombre} ${apellido}`;
  const displayScore = Number(puntuacion || 5.0).toFixed(1);

  return (
    <Card
      onMouseEnter={() => onHover && onHover(cuil)}
      onMouseLeave={() => onHover && onHover(null)}
      className={`group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-teal-300 ${
        isHighlighted ? 'ring-2 ring-teal-500 border-teal-500 shadow-md' : 'border-slate-200/80'
      }`}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Avatar e Información Principal */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-heading font-bold text-xl sm:text-2xl shadow-sm">
                {nombre?.[0] || 'D'}{apellido?.[0] || 'M'}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-teal-600" aria-label="Médico verificado" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 group-hover:text-teal-700 transition-colors">
                  {fullName}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Mat. {matricula || 'N/A'}
                </span>
              </div>

              {/* Especialidades */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {especialidades.length > 0 ? (
                  especialidades.map((esp, idx) => (
                    <Badge key={idx} variant="primary" size="sm">
                      <Stethoscope className="w-3 h-3" aria-hidden="true" />
                      <span>{esp}</span>
                    </Badge>
                  ))
                ) : (
                  <Badge variant="default" size="sm">Medicina General</Badge>
                )}
              </div>

              {/* Puntuación Calculada */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
                  <span>{displayScore}</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Excelente atención verificada
                </span>
              </div>
            </div>
          </div>

          {/* Botón de Acción Principal */}
          <div className="sm:self-center shrink-0 w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              onClick={() => onBook(doctor)}
              tabIndex={0}
              aria-label={`Reservar cita con ${fullName}`}
              className="w-full sm:w-auto shadow-xs gap-2"
            >
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span>Reservar Cita</span>
            </Button>
          </div>
        </div>

        {/* Detalles Adicionales: Consultorios y Obras Sociales */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Consultorios / Ubicaciones */}
          <div className="flex items-start gap-2 text-slate-600">
            <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-semibold text-slate-700 block">Atención en:</span>
              <p className="text-slate-500 line-clamp-1">
                {consultorios.length > 0 ? consultorios.join(', ') : 'Consultorios TempusCare'}
              </p>
            </div>
          </div>

          {/* Obras Sociales Aceptadas */}
          <div>
            <span className="font-semibold text-slate-700 block mb-1">Obras Sociales / Prepagas:</span>
            <div className="flex flex-wrap gap-1">
              {obrasSociales.length > 0 ? (
                obrasSociales.slice(0, 3).map((os, idx) => (
                  <Badge key={idx} variant="info" size="sm">
                    {os}
                  </Badge>
                ))
              ) : (
                <span className="text-slate-400">Atención Particular</span>
              )}
              {obrasSociales.length > 3 && (
                <span className="text-[11px] text-slate-400 self-center">
                  +{obrasSociales.length - 3} más
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Estudios si aplica */}
        {estudios && estudios.length > 0 && (
          <div className="mt-3 bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center gap-2 text-xs text-slate-600">
            <Award className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span className="font-medium text-slate-700">Realiza estudios:</span>
            <span className="text-slate-500 truncate">
              {estudios.map((e) => e.estudioNombre).join(' • ')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
