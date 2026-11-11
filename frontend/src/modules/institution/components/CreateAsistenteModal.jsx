import React, { useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { UserPlus, Hospital, Mail, AlertCircle } from 'lucide-react';
import { asistenteSchema } from '../../../shared/validation/schemas';
import { validateWithSchema, parseBackendError } from '../../../shared/validation/validateForm';

/**
 * Modal para dar de alta asistentes en la sede.
 * Regla de negocio estricta:
 * Pide Nombre, Apellido, DNI y Email.
 */
export const CreateAsistenteModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  defaultConsultorioCuit = null,
  adminConsultorioCuil = null,
  sedeNombre = null,
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cuil: '', // DNI o CUIL
    email: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

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
      asistenteSchema,
      formData
    );

    if (!isValid) {
      setErrors(validationErrors);
      setServerError(Object.values(validationErrors)[0]);
      return;
    }

    const payload = {
      cuil: sanitizedData.cuil,
      nombre: sanitizedData.nombre,
      apellido: sanitizedData.apellido,
      email: sanitizedData.email,
      telefono: '381-0000000',
      genero: 'Otro',
      fecNac: new Date('1995-05-15').toISOString(),
      consultorioCuit: defaultConsultorioCuit || null,
      adminConsultorioCuil: adminConsultorioCuil || null,
    };

    try {
      const success = await onSubmit(payload);
      if (success) {
        setFormData({
          nombre: '',
          apellido: '',
          cuil: '',
          email: '',
        });
        setErrors({});
        onClose();
      }
    } catch (err) {
      const parsed = parseBackendError(err, 'Error al registrar al asistente.');
      setServerError(parsed.message);
      if (parsed.isDuplicate) {
        setErrors((prev) => ({ ...prev, cuil: parsed.message }));
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Asistente"
      description="Registra un nuevo asistente operativo para la sede."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs sm:text-sm" noValidate>
        {/* Banner de Sede Asignada */}
        {sedeNombre && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
            <Hospital className="w-4 h-4 text-primary-600 shrink-0" />
            <span>
              Sede de asignación: <strong className="text-slate-900">{sedeNombre}</strong>
            </span>
          </div>
        )}

        {/* Alerta de Error del Servidor */}
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

        {/* 2. DNI y Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="DNI"
            name="cuil"
            value={formData.cuil}
            onChange={handleChange}
            placeholder="Ej: 38456789"
            error={errors.cuil}
            required
            disabled={isSubmitting}
            maxLength={11}
          />

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

        {/* Botones de Acción */}
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
            <UserPlus className="w-4 h-4" strokeWidth={2} />
            <span>Guardar Asistente</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
