import React from 'react';
import { Badge } from '../../../shared/components/ui/Badge';
import {
  History,
  AlertTriangle,
  Heart,
  Pill,
  ShieldAlert,
  Phone,
  Calendar,
  UserCheck,
  Stethoscope,
  FileCheck2,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

/**
 * Panel Lateral: Línea de Tiempo (Timeline) de la Historia Clínica Unificada (RN-04).
 * Presenta antecedentes clínicos, alergias, grupo sanguíneo y evolución de citas/diagnósticos previos.
 */
export const PatientTimeline = ({
  clinicalHistory,
  pastAppointments = [],
  isLoading,
  currentAppointmentId,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="h-6 w-36 bg-slate-200 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Lista de observaciones registradas en la historia clínica unificada
  const observaciones = clinicalHistory?.observaciones || [];

  // Filtrar citas pasadas que no sean la consulta actual
  const priorAppointments = pastAppointments.filter(
    (cita) => cita.id !== currentAppointmentId
  );

  return (
    <div className="space-y-6">
      {/* Tarjeta de Antecedentes y Factores de Riesgo (RN-04) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <History className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-heading text-slate-900 leading-snug">
                Historia Clínica Unificada
              </h3>
              <p className="text-[11px] text-slate-400">
                {clinicalHistory?.id ? `Ficha N° ${clinicalHistory.id}` : 'Registro médico unificado'}
              </p>
            </div>
          </div>

          {clinicalHistory?.grupSang && (
            <Badge variant="primary" size="md" className="font-bold">
              Grupo {clinicalHistory.grupSang}
            </Badge>
          )}
        </div>

        {/* Alertas Críticas (Alergias y Patologías) */}
        <div className="grid grid-cols-1 gap-2.5">
          {clinicalHistory?.alergias ? (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs">
                <span className="font-bold">Alergias:</span> {clinicalHistory.alergias}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <span>Sin alergias conocidas registradas.</span>
            </div>
          )}

          {clinicalHistory?.enfermedadesCronicas && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
              <Heart className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs">
                <span className="font-bold">Enfermedad Crónica:</span> {clinicalHistory.enfermedadesCronicas}
              </div>
            </div>
          )}

          {clinicalHistory?.medicamentos && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900">
              <Pill className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs">
                <span className="font-bold">Medicación Habitual:</span> {clinicalHistory.medicamentos}
              </div>
            </div>
          )}

          {clinicalHistory?.nombreContacto && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">
                Contacto: <strong className="text-slate-900">{clinicalHistory.nombreContacto} {clinicalHistory.apellidoContacto}</strong> ({clinicalHistory.telefonoContacto})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Cronológico de Consultas y Diagnósticos */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
            Línea de Tiempo Médica
          </h4>
          <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
            {observaciones.length} Registros
          </span>
        </div>

        {observaciones.length === 0 && priorAppointments.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-medium text-slate-600">Sin historial médico previo</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Esta es la primera consulta registrada para este paciente en el sistema unificado.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {/* Observaciones registradas */}
            {observaciones.map((obs, idx) => (
              <div key={obs.id || idx} className="relative group">
                {/* Punto en el Timeline */}
                <div className="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-teal-600 shadow-xs flex items-center justify-center text-white" />

                <div className="bg-slate-50 group-hover:bg-teal-50/30 p-3.5 rounded-xl border border-slate-200/80 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 font-heading">
                      {obs.motivo || 'Evolución Médica'}
                    </span>
                    <Badge variant="primary" size="sm">
                      Consulta N° {obs.citaId || obs.id}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed mt-1">
                    {obs.detalle}
                  </p>

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-400">
                    <Stethoscope className="w-3 h-3 text-teal-600" />
                    <span>{obs.profesionalNombre || 'Profesional de la Red'}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Citas previas sin observación detallada aún */}
            {priorAppointments
              .filter((c) => !observaciones.some((o) => o.citaId === c.id))
              .map((cita) => (
                <div key={cita.id} className="relative group">
                  <div className="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-slate-400 shadow-xs" />

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800">
                        {cita.estudioNombre || 'Cita de Atención'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {cita.fecha ? new Date(cita.fecha).toLocaleDateString('es-AR') : 'Anterior'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Atendido por {cita.profesionalNombre || 'Médico tratante'}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
