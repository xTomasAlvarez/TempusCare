import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Stethoscope, FileText, Sparkles } from 'lucide-react';
import { specialtySchema } from '../../../shared/validation/schemas';
import { validateWithSchema, parseBackendError } from '../../../shared/validation/validateForm';

/**
 * Modal para Alta y Modificación de Especialidades Médicas (Super Admin).
 */
export const SpecialtyModal = ({
  isOpen,
  onClose,
  specialty,
  onSubmit,
  isSubmitting,
}) => {
  const isEditing = Boolean(specialty?.id);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (specialty) {
      setFormData({
        nombre: specialty.nombre || '',
        descripcion: specialty.descripcion || '',
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
      });
    }
    setErrors({});
    setServerError(null);
  }, [specialty, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    const { isValid, errors: validationErrors, data: sanitizedData } = validateWithSchema(
      specialtySchema,
      formData
    );

    if (!isValid) {
      setErrors(validationErrors);
      setServerError(Object.values(validationErrors)[0]);
      return;
    }

    try {
      await onSubmit({
        id: specialty?.id,
        nombre: sanitizedData.nombre,
        descripcion: sanitizedData.descripcion,
      });
    } catch (err) {
      const parsed = parseBackendError(err, 'Error al guardar la especialidad médica.');
      setServerError(parsed.message);
      setErrors((prev) => ({ ...prev, general: parsed.message }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modificar Especialidad Médica' : 'Nueva Especialidad Médica'}
      description="Define las áreas y disciplinas médicas disponibles en la plataforma para los profesionales."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs sm:text-sm">
        {/* Nombre de la Especialidad */}
        <div>
          <label htmlFor="esp-nombre" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
            Nombre de la Especialidad <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
            <input
              id="esp-nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Neurología Infantil o Cardiología"
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

        {/* Descripción */}
        <div>
          <label htmlFor="esp-descripcion" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
            Descripción y Alcance Clínico <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <textarea
              id="esp-descripcion"
              name="descripcion"
              rows={3}
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe el alcance asistencial y enfoque clínico de la especialidad..."
              className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all resize-none ${
                errors.descripcion ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
            />
          </div>
          <div className="min-h-[20px] mt-0.5 flex items-center">
            {errors.descripcion && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.descripcion}</p>}
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
              <span>{isEditing ? 'Guardar Cambios' : 'Crear Especialidad'}</span>
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
