import React, { useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { UserRoundPlus, ShieldCheck, AlertCircle } from 'lucide-react';
import { asistenteSchema } from '../../../shared/validation/schemas';
import { validateWithSchema, parseBackendError } from '../../../shared/validation/validateForm';

/**
 * Modal para dar de alta personal operativo (Asistentes y Secretarios).
 */
export const CreateAsistenteModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  instituciones = [],
  defaultConsultorioCuit = null,
  adminConsultorioCuil = null,
  defaultInstitucionId = null,
  sedeNombre = null,
}) => {
  const [formData, setFormData] = useState({
    cuil: '',
    nombre: '',
    apellido: '',
    fecNac: '1995-05-15',
    telefono: '',
    genero: 'F',
    calle: '',
    nro: '',
    depto: '',
    localidad: 'San Miguel de Tucumán',
    provincia: 'Tucumán',
    codPostal: '4000',
    institucionId: defaultInstitucionId || instituciones[0]?.id || '',
    consultorioCuit: defaultConsultorioCuit || '',
    adminConsultorioCuil: adminConsultorioCuil || '',
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

    const { isValid, errors: validationErrors, data: sanitizedData } = validateWithSchema(
      asistenteSchema,
      formData
    );

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      ...formData,
      ...sanitizedData,
      fecNac: new Date(sanitizedData.fecNac).toISOString(),
      institucionId: sanitizedData.institucionId ? Number(sanitizedData.institucionId) : (defaultInstitucionId ? Number(defaultInstitucionId) : null),
      consultorioCuit: defaultConsultorioCuit || sanitizedData.consultorioCuit || null,
      adminConsultorioCuil: adminConsultorioCuil || sanitizedData.adminConsultorioCuil || null,
    };

    try {
      const success = await onSubmit(payload);

      if (success) {
        setFormData({
          cuil: '',
          nombre: '',
          apellido: '',
          fecNac: '1995-05-15',
          telefono: '',
          genero: 'F',
          calle: '',
          nro: '',
          depto: '',
          localidad: 'San Miguel de Tucumán',
          provincia: 'Tucumán',
          codPostal: '4000',
          institucionId: instituciones[0]?.id || '',
        });
        setErrors({});
      }
    } catch (err) {
      const parsed = parseBackendError(err, 'Error al registrar al asistente.');
      if (parsed.isDuplicate) {
        setErrors((prev) => ({ ...prev, cuil: parsed.message }));
      } else {
        setErrors((prev) => ({ ...prev, general: parsed.message }));
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Asistente / Secretario"
      description="Alta de personal para la recepción y gestión operativa de agendas."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs sm:text-sm">
        {/* Identificación Personal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
          <div>
            <label htmlFor="cuil-asis" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              CUIL <span className="text-rose-500">*</span>
            </label>
            <input
              id="cuil-asis"
              name="cuil"
              type="text"
              value={formData.cuil}
              onChange={handleChange}
              placeholder="Ej: 27351112229"
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-mono ${
                errors.cuil ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
            />
            {/* Espacio fijo reservado para error (sin salto de layout) */}
            <div className="min-h-[20px] mt-0.5 flex items-center">
              {errors.cuil && (
                <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.cuil}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="nombre-asis" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Nombre <span className="text-rose-500">*</span>
            </label>
            <input
              id="nombre-asis"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Luciana"
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all ${
                errors.nombre ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
            />
            {/* Espacio fijo reservado para error (sin salto de layout) */}
            <div className="min-h-[20px] mt-0.5 flex items-center">
              {errors.nombre && (
                <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.nombre}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="apellido-asis" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Apellido <span className="text-rose-500">*</span>
            </label>
            <input
              id="apellido-asis"
              name="apellido"
              type="text"
              value={formData.apellido}
              onChange={handleChange}
              placeholder="Ej: Herrera"
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all ${
                errors.apellido ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
            />
            {/* Espacio fijo reservado para error (sin salto de layout) */}
            <div className="min-h-[20px] mt-0.5 flex items-center">
              {errors.apellido && (
                <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.apellido}</p>
              )}
            </div>
          </div>
        </div>

        {/* Datos demográficos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
          <div>
            <label htmlFor="telefono-asis" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Teléfono Celular <span className="text-rose-500">*</span>
            </label>
            <input
              id="telefono-asis"
              name="telefono"
              type="text"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="381-5123456"
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all ${
                errors.telefono ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
            />
            {/* Espacio fijo reservado para error (sin salto de layout) */}
            <div className="min-h-[20px] mt-0.5 flex items-center">
              {errors.telefono && (
                <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.telefono}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="fecNac-asis" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Fecha de Nacimiento
            </label>
            <input
              id="fecNac-asis"
              name="fecNac"
              type="date"
              value={formData.fecNac}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="genero-asis" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Género
            </label>
            <select
              id="genero-asis"
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              disabled={isSubmitting}
            >
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
              <option value="Otro">Otro / Prefiero no decir</option>
            </select>
          </div>
        </div>

        {/* Sede o Institución Asignada */}
        {defaultConsultorioCuit ? (
          <div className="p-3 bg-primary-50/60 rounded-xl border border-primary-200/80">
            <p className="text-[11px] font-bold font-heading text-primary-800 uppercase tracking-wider">
              Sede Física Asignada
            </p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">
              {sedeNombre || `Consultorio CUIT: ${defaultConsultorioCuit}`}
            </p>
            <p className="text-[11px] text-slate-500">El asistente quedará registrado y restringido a operar en esta sede.</p>
          </div>
        ) : instituciones.length > 0 ? (
          <div>
            <label htmlFor="institucionId-asis" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Institución Sanitaria Asignada
            </label>
            <select
              id="institucionId-asis"
              name="institucionId"
              value={formData.institucionId}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              disabled={isSubmitting}
            >
              {instituciones.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.nombre} ({inst.cuit})
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {/* Domicilio Opcional */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs font-bold font-heading text-slate-700 uppercase tracking-wider mb-2">
            Domicilio (Opcional)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
            <input
              name="calle"
              type="text"
              value={formData.calle}
              onChange={handleChange}
              placeholder="Calle"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              disabled={isSubmitting}
            />
            <input
              name="nro"
              type="text"
              value={formData.nro}
              onChange={handleChange}
              placeholder="Número"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              disabled={isSubmitting}
            />
            <input
              name="localidad"
              type="text"
              value={formData.localidad}
              onChange={handleChange}
              placeholder="Localidad"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Nota informativa sobre credenciales */}
        <div className="p-3 rounded-xl bg-primary-50/60 border border-primary-200/80 text-xs text-primary-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary-600 flex-shrink-0" strokeWidth={2} />
          <span>
            Se creará automáticamente la cuenta de acceso al sistema con rol <strong>Asistente</strong> y contraseña temporal inicial.
          </span>
        </div>

        {/* Botones de Acción con slot fijo para error inline */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <div className="min-h-[20px] flex items-center text-xs text-rose-600 font-medium w-full sm:w-auto">
            {errors.general && (
              <span className="flex items-center gap-1 animate-in fade-in-0">
                <span aria-hidden="true">⚠</span> {errors.general}
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
              <UserRoundPlus className="w-4 h-4" strokeWidth={2} />
              <span>Registrar Personal</span>
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
