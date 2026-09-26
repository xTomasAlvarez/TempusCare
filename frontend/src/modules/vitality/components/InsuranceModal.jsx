import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { ShieldPlus, FileText, Sparkles } from 'lucide-react';
import { insuranceSchema } from '../../../shared/validation/schemas';
import { validateWithSchema, parseBackendError } from '../../../shared/validation/validateForm';

/**
 * Modal para Alta y Modificación de Obras Sociales y Prepagas en el Catálogo Global (Super Admin).
 */
export const InsuranceModal = ({
  isOpen,
  onClose,
  insurance,
  onSubmit,
  isSubmitting,
}) => {
  const isEditing = Boolean(insurance?.id);

  const [formData, setFormData] = useState({
    nombre: '',
    catalogo: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (insurance) {
      setFormData({
        nombre: insurance.nombre || '',
        catalogo: insurance.catalogo || '',
      });
    } else {
      setFormData({
        nombre: '',
        catalogo: '',
      });
    }
    setErrors({});
    setServerError(null);
  }, [insurance, isOpen]);

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
      insuranceSchema,
      formData
    );

    if (!isValid) {
      setErrors(validationErrors);
      setServerError(Object.values(validationErrors)[0]);
      return;
    }

    try {
      await onSubmit({
        id: insurance?.id,
        nombre: sanitizedData.nombre,
        catalogo: sanitizedData.catalogo,
      });
    } catch (err) {
      const parsed = parseBackendError(err, 'Error al guardar la obra social.');
      setServerError(parsed.message);
      setErrors((prev) => ({ ...prev, general: parsed.message }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modificar Obra Social / Prepaga' : 'Nueva Obra Social / Prepaga'}
      description="Registra o actualiza la información y alcance de las entidades de cobertura médica aceptadas."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs sm:text-sm">
        {/* Nombre de la Obra Social */}
        <div>
          <label htmlFor="os-nombre" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
            Nombre de la Obra Social o Prepaga <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <ShieldPlus className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
            <input
              id="os-nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: OSDE, Swiss Medical, PAMI o Subsidio de Salud"
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

        {/* Catálogo / Detalle de Cobertura */}
        <div>
          <label htmlFor="os-catalogo" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
            Catálogo y Detalle de Cobertura <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <textarea
              id="os-catalogo"
              name="catalogo"
              rows={3}
              value={formData.catalogo}
              onChange={handleChange}
              placeholder="Ej: Planes 210, 310 y 410, cobertura provincial Tucumán o convenio nacional..."
              className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all resize-none ${
                errors.catalogo ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
            />
          </div>
          <div className="min-h-[20px] mt-0.5 flex items-center">
            {errors.catalogo && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.catalogo}</p>}
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
              <span>{isEditing ? 'Guardar Cambios' : 'Registrar Obra Social'}</span>
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
