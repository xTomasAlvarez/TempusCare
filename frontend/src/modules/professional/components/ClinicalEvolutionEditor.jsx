import React from 'react';
import { Button } from '../../../shared/components/ui/Button';
import {
  FileEdit,
  Save,
  CheckCircle2,
  Sparkles,
  ClipboardList,
  AlertCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

/**
 * Panel Principal: Editor de Evolución Clínica Minimalista (RN-04).
 * Permite registrar la anamnesis, examen físico, diagnóstico y plan terapéutico
 * que se persiste en ObservacionesController.
 */
export const ClinicalEvolutionEditor = ({
  appointment,
  motivo,
  setMotivo,
  detalle,
  setDetalle,
  markAsAttended,
  setMarkAsAttended,
  isSaving,
  isSaved,
  onSave,
}) => {
  const insertTemplate = (type) => {
    let template = '';
    switch (type) {
      case 'soap':
        template =
`[SUBJETIVO / MOTIVO DE CONSULTA]
Paciente refiere: 

[OBJETIVO / EXAMEN FÍSICO]
Signos vitales: TA:   /   mmHg | FC:   lpm | Temp:   °C
Examen físico: 

[EVALUACIÓN / DIAGNÓSTICO]
Diagnóstico presuntivo / confirmado: 

[PLAN TERAPÉUTICO / INDICACIONES]
1. Medicación: 
2. Estudios solicitados: 
3. Pautas de alarma y próxima consulta: `;
        break;
      case 'control':
        template =
`Consulta de control evolutivo.
Evolución clínica favorable.
Se mantienen indicaciones previas y se programa control en 30 días.`;
        break;
      default:
        break;
    }

    if (template) {
      setDetalle((prev) => (prev ? `${prev}\n\n${template}` : template));
    }
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
      {/* Encabezado del Editor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-teal-600" aria-hidden="true" />
            Evolución de la Consulta Médica Actual
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro vinculante a la Historia Clínica Unificada del paciente (RN-04).
          </p>
        </div>

        {/* Plantillas Rápidas */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden md:inline">
            Estructuras:
          </span>
          <button
            type="button"
            onClick={() => insertTemplate('soap')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
            title="Insertar estructura médica SOAP (Subjetivo, Objetivo, Evaluación, Plan)"
          >
            <ClipboardList className="w-3.5 h-3.5 text-teal-600" />
            Estructura SOAP
          </button>
          <button
            type="button"
            onClick={() => insertTemplate('control')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
            title="Insertar plantilla de control rápido"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Control Rápido
          </button>
        </div>
      </div>

      {/* Estado si ya fue guardada */}
      {isSaved && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs animate-in fade-in-0 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            Esta consulta ya cuenta con evolución registrada en la historia clínica del paciente. Puedes seguir añadiendo notas adicionales si es necesario.
          </span>
        </div>
      )}

      {/* Formulario Minimalista */}
      <div className="space-y-4">
        {/* Motivo o Diagnóstico Principal */}
        <div>
          <label
            htmlFor="motivo-consulta"
            className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1.5"
          >
            Motivo de Consulta / Diagnóstico Principal <span className="text-rose-500">*</span>
          </label>
          <input
            id="motivo-consulta"
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej: Chequeo cardiovascular semestral, Síntomas de faringitis..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-sans"
            disabled={isSaving}
          />
        </div>

        {/* Editor de Texto Minimalista para Evolución Médica */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="detalle-evolucion"
              className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider"
            >
              Notas de Evolución y Tratamiento <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {detalle.length} caracteres
            </span>
          </div>

          <textarea
            id="detalle-evolucion"
            rows={12}
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            placeholder="Escriba aquí los hallazgos clínicos, anamnesis del paciente, examen físico realizado, prescripción médica y pautas acordadas..."
            className="w-full p-4 text-sm bg-slate-50/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-sans resize-y leading-relaxed text-slate-800"
            disabled={isSaving}
          />
        </div>

        {/* Opciones de Cierre de Consulta */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-slate-700">
            <input
              type="checkbox"
              checked={markAsAttended}
              onChange={(e) => setMarkAsAttended(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              disabled={isSaving}
            />
            <span>
              Marcar cita como <strong>Atendida</strong> y finalizar jornada de consulta
            </span>
          </label>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setMotivo('');
                setDetalle('');
              }}
              disabled={isSaving || (!motivo && !detalle)}
              className="text-xs text-slate-500"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpiar
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onSave}
              isLoading={isSaving}
              className="gap-2 text-xs font-semibold px-5"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Evolución Clínica'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
