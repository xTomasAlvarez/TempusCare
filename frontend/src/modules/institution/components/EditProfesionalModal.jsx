import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { CheckCircle2, Hospital, Mail, AlertCircle } from 'lucide-react';

/**
 * Modal para modificar los datos de un Médico / Profesional en la sede.
 * Regla de negocio estricta:
 * Pide Nombre, Apellido, CUIL, Email y Especialidad.
 * NO incluye estudios ni obras sociales.
 */
export const EditProfesionalModal = ({
  isOpen,
  onClose,
  profesional,
  especialidades = [],
  onSubmit,
  isSubmitting,
  sedeNombre = '',
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    especialidadId: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (profesional) {
      let currentEspId = '';
      if (profesional.especialidades?.length > 0 && especialidades?.length > 0) {
        const firstEspName = profesional.especialidades[0];
        const match = especialidades.find(
          (e) => e.nombre?.toLowerCase() === firstEspName?.toLowerCase() || String(e.id) === String(firstEspName)
        );
        if (match) currentEspId = String(match.id);
      }

      setFormData({
        nombre: profesional.nombre || '',
        apellido: profesional.apellido || '',
        email: profesional.email || '',
        especialidadId: currentEspId,
      });
      setErrors({});
      setServerError(null);
    }
  }, [profesional, especialidades]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profesional) return;
    setServerError(null);

    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio.';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es obligatorio.';
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Ingresa un correo electrónico válido.';
    }
    if (!formData.especialidadId) newErrors.especialidadId = 'Debe seleccionar una especialidad.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        cuil: profesional.cuil,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        matricula: profesional.matricula || `MP-${profesional.cuil.slice(-6)}`,
        telefono: profesional.telefono || '381-0000000',
        genero: profesional.genero || 'Otro',
        fecNac: profesional.fechaNacimiento
          ? new Date(profesional.fechaNacimiento).toISOString()
          : new Date('1985-06-15').toISOString(),
        especialidadesIds: [Number(formData.especialidadId)],
      };

      const success = await onSubmit(profesional.cuil, payload);
      if (success) {
        onClose();
      }
    } catch (err) {
      setServerError(err.message || 'Error al modificar los datos del profesional.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Médico"
      description={`Modifica los datos del médico asignado a "${sedeNombre || 'la sede'}".`}
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

        {/* 2. CUIL (inmutable) y Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              CUIL
            </label>
            <input
              type="text"
              value={profesional?.cuil || ''}
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
            placeholder="medico@hospital.com"
            error={errors.email}
            required
            disabled={isSubmitting}
            leadingIcon={<Mail className="w-4 h-4 text-primary-600" />}
          />
        </div>

        {/* 3. Especialidad */}
        <div>
          <label htmlFor="edit-prof-especialidad" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Especialidad <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl shadow-xs">
            <select
              id="edit-prof-especialidad"
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
