import React, { useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Hospital, MapPin, Phone, Mail, Accessibility, AlertCircle } from 'lucide-react';
import { consultorioSchema } from '../../../shared/validation/schemas';
import { validateWithSchema, parseBackendError } from '../../../shared/validation/validateForm';

/**
 * Modal para el registro de una nueva Sede / Consultorio.
 */
export const CreateConsultorioModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  instituciones = [],
}) => {
  const [formData, setFormData] = useState({
    cuit: '',
    nombre: '',
    email: '',
    telefono: '',
    nivelAccesibilidad: 'Total',
    institucionId: instituciones[0]?.id || '',
    calle: '',
    nro: '',
    depto: '',
    localidad: 'San Miguel de Tucumán',
    provincia: 'Tucumán',
    codPostal: '4000',
  });

  const [adminData, setAdminData] = useState({
    cuil: '',
    nombre: '',
    apellido: '',
    telefono: '',
    mail: '',
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

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminData((prev) => ({ ...prev, [name]: value }));
    if (errors[`adminConsultorio.${name}`] || errors[name]) {
      setErrors((prev) => ({ ...prev, [`adminConsultorio.${name}`]: null, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    const hasAdminInput = Boolean(
      adminData.cuil?.trim() ||
      adminData.mail?.trim() ||
      adminData.nombre?.trim() ||
      adminData.apellido?.trim() ||
      adminData.telefono?.trim()
    );

    const rawPayload = {
      ...formData,
      adminConsultorio: hasAdminInput ? adminData : null,
    };

    const { isValid, errors: validationErrors, data: sanitizedData } = validateWithSchema(
      consultorioSchema,
      rawPayload
    );

    if (!isValid) {
      setErrors(validationErrors);
      setServerError(Object.values(validationErrors)[0]);
      return;
    }

    try {
      const success = await onSubmit({
        ...formData,
        ...sanitizedData,
        institucionId: sanitizedData.institucionId ? Number(sanitizedData.institucionId) : null,
        adminConsultorio: sanitizedData.adminConsultorio?.cuil ? sanitizedData.adminConsultorio : null,
      });

      if (success) {
        setFormData({
          cuit: '',
          nombre: '',
          email: '',
          telefono: '',
          nivelAccesibilidad: 'Total',
          institucionId: instituciones[0]?.id || '',
          calle: '',
          nro: '',
          depto: '',
          localidad: 'San Miguel de Tucumán',
          provincia: 'Tucumán',
          codPostal: '4000',
        });
        setAdminData({
          cuil: '',
          nombre: '',
          apellido: '',
          telefono: '',
          mail: '',
        });
        setErrors({});
        setServerError(null);
      }
    } catch (err) {
      const parsed = parseBackendError(err, 'Error al registrar la sede / consultorio.');
      setServerError(parsed.message);
      if (parsed.isDuplicate) {
        setErrors((prev) => ({ ...prev, cuit: parsed.message }));
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Nueva Sede / Consultorio"
      description="Ingresa los datos de infraestructura física y accesibilidad del consultorio."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs sm:text-sm">
        {/* Identificación de Sede */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cuit" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              CUIT de la Sede <span className="text-rose-500">*</span>
            </label>
            <input
              id="cuit"
              name="cuit"
              type="text"
              value={formData.cuit}
              onChange={handleChange}
              placeholder="Ej: 30711223344"
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-mono ${
                errors.cuit ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
            />
            {/* Espacio fijo reservado para error (sin salto de layout) */}
            <div className="min-h-[20px] mt-0.5 flex items-center">
              {errors.cuit && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.cuit}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="nombre" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Nombre de Sede / Consultorio <span className="text-rose-500">*</span>
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Consultorio 204 - Traumatología"
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all ${
                errors.nombre ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
            />
            {/* Espacio fijo reservado para error (sin salto de layout) */}
            <div className="min-h-[20px] mt-0.5 flex items-center">
              {errors.nombre && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.nombre}</p>}
            </div>
          </div>
        </div>

        {/* Contacto y Accesibilidad */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Email Institucional <span className="text-rose-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="sede@tempuscare.com"
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all ${
                errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
            />
            {/* Espacio fijo reservado para error (sin salto de layout) */}
            <div className="min-h-[20px] mt-0.5 flex items-center">
              {errors.email && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="telefono" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Teléfono de Contacto <span className="text-rose-500">*</span>
            </label>
            <input
              id="telefono"
              name="telefono"
              type="text"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="381-4001234"
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all ${
                errors.telefono ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
            />
            {/* Espacio fijo reservado para error (sin salto de layout) */}
            <div className="min-h-[20px] mt-0.5 flex items-center">
              {errors.telefono && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.telefono}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="nivelAccesibilidad" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Accesibilidad Universal
            </label>
            <select
              id="nivelAccesibilidad"
              name="nivelAccesibilidad"
              value={formData.nivelAccesibilidad}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              disabled={isSubmitting}
            >
              <option value="Total">Total (Rampas, Ascensor, Braille)</option>
              <option value="Media">Media (Rampas y Planta Baja)</option>
              <option value="Básica">Básica (Acceso Estándar)</option>
              <option value="Especializada">Especializada (Neuro / Motriz)</option>
            </select>
          </div>
        </div>

        {/* Institución Asociada */}
        {instituciones.length > 0 && (
          <div>
            <label htmlFor="institucionId" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Institución Sanitaria Perteneciente
            </label>
            <select
              id="institucionId"
              name="institucionId"
              value={formData.institucionId}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              disabled={isSubmitting}
            >
              <option value="">Sin institución asignada (Independiente)</option>
              {instituciones.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.nombre} ({inst.cuit})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Ubicación Física */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs font-bold font-heading text-slate-700 uppercase tracking-wider mb-2">
            Dirección Física
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <input
                name="calle"
                type="text"
                value={formData.calle}
                onChange={handleChange}
                placeholder="Calle *"
                className={`w-full px-3 py-1.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all ${
                  errors.calle ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
                disabled={isSubmitting}
              />
              <div className="min-h-[20px] mt-0.5 flex items-center">
                {errors.calle && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.calle}</p>}
              </div>
            </div>

            <div>
              <input
                name="nro"
                type="text"
                value={formData.nro}
                onChange={handleChange}
                placeholder="Número *"
                className={`w-full px-3 py-1.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all ${
                  errors.nro ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
                disabled={isSubmitting}
              />
              <div className="min-h-[20px] mt-0.5 flex items-center">
                {errors.nro && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.nro}</p>}
              </div>
            </div>

            <div>
              <input
                name="depto"
                type="text"
                value={formData.depto}
                onChange={handleChange}
                placeholder="Piso / Depto"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div>
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

            <div>
              <input
                name="provincia"
                type="text"
                value={formData.provincia}
                onChange={handleChange}
                placeholder="Provincia"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <input
                name="codPostal"
                type="text"
                value={formData.codPostal}
                onChange={handleChange}
                placeholder="Cód. Postal"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Asignación de Administrador de Consultorio (Cadena de Mando) */}
        <div className="pt-3 border-t border-slate-100">
          <div className="mb-2">
            <p className="text-xs font-bold font-heading text-slate-800 uppercase tracking-wider">
              Asignar Administrador de Consultorio (Responsable de Sede)
            </p>
            <p className="text-[11px] text-slate-500">
              Solo el Administrador de Institución puede designar al responsable que administrará a los médicos y asistentes de esta sede física.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
            <div>
              <label htmlFor="adminCuil" className="block text-[11px] font-semibold text-slate-700 mb-1">
                CUIL del Administrador (Opcional)
              </label>
              <input
                id="adminCuil"
                name="cuil"
                type="text"
                value={adminData.cuil}
                onChange={handleAdminChange}
                placeholder="Ej: 20334455667"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-primary-500"
                disabled={isSubmitting}
              />
              <div className="min-h-[18px] mt-0.5 flex items-center">
                {(errors['adminConsultorio.cuil'] || errors.adminCuil) && (
                  <p className="text-[10px] text-rose-600 truncate animate-in fade-in-0">{errors['adminConsultorio.cuil'] || errors.adminCuil}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nombre y Apellido
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  aria-label="Nombre del administrador"
                  name="nombre"
                  type="text"
                  value={adminData.nombre}
                  onChange={handleAdminChange}
                  placeholder="Nombre"
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-500"
                  disabled={isSubmitting}
                />
                <input
                  aria-label="Apellido del administrador"
                  name="apellido"
                  type="text"
                  value={adminData.apellido}
                  onChange={handleAdminChange}
                  placeholder="Apellido"
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-500"
                  disabled={isSubmitting}
                />
              </div>
              <div className="min-h-[18px]" />
            </div>
            <div>
              <label htmlFor="adminTelefono" className="block text-[11px] font-semibold text-slate-700 mb-1">
                Teléfono
              </label>
              <input
                id="adminTelefono"
                name="telefono"
                type="text"
                value={adminData.telefono}
                onChange={handleAdminChange}
                placeholder="Ej: 381-4556677"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-500"
                disabled={isSubmitting}
              />
              <div className="min-h-[18px]" />
            </div>
            <div>
              <label htmlFor="adminMail" className="block text-[11px] font-semibold text-slate-700 mb-1">
                Email Profesional
              </label>
              <input
                id="adminMail"
                name="mail"
                type="email"
                value={adminData.mail}
                onChange={handleAdminChange}
                placeholder="admin.sede@tempuscare.com"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-500"
                disabled={isSubmitting}
              />
              <div className="min-h-[18px] mt-0.5 flex items-center">
                {(errors['adminConsultorio.mail'] || errors.adminMail) && (
                  <p className="text-[10px] text-rose-600 truncate animate-in fade-in-0">{errors['adminConsultorio.mail'] || errors.adminMail}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción con slot de error inline */}
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
              <Hospital className="w-4 h-4 mr-1" strokeWidth={2} />
              <span>Registrar Consultorio</span>
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
