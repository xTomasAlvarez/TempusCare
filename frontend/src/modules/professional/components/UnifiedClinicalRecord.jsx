import React from 'react';
import { useClinicalRecord } from '../hooks/useClinicalRecord';
import { PatientTimeline } from './PatientTimeline';
import { ClinicalEvolutionEditor } from './ClinicalEvolutionEditor';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { ArrowLeft, User, Clock, Calendar, AlertCircle } from 'lucide-react';

/**
 * Ficha Clínica Unificada (Atención Médica):
 * Divide la pantalla en dos:
 * - Panel lateral: Timeline con antecedentes, citas y diagnósticos previos (HistoriasClinicasController).
 * - Panel principal: Editor de texto limpio y minimalista para registrar evolución actual (ObservacionesController, RN-04).
 */
export const UnifiedClinicalRecord = ({
  appointment,
  onBack,
  onAppointmentUpdated,
}) => {
  const {
    clinicalHistory,
    pastAppointments,
    isLoading,
    isSaving,
    isSaved,
    error,
    motivo,
    setMotivo,
    detalle,
    setDetalle,
    markAsAttended,
    setMarkAsAttended,
    saveEvolution,
  } = useClinicalRecord(appointment, onAppointmentUpdated);

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    if (typeof timeStr === 'string') {
      const parts = timeStr.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  };

  return (
    <div className="space-y-6">
      {/* Barra de Navegación y Encabezado del Paciente */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="gap-2 text-slate-700 hover:text-slate-900 flex-shrink-0"
            aria-label="Volver a la agenda diaria"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Volver a Agenda</span>
          </Button>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold font-heading text-slate-900">
                {appointment.pacienteNombre}
              </h2>
              {appointment.estado === 3 ? (
                <Badge variant="success">Consulta Atendida</Badge>
              ) : (
                <Badge variant="primary">En Atención</Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 font-mono">
                <User className="w-3.5 h-3.5 text-slate-400" />
                CUIL: {appointment.pacienteCuil}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Horario: {formatTime(appointment.horaInicio)} - {formatTime(appointment.horaFin)}
              </span>
              {appointment.estudioNombre && (
                <>
                  <span>•</span>
                  <span className="font-medium text-teal-700">
                    {appointment.estudioNombre}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Pantalla Dividida en Dos Paneles (Split-Screen) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Panel Lateral: Línea de Tiempo e Historia Clínica Unificada */}
        <div className="lg:col-span-5 xl:col-span-4 order-2 lg:order-1">
          <PatientTimeline
            clinicalHistory={clinicalHistory}
            pastAppointments={pastAppointments}
            isLoading={isLoading}
            currentAppointmentId={appointment.id}
          />
        </div>

        {/* Panel Principal: Editor de Evolución de la Consulta Actual (RN-04) */}
        <div className="lg:col-span-7 xl:col-span-8 order-1 lg:order-2">
          <ClinicalEvolutionEditor
            appointment={appointment}
            motivo={motivo}
            setMotivo={setMotivo}
            detalle={detalle}
            setDetalle={setDetalle}
            markAsAttended={markAsAttended}
            setMarkAsAttended={setMarkAsAttended}
            isSaving={isSaving}
            isSaved={isSaved}
            onSave={saveEvolution}
          />
        </div>
      </div>
    </div>
  );
};
