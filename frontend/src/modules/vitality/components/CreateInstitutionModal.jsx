import React, { useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Building2, Mail, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';

/**
 * Modal para el Alta de una Nueva Institución Médica Cliente en Vitality (B2B).
 * Solicita CUIT, razón social, correo electrónico del administrador y plan de suscripción.
 */
export const CreateInstitutionModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    cuit: '',
    nombre: '',
    email: '',
    plan: 'Profesional',
  });

  const [errors, setErrors] = useState({});

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

  const validate = () => {
    const newErrors = {};
    if (!formData.cuit.trim()) newErrors.cuit = 'El CUIT de la institución es obligatorio.';
    if (!formData.nombre.trim()) newErrors.nombre = 'La razón social es obligatoria.';
    if (!formData.email.trim()) {
      newErrors.email = 'El correo del administrador es obligatorio.';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Ingrese un correo electrónico válido.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await onSubmit(formData);
    if (success) {
      setFormData({
        cuit: '',
        nombre: '',
        email: '',
        plan: 'Profesional',
      });
      setErrors({});
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dar de Alta Nueva Institución Médica"
      description="Registra un nuevo cliente B2B en el ecosistema SaaS de Tempus Care / Vitality."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs sm:text-sm">
        {/* Razón Social */}
        <div>
          <label htmlFor="nombre-inst" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
            Razón Social / Nombre de la Institución <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="nombre-inst"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Sanatorio Modelo S.A. o Hospital Privado"
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
              disabled={isSubmitting}
            />
          </div>
          {errors.nombre && <p className="text-[11px] text-rose-600 mt-1">{errors.nombre}</p>}
        </div>

        {/* CUIT y Correo de Administración */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cuit-inst" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              CUIT Institucional <span className="text-rose-500">*</span>
            </label>
            <input
              id="cuit-inst"
              name="cuit"
              type="text"
              value={formData.cuit}
              onChange={handleChange}
              placeholder="Ej: 30712345678"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-mono"
              disabled={isSubmitting}
            />
            {errors.cuit && <p className="text-[11px] text-rose-600 mt-1">{errors.cuit}</p>}
          </div>

          <div>
            <label htmlFor="email-inst" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Correo Electrónico Administrador <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="email-inst"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@clinica.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Plan de Suscripción */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-2">
            Plan de Suscripción B2B <span className="text-rose-500">*</span>
          </label>

          <div className="space-y-2">
            {plans.map((p) => {
              const isSelected = formData.plan === p.id;
              return (
                <label
                  key={p.id}
                  className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50/70 border-teal-400 ring-1 ring-teal-400 text-teal-950 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="plan"
                      value={p.id}
                      checked={isSelected}
                      onChange={handleChange}
                      className="w-4 h-4 text-teal-600 border-slate-300 focus:ring-teal-500 mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-heading text-sm">{p.name}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700">
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Aviso de aprovisionamiento de cuenta */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span>
            Se aprovisionará automáticamente el usuario con rol <strong>Institucion</strong> y contraseña temporal inicial.
          </span>
        </div>

        {/* Acciones */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
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
            <Sparkles className="w-4 h-4" />
            <span>Crear Institución</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
