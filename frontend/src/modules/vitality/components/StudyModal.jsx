import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Clock, FileText, Activity, AlertCircle, Sparkles, Layers } from 'lucide-react';
import { studySchema } from '../../../shared/validation/schemas';
import { validateWithSchema, parseBackendError } from '../../../shared/validation/validateForm';

/**
 * Modal para Alta y Modificación de Estudios Médicos en el Catálogo (Super Admin).
 * Define obligatoriamente la duración en minutos de cada estudio médico.
 */
export const StudyModal = ({
  isOpen,
  onClose,
  study,
  specialties = [],
  defaultSpecialtyId = null,
  onSubmit,
  isSubmitting,
}) => {
  const isEditing = Boolean(study?.id);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracion: 30,
    preparacion: '',
    especialidadId: defaultSpecialtyId || '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (study) {
      setFormData({
        nombre: study.nombre || '',
        descripcion: study.descripcion || '',
        duracion: study.duracion || 30,
        preparacion: study.preparacion || '',
        especialidadId: study.especialidadId || defaultSpecialtyId || '',
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        duracion: 30,
        preparacion: '',
        especialidadId: defaultSpecialtyId || specialties[0]?.id || '',
      });
    }
    setErrors({});
    setServerError(null);
  }, [study, defaultSpecialtyId, specialties, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const presetDurations = [15, 20, 30, 45, 60, 90];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    const { isValid, errors: validationErrors, data: sanitizedData } = validateWithSchema(
      studySchema,
      formData
    );

    if (!isValid) {
      setErrors(validationErrors);
      setServerError(Object.values(validationErrors)[0]);
      return;
    }

    try {
      await onSubmit({
        id: study?.id,
        nombre: sanitizedData.nombre,
        descripcion: sanitizedData.descripcion,
        duracion: sanitizedData.duracion,
        preparacion: sanitizedData.preparacion,
        especialidadId: sanitizedData.especialidadId,
      });
    } catch (err) {
      const parsed = parseBackendError(err, 'Error al guardar el estudio médico.');
      setServerError(parsed.message);
      setErrors((prev) => ({ ...prev, general: parsed.message }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modificar Estudio Médico' : 'Nuevo Estudio Médico'}
      description="Configura la duración en minutos requerida y las indicaciones previas para el turno del estudio."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs sm:text-sm">
        {/* Especialidad Asociada */}
        <div>
          <label htmlFor="estudio-esp" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
            Especialidad Médica Asociada <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
            <select
              id="estudio-esp"
              name="especialidadId"
              value={formData.especialidadId}
              onChange={handleChange}
              className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium ${
                errors.especialidadId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Selecciona una especialidad médica...</option>
              {specialties.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="min-h-[20px] mt-0.5 flex items-center">
            {errors.especialidadId && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.especialidadId}</p>}
          </div>
        </div>

        {/* Nombre del Estudio */}
        <div>
          <label htmlFor="estudio-nombre" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
            Nombre del Estudio o Práctica <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Activity className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
            <input
              id="estudio-nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Doppler Fetal, Resonancia Magnética o Ergometría"
              className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium ${
                errors.nombre ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
            />
          </div>
          <div className="min-h-[20px] mt-0.5 flex items-center">
            {errors.nombre && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.nombre}</p>}
          </div>
        </div>

        {/* Duración en Minutos (OBLIGATORIA) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="estudio-duracion" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider">
              Duración Estimada del Turno (Minutos) <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-primary-700 font-semibold bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
              Obligatorio para cálculo de agenda
            </span>
          </div>

          <div className="relative">
            <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
            <input
              id="estudio-duracion"
              name="duracion"
              type="number"
              min="5"
              max="240"
              step="5"
              value={formData.duracion}
              onChange={handleChange}
              placeholder="30"
              className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-semibold ${
                errors.duracion ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Accesos rápidos de duración habitual */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-[11px] text-slate-400 mr-1">Rápido:</span>
            {presetDurations.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, duracion: mins }))}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  Number(formData.duracion) === mins
                    ? 'bg-primary-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>

          <div className="min-h-[20px] mt-0.5 flex items-center">
            {errors.duracion && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.duracion}</p>}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="estudio-desc" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
            Descripción y Metodología <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="estudio-desc"
            name="descripcion"
            rows={2}
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Breve descripción del estudio y su objetivo clínico..."
            className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all resize-none ${
              errors.descripcion ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
            }`}
            disabled={isSubmitting}
          />
          <div className="min-h-[20px] mt-0.5 flex items-center">
            {errors.descripcion && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.descripcion}</p>}
          </div>
        </div>

        {/* Indicaciones de Preparación Previa */}
        <div>
          <label htmlFor="estudio-prep" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
            Preparación Previa Requerida (Paciente)
          </label>
          <div className="relative">
            <input
              id="estudio-prep"
              name="preparacion"
              type="text"
              value={formData.preparacion}
              onChange={handleChange}
              placeholder="Ej: Ayuno de 6 horas, ropa cómoda, vejiga llena, etc."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              disabled={isSubmitting}
            />
          </div>
          <div className="min-h-[20px] mt-0.5 flex items-center">
            {errors.preparacion && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.preparacion}</p>}
          </div>
        </div>

        {/* Acciones */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <div className="min-h-[20px] flex items-center text-xs text-rose-600 font-medium w-full sm:w-auto">
            {(errors.general || serverError) && (
              <span className="flex items-center gap-1 animate-in fade-in-0">
                <span aria-hidden="true">⚠</span> {errors.general || serverError}
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              className="gap-1.5"
            >
              <Sparkles className="w-4 h-4" strokeWidth={2} />
              <span>{isEditing ? 'Guardar Cambios' : 'Crear Estudio'}</span>
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
