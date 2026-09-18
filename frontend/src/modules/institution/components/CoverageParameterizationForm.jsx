import React from 'react';
import { useCoverageParameterization } from '../hooks/useCoverageParameterization';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import {
  Shield,
  Stethoscope,
  FileCheck2,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit3,
  CheckSquare,
  Square,
  Building2,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

/**
 * Formulario Avanzado de Parametrización de Cobertura B2B (Cumplimiento Estricto de la RN-02).
 * Selects dependientes: Profesional -> Estudio -> Mapeo ternario de Obras Sociales.
 */
export const CoverageParameterizationForm = () => {
  const {
    profesionales,
    estudios,
    obrasSociales,
    selectedDoctorCuil,
    setSelectedDoctorCuil,
    selectedDoctor,
    doctorStudies,
    selectedEstudioId,
    setSelectedEstudioId,
    existingMapping,
    duracionTurno,
    setDuracionTurno,
    precioParticular,
    setPrecioParticular,
    selectedObrasSocialesIds,
    toggleObraSocial,
    selectAllObrasSociales,
    clearAllObrasSociales,
    isLoadingCatalogs,
    isLoadingStudies,
    isSubmitting,
    saveParameterization,
    removeDoctorStudy,
  } = useCoverageParameterization();

  if (isLoadingCatalogs) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 animate-pulse">
        <div className="h-6 w-56 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-20 bg-slate-100 rounded-xl" />
          <div className="h-20 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  const durationPresets = [15, 20, 30, 45, 60];

  return (
    <div className="space-y-6">
      {/* Formulario Principal de Configuración */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" aria-hidden="true" />
              Parametrización de Cobertura y Estudios (RN-02)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configura los estudios médicos que realiza cada profesional y define qué obras sociales aplican exactamente a esa combinación.
            </p>
          </div>

          <Badge variant="primary" size="sm" className="self-start sm:self-auto font-mono">
            RN-02 Cobertura B2B
          </Badge>
        </div>

        {/* Selects Dependientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Selección de Profesional */}
          <div>
            <label
              htmlFor="select-profesional"
              className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1.5"
            >
              1. Seleccionar Profesional Médico <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="select-profesional"
                value={selectedDoctorCuil}
                onChange={(e) => {
                  setSelectedDoctorCuil(e.target.value);
                  setSelectedEstudioId('');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-900"
                disabled={isSubmitting}
              >
                {profesionales.map((p) => (
                  <option key={p.cuil} value={p.cuil}>
                    Dr./Dra. {p.nombre} {p.apellido} — {p.especialidades?.join(', ') || 'Medicina General'} (CUIL: {p.cuil})
                  </option>
                ))}
              </select>
            </div>

            {selectedDoctor && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Matrícula: {selectedDoctor.matricula}</span>
                <span>•</span>
                <span>{selectedDoctor.especialidades?.length || 0} especialidades</span>
                <span>•</span>
                <span className="text-teal-700 font-medium">{doctorStudies.length} estudios activos</span>
              </div>
            )}
          </div>

          {/* 2. Selección de Estudio (Dependiente) */}
          <div>
            <label
              htmlFor="select-estudio"
              className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1.5"
            >
              2. Estudio Médico a Parametrizar <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-estudio"
              value={selectedEstudioId}
              onChange={(e) => setSelectedEstudioId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-900"
              disabled={isSubmitting || !selectedDoctorCuil}
            >
              <option value="">-- Seleccionar estudio del catálogo --</option>
              {estudios.map((est) => {
                const isAlreadyAssigned = doctorStudies.some((pe) => pe.estudioId === est.id);
                return (
                  <option key={est.id} value={est.id}>
                    {est.nombre} {isAlreadyAssigned ? '(Ya configurado - Modificar)' : ''}
                  </option>
                );
              })}
            </select>

            <p className="text-[11px] text-slate-400 mt-1">
              Catálogo de estudios disponibles para la institución.
            </p>
          </div>
        </div>

        {/* Alerta de combinación ya existente (Manejo amigable de conflictos) */}
        {existingMapping && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 animate-in fade-in-0 duration-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-bold font-heading">Estudio Previamente Parametrizado</p>
              <p className="mt-0.5 text-amber-800">
                Esta combinación ya existe para este profesional ({existingMapping.duracionTurno} min, ${existingMapping.precioParticular}). Al guardar, se actualizarán los parámetros y el mapeo de obras sociales exacto sin duplicar registros.
              </p>
            </div>
          </div>
        )}

        {/* Parámetros Operativos del Turno */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1.5">
              Duración del Turno (Minutos) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={duracionTurno}
                  onChange={(e) => setDuracionTurno(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white font-medium"
                  disabled={isSubmitting}
                />
              </div>

              {/* Botones rápidos de duración */}
              <div className="flex items-center gap-1">
                {durationPresets.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuracionTurno(mins)}
                    className={cn(
                      'px-2 py-1.5 rounded-lg text-xs font-medium transition-colors',
                      duracionTurno === mins
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="precio-particular"
              className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1.5"
            >
              Precio Particular / Arancel ($)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="precio-particular"
                type="number"
                min="0"
                step="500"
                value={precioParticular}
                onChange={(e) => setPrecioParticular(e.target.value)}
                placeholder="Ej: 18000 (0 para sin arancel)"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white font-medium"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* 3. Mapeo Exacto de Obras Sociales (RN-02) */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider">
                3. Obras Sociales Aceptadas para esta combinación (RN-02)
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Selecciona las entidades que cubren este estudio específico con este profesional.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllObrasSociales}
                className="text-xs text-teal-600 hover:text-teal-800 font-medium transition-colors"
              >
                Seleccionar todas
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={clearAllObrasSociales}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
              >
                Deseleccionar todas
              </button>
            </div>
          </div>

          {/* Grid de Selección Interactiva */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {obrasSociales.map((os) => {
              const isSelected = selectedObrasSocialesIds.includes(os.id);
              return (
                <button
                  key={os.id}
                  type="button"
                  onClick={() => toggleObraSocial(os.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200',
                    isSelected
                      ? 'bg-teal-50/70 border-teal-300 text-teal-950 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200 text-slate-700'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span className="text-xs sm:text-sm font-semibold">{os.nombre}</span>
                  </div>

                  {isSelected && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-600 text-white px-1.5 py-0.5 rounded">
                      Cubre
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedObrasSocialesIds.length === 0 && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>
                Sin obras sociales seleccionadas: El estudio se agendará exclusivamente bajo cobertura <strong>Particular</strong>.
              </span>
            </div>
          )}
        </div>

        {/* Botón de Guardado */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={saveParameterization}
            isLoading={isSubmitting}
            disabled={!selectedDoctorCuil || !selectedEstudioId}
            className="gap-2 text-xs font-semibold px-6"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>
              {existingMapping ? 'Actualizar Parametrización (RN-02)' : 'Guardar Parametrización (RN-02)'}
            </span>
          </Button>
        </div>
      </div>

      {/* Tabla de Estudios y Coberturas Actuales del Profesional */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-sm sm:text-base font-bold font-heading text-slate-900 leading-snug">
              Estudios Parametrizados — Dr./Dra. {selectedDoctor?.nombre} {selectedDoctor?.apellido}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Configuraciones vigentes de estudios y obras sociales aceptadas para este médico.
            </p>
          </div>

          <Badge variant="primary" size="sm">
            {doctorStudies.length} Estudios
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 font-heading">
                <th className="py-3 px-4 font-semibold">Estudio Médico</th>
                <th className="py-3 px-4 font-semibold">Duración</th>
                <th className="py-3 px-4 font-semibold">Precio Particular</th>
                <th className="py-3 px-4 font-semibold">Obras Sociales Aceptadas (RN-02)</th>
                <th className="py-3 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-sans">
              {isLoadingStudies ? (
                [1, 2].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                    </td>
                  </tr>
                ))
              ) : doctorStudies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-slate-400 text-xs">
                    El profesional no tiene estudios ni coberturas parametrizadas aún. Utiliza el formulario superior para configurarlos.
                  </td>
                </tr>
              ) : (
                doctorStudies.map((pe) => (
                  <tr key={pe.id || pe.estudioId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-heading">
                      {pe.estudioNombre}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        {pe.duracionTurno} min
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono">
                      ${pe.precioParticular ? Number(pe.precioParticular).toLocaleString('es-AR') : '0'}
                    </td>
                    <td className="py-3.5 px-4">
                      {pe.obrasSocialesAceptadas?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {pe.obrasSocialesAceptadas.map((osName, idx) => (
                            <Badge key={idx} variant="primary" size="sm">
                              {osName}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <Badge variant="indigo" size="sm">
                          Particular Únicamente
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedEstudioId(String(pe.estudioId))}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                          title="Cargar en formulario para editar"
                          aria-label={`Editar estudio ${pe.estudioNombre}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeDoctorStudy(pe.estudioId, pe.estudioNombre)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Desvincular estudio"
                          aria-label={`Desvincular estudio ${pe.estudioNombre}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
