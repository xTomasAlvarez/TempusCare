import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { CheckCircle2, Hospital, Mail, AlertCircle } from 'lucide-react';

/**
 * Modal para modificar los datos de un Asistente en la sede.
 * Regla de negocio estricta:
 * Pide Nombre, Apellido, DNI y Email.
 */
export const EditAsistenteModal = ({
  isOpen,
  onClose,
  asistente,
  onSubmit,
  isSubmitting,
  sedeNombre = '',
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (asistente) {
      setFormData({
        nombre: asistente.nombre || '',
        apellido: asistente.apellido || '',
        email: asistente.email || '',
      });
      setErrors({});
      setServerError(null);
    }
  }, [asistente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!asistente) return;
    setServerError(null);

    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio.';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es obligatorio.';
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Ingresa un correo electrónico válido.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        cuil: asistente.cuil,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        fecNac: asistente.fechaNacimiento
          ? new Date(asistente.fechaNacimiento).toISOString()
          : new Date('1995-05-15').toISOString(),
        telefono: asistente.telefono || '381-0000000',
        genero: asistente.genero || 'Otro',
        institucionId: asistente.institucionId || null,
        consultorioCuit: asistente.consultorioCuit || null,
        adminConsultorioCuil: asistente.adminConsultorioCuil || null,
      };

      const success = await onSubmit(asistente.cuil, payload);
      if (success) {
        onClose();
      }
    } catch (err) {
      setServerError(err.message || 'Error al modificar los datos del asistente.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Asistente"
      description={`Modifica los datos del asistente operativo asignado a "${sedeNombre || 'la sede'}".`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs sm:text-sm" noValidate>
        {/* Banner de Sede Física */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
          <Hospital className="w-4 h-4 text-primary-600 shrink-0" />
          <span>
            Sede asignada: <strong className="text-slate-900">{sedeNombre || 'Sede Actual'}</strong>
          </span>
        </div>

        {/* Alerta de Error */}
        {serverError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* 1. Nombre y Apellido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: Luciana"
            error={errors.nombre}
            required
            disabled={isSubmitting}
          />

          <Input
            label="Apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            placeholder="Ej: Herrera"
            error={errors.apellido}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* 2. DNI (inmutable) y Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              DNI
            </label>
            <input
              type="text"
              value={asistente?.cuil || ''}
              disabled
              className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-xs sm:text-sm text-slate-500 cursor-not-allowed select-none"
            />
          </div>

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="asistente@hospital.com"
            error={errors.email}
            required
            disabled={isSubmitting}
            leadingIcon={<Mail className="w-4 h-4 text-primary-600" />}
          />
        </div>

        {/* Acciones */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
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
            className="gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
            <span>Guardar Cambios</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
