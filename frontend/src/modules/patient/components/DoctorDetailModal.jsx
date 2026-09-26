import React from 'react';
import { 
  Star, 
  Hospital, 
  Stethoscope, 
  ShieldPlus, 
  Microscope, 
  Clock, 
  BadgeCheck, 
  CalendarPlus, 
  ArrowRight,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';

/**
 * Modal de Detalle Completo del Profesional y Estudios Médicos
 * Acceso público: Puede ser visualizado por cualquier usuario (autenticado o invitado).
 */
export const DoctorDetailModal = ({
  isOpen,
  onClose,
  doctor,
  onBook,
}) => {
  if (!isOpen || !doctor) return null;

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
    instituciones = [],
  } = doctor;

  const fullName = `Dr(a). ${nombre} ${apellido}`;
  const displayScore = Number(puntuacion || 5.0).toFixed(1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={fullName}
      description={`Matrícula Profesional: ${matricula || 'N/A'}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 pt-2">
        {/* Cabecera del Profesional */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary-50/70 via-white to-slate-50 border border-primary-100/80">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white flex items-center justify-center font-heading font-bold text-xl shadow-xs">
                {nombre?.[0] || 'D'}{apellido?.[0] || 'M'}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
                <BadgeCheck className="w-4 h-4 text-primary-600" strokeWidth={2} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-heading font-bold text-slate-900 text-base sm:text-lg">
                  {fullName}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {especialidades.map((esp, idx) => (
                  <Badge key={idx} variant="primary" size="sm">
                    <Stethoscope className="w-3 h-3" strokeWidth={2} />
                    <span>{esp}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Puntuación */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-amber-50 text-amber-900 border border-amber-200/90 px-3 py-1.5 rounded-xl text-xs font-bold">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" strokeWidth={2} />
            <span>{displayScore} / 5.0</span>
          </div>
        </div>

        {/* Sección Crítica: Estudios Médicos que Realiza */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Microscope className="w-5 h-5 text-emerald-600" strokeWidth={2} />
            <h3 className="text-base font-bold font-heading text-slate-900">
              Estudios Médicos y Procedimientos
            </h3>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
              {estudios.length} {estudios.length === 1 ? 'estudio' : 'estudios'}
            </span>
          </div>

          {estudios && estudios.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {estudios.map((est, idx) => {
                const nombreEstudio = est.estudioNombre || est.nombre || `Estudio Médico #${idx + 1}`;
                const duracion = est.duracionTurno || 30;
                const precio = est.precioParticular;
                const coberturas = est.obrasSocialesAceptadas || [];

                return (
                  <div
                    key={est.id || idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-sm text-slate-900 leading-tight">
                        {nombreEstudio}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{duracion}m</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-600">
                      {precio > 0 ? (
                        <span className="font-semibold text-emerald-700">
                          Particular: ${Number(precio).toLocaleString('es-AR')}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          Consulta médica estándar
                        </span>
                      )}

                      {coberturas.length > 0 && (
                        <span className="text-[11px] text-slate-500 truncate max-w-[130px]" title={coberturas.join(', ')}>
                          Cobertura: {coberturas.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-500 space-y-1">
              <p className="font-medium text-slate-700">
                Atención clínica y diagnóstica general
              </p>
              <p>
                Este profesional realiza consultas clínicas presenciales en las sedes asignadas.
              </p>
            </div>
          )}
        </div>

        {/* Sedes y Obras Sociales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
          {/* Sedes / Consultorios */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Hospital className="w-3.5 h-3.5 text-primary-600" />
              <span>Sedes de Atención</span>
            </span>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-slate-600 space-y-1">
              {instituciones.length > 0 && (
                <p className="font-semibold text-primary-700">
                  {instituciones.join(' • ')}
                </p>
              )}
              <p className="text-slate-500">
                {consultorios.length > 0 ? consultorios.join(', ') : 'Consultorios TempusCare'}
              </p>
            </div>
          </div>

          {/* Obras Sociales */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <ShieldPlus className="w-3.5 h-3.5 text-primary-600" />
              <span>Coberturas Aceptadas</span>
            </span>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-slate-600 flex flex-wrap gap-1">
              {obrasSociales.length > 0 ? (
                obrasSociales.map((os, idx) => (
                  <Badge key={idx} variant="info" size="sm">
                    {os}
                  </Badge>
                ))
              ) : (
                <span className="text-slate-400">Atención Particular</span>
              )}
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200/80">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cerrar
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => onBook(doctor)}
            className="w-full sm:w-auto gap-2 shadow-sm font-semibold"
          >
            <CalendarPlus className="w-4 h-4" strokeWidth={2} />
            <span>Reservar Cita</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DoctorDetailModal;
