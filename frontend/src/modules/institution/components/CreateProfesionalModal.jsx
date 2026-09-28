import React, { useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Stethoscope, Hospital, AlertCircle, Award, Phone, Calendar, UserPlus } from 'lucide-react';
import { profesionalSchema } from '../../../shared/validation/schemas';
import { validateWithSchema, parseBackendError } from '../../../shared/validation/validateForm';

/**
 * Modal para el Alta completa de un nuevo Médico / Profesional en la sede.
 * Regla RBAC: El Administrador de Sede solo gestiona cuentas e identidad profesional
 * (Nombre, Apellido, CUIL, Matrícula, Especialidad, Contacto), sin parametrizaciones médicas.
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
    cuil: '',
    nombre: '',
    apellido: '',
    matricula: '',
    telefono: '',
    especialidadId: '',
    genero: 'Otro',
    fecNac: '1985-06-15',
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
      const payload = {
        ...formData,
        ...sanitizedData,
        especialidadId: Number(formData.especialidadId),
        especialidadesIds: [Number(formData.especialidadId)],
      };

      const success = await onSubmit(payload);
      if (success) {
        setFormData({
          cuil: '',
          nombre: '',
          apellido: '',
          matricula: '',
          telefono: '',
          especialidadId: '',
          genero: 'Otro',
          fecNac: '1985-06-15',
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
      title="Dar de Alta Médico"
      description="Registra la cuenta e identidad profesional del médico para habilitarlo en la sede."
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

        {/* 1. Datos Personales */}
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

        {/* 2. Identificación Profesional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="CUIL / CUIT"
            name="cuil"
            value={formData.cuil}
            onChange={handleChange}
            placeholder="11 dígitos (ej: 20334445556)"
            error={errors.cuil}
            required
            disabled={isSubmitting}
            maxLength={11}
          />

          <Input
            label="Matrícula Profesional"
            name="matricula"
            value={formData.matricula}
            onChange={handleChange}
            placeholder="Ej: MP-4521"
            error={errors.matricula}
            required
            disabled={isSubmitting}
            leadingIcon={<Award className="w-4 h-4 text-primary-600" />}
          />
        </div>

        {/* 3. Especialidad Médica Principal */}
        <div>
          <label htmlFor="prof-especialidad" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Especialidad Médica Principal <span className="text-rose-500">*</span>
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

        {/* 4. Teléfono y Género */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Teléfono de Contacto"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Ej: 381 4112233"
            error={errors.telefono}
            required
            disabled={isSubmitting}
            leadingIcon={<Phone className="w-4 h-4 text-primary-600" />}
          />

          <div>
            <label htmlFor="prof-genero" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Género
            </label>
            <select
              id="prof-genero"
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-xl border border-slate-200/80 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              disabled={isSubmitting}
            >
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro / Prefiero no decir</option>
            </select>
          </div>
        </div>

        {/* 5. Fecha de Nacimiento */}
        <div>
          <Input
            label="Fecha de Nacimiento"
            type="date"
            name="fecNac"
            value={formData.fecNac}
            onChange={handleChange}
            error={errors.fecNac}
            required
            disabled={isSubmitting}
            leadingIcon={<Calendar className="w-4 h-4 text-primary-600" />}
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
            <span>Dar de Alta Médico</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
