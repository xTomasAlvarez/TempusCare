import React, { useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Stethoscope, Hospital, AlertCircle, Mail, UserPlus } from 'lucide-react';
import { profesionalSchema } from '../../../shared/validation/schemas';
import { validateWithSchema, parseBackendError } from '../../../shared/validation/validateForm';

/**
 * Modal para el Alta completa de un nuevo Médico / Profesional en la sede.
 * Regla de negocio estricta:
 * Pide Nombre, Apellido, CUIL, Email y Especialidad.
 * NO incluir selección de estudios u obras sociales (delegado al asistente).
 */
export const CreateProfesionalModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  especialidades = [],
  sedeNombre = '',
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cuil: '',
    email: '',
    especialidadId: '',
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
      profesionalSchema,
      formData
    );

    if (!isValid) {
      setErrors(validationErrors);
      setServerError(Object.values(validationErrors)[0]);
      return;
    }

    if (!formData.especialidadId) {
      setErrors((prev) => ({ ...prev, especialidadId: 'Debe seleccionar una especialidad médica principal.' }));
      setServerError('Debe seleccionar una especialidad médica.');
      return;
    }

    try {
      const cuilClean = sanitizedData.cuil;
      const matriculaGen = `MP-${cuilClean.length >= 6 ? cuilClean.slice(-6) : Math.floor(100000 + Math.random() * 900000)}`;

      const payload = {
        cuil: cuilClean,
        nombre: sanitizedData.nombre,
        apellido: sanitizedData.apellido,
        email: sanitizedData.email,
        matricula: matriculaGen,
        telefono: '381-0000000',
        genero: 'Otro',
        fecNac: new Date('1985-06-15').toISOString(),
        especialidadId: Number(formData.especialidadId),
        especialidadesIds: [Number(formData.especialidadId)],
      };

      const success = await onSubmit(payload);
      if (success) {
        setFormData({
          nombre: '',
          apellido: '',
          cuil: '',
          email: '',
          especialidadId: '',
        });
        setErrors({});
        onClose();
      }
    } catch (err) {
      const parsed = parseBackendError(err, 'Error al registrar el profesional.');
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
      title="Nuevo Médico"
      description="Registra un nuevo profesional médico para la sede."
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
            placeholder="Ej: Laura"
            error={errors.nombre}
            required
            disabled={isSubmitting}
          />

          <Input
            label="Apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            placeholder="Ej: González"
            error={errors.apellido}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* 2. CUIL y Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="CUIL"
            name="cuil"
            value={formData.cuil}
            onChange={handleChange}
            placeholder="11 dígitos (sin guiones)"
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
            placeholder="medico@hospital.com"
            error={errors.email}
            required
            disabled={isSubmitting}
            leadingIcon={<Mail className="w-4 h-4 text-primary-600" />}
          />
        </div>

        {/* 3. Especialidad Médica */}
        <div>
          <label htmlFor="prof-especialidad" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Especialidad <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl shadow-xs">
            <select
              id="prof-especialidad"
              name="especialidadId"
              value={formData.especialidadId}
              onChange={handleChange}
              className={`w-full h-10 px-3 rounded-xl border bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${
                errors.especialidadId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200/80'
              }`}
              disabled={isSubmitting}
            >
              <option value="">-- Seleccionar especialidad --</option>
              {especialidades.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="min-h-[18px] mt-0.5 flex items-center">
            {errors.especialidadId && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1 animate-in fade-in-0">
                <span aria-hidden="true">⚠</span>
                <span>{errors.especialidadId}</span>
              </p>
            )}
          </div>
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
            <span>Guardar Médico</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
