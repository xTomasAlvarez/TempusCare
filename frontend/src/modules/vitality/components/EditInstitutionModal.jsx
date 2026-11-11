import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Hospital, Mail, Hash, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { updateInstitutionSchema } from '../../../shared/validation/schemas';
import { validateWithSchema, parseBackendError } from '../../../shared/validation/validateForm';

/**
 * Modal para la Modificación de una Institución Médica en Vitality.
 * Permite actualizar datos críticos como el Email de contacto y cambiar el Plan de Suscripción asignado.
 */
export const EditInstitutionModal = ({
  isOpen,
  onClose,
  institution,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    id: 0,
    cuit: '',
    nombre: '',
    email: '',
    plan: 'Profesional',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (institution) {
      setFormData({
        id: institution.id || 0,
        cuit: institution.cuit || '',
        nombre: institution.nombre || '',
        email: institution.email || '',
        plan: institution.plan || 'Profesional',
      });
      setErrors({});
      setServerError(null);
    }
  }, [institution, isOpen]);

  const plans = [
    {
      id: 'Starter',
      name: 'Starter / Básico',
      description: 'Hasta 2 sedes físicas y 5 médicos.',
      badge: 'Básico',
    },
    {
      id: 'Profesional',
      name: 'Profesional / Pro',
      description: 'Hasta 10 sedes, agenda multi-consultorio y soporte prioritario.',
      badge: 'Popular',
    },
    {
      id: 'Enterprise',
      name: 'Corporativo / Enterprise',
      description: 'Sedes y personal ilimitado, analíticas SaaS y SLA 99.9%.',
      badge: 'Completo',
    },
  ];

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
      updateInstitutionSchema,
      formData
    );

    if (!isValid) {
      setErrors(validationErrors);
      setServerError(Object.values(validationErrors)[0]);
      return;
    }

    try {
      const success = await onSubmit(sanitizedData);
      if (success) {
        onClose();
      }
    } catch (err) {
      const parsed = parseBackendError(err, 'Error al actualizar la institución.');
      setServerError(parsed.message);
      setErrors((prev) => ({ ...prev, general: parsed.message }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Institución Médica"
      description={`Actualiza la configuración comercial, email y plan contratado para ${institution?.nombre || 'la institución'}.`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 font-sans text-xs sm:text-sm">
        {/* Grilla de Campos Principales (Razón Social, CUIT, Correo) perfectamente alineados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start">
          {/* Razón Social */}
          <div className="col-span-1 sm:col-span-2">
            <label htmlFor="edit-nombre-inst" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1 truncate">
              Razón Social / Nombre <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Hospital className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
              <input
                id="edit-nombre-inst"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Sanatorio Modelo S.A."
                className={`w-full h-10 pl-9 pr-3.5 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium ${
                  errors.nombre ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.nombre && (
              <p className="text-[11px] text-rose-600 truncate mt-1 animate-in fade-in-0">{errors.nombre}</p>
            )}
          </div>

          {/* CUIT (No editable) */}
          <div className="col-span-1">
            <label htmlFor="edit-cuit-inst" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1 truncate">
              CUIT Institucional
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
              <input
                id="edit-cuit-inst"
                name="cuit"
                type="text"
                value={formData.cuit}
                readOnly
                className="w-full h-10 pl-9 pr-3.5 py-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl font-mono cursor-not-allowed select-all"
              />
            </div>
          </div>

          {/* Correo de Contacto Crítico */}
          <div className="col-span-1">
            <label htmlFor="edit-email-inst" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1 truncate">
              Correo del Administrador <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
              <input
                id="edit-email-inst"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@institucion.com"
                className={`w-full h-10 pl-9 pr-3.5 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all ${
                  errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-600 truncate mt-1 animate-in fade-in-0">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Plan de Suscripción Asignado */}
        <div className="pt-2.5 border-t border-slate-100">
          <label className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-2">
            Plan de Suscripción Asignado <span className="text-rose-500">*</span>
          </label>

          <div className="space-y-2">
            {plans.map((p) => {
              const isSelected = formData.plan === p.id;
              return (
                <label
                  key={p.id}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary-50/70 border-primary-400 ring-1 ring-primary-400 text-primary-950 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="plan"
                      value={p.id}
                      checked={isSelected}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-heading text-xs sm:text-sm">{p.name}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700">
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{p.description}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0" strokeWidth={2} />
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Acciones del formulario */}
        <div className="pt-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex items-center text-xs text-rose-600 font-medium w-full sm:w-auto">
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
              <span>Guardar Cambios</span>
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
