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
      title="Agregar Nueva Sede"
      description="Ingresa los datos de infraestructura física y accesibilidad del consultorio."
      maxWidth="max-w-lg"
      className="p-5 sm:p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-3 font-sans text-sm">
        {/* Identificación de Sede */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
          <div>
            <label htmlFor="cuit" className="block text-xs font-semibold text-slate-700 mb-1">
              CUIT de la Sede <span className="text-rose-500">*</span>
            </label>
            <input
              id="cuit"
              name="cuit"
              type="text"
              value={formData.cuit}
              onChange={handleChange}
              placeholder="Ej: 30711223344"
              className={`w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-mono text-sm ${
                errors.cuit ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
            />
            {/* Espacio fijo reservado para error (sin salto de layout) */}
            <div className="min-h-[16px] mt-0.5 flex items-center">
              {errors.cuit && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.cuit}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="nombre" className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre de Sede / Consultorio <span className="text-rose-500">*</span>
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Consultorio 204"
              className={`w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm ${
                errors.nombre ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
            />
            {/* Espacio fijo reservado para error (sin salto de layout) */}
            <div className="min-h-[16px] mt-0.5 flex items-center">
              {errors.nombre && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.nombre}</p>}
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
              Email Institucional <span className="text-rose-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="sede@tempuscare.com"
              className={`w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm ${
                errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
            />
            <div className="min-h-[16px] mt-0.5 flex items-center">
              {errors.email && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="telefono" className="block text-xs font-semibold text-slate-700 mb-1">
              Teléfono de Contacto <span className="text-rose-500">*</span>
            </label>
            <input
              id="telefono"
              name="telefono"
              type="text"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="381-4001234"
              className={`w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm ${
                errors.telefono ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
            />
            <div className="min-h-[16px] mt-0.5 flex items-center">
              {errors.telefono && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.telefono}</p>}
            </div>
          </div>
        </div>

        {/* Accesibilidad e Institución */}
        <div className={`grid grid-cols-1 ${instituciones.length > 0 ? 'sm:grid-cols-2' : ''} gap-2.5 items-start`}>
          <div>
            <label htmlFor="nivelAccesibilidad" className="block text-xs font-semibold text-slate-700 mb-1">
              Accesibilidad Universal
            </label>
            <select
              id="nivelAccesibilidad"
              name="nivelAccesibilidad"
              value={formData.nivelAccesibilidad}
              onChange={handleChange}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
              disabled={isSubmitting}
            >
              <option value="Total">Total (Rampas, Ascensor, Braille)</option>
              <option value="Media">Media (Rampas y PB)</option>
              <option value="Básica">Básica (Acceso Estándar)</option>
              <option value="Especializada">Especializada (Neuro / Motriz)</option>
            </select>
          </div>

          {instituciones.length > 0 && (
            <div>
              <label htmlFor="institucionId" className="block text-xs font-semibold text-slate-700 mb-1">
                Institución Perteneciente
              </label>
              <select
                id="institucionId"
                name="institucionId"
                value={formData.institucionId}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                disabled={isSubmitting}
              >
                <option value="">Independiente</option>
                {instituciones.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.nombre} ({inst.cuit})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Ubicación Física */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
            Dirección Física
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-start">
            <div className="sm:col-span-2">
              <input
                name="calle"
                type="text"
                value={formData.calle}
                onChange={handleChange}
                placeholder="Calle *"
                className={`w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm ${
                  errors.calle ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
                disabled={isSubmitting}
              />
              <div className="min-h-[16px] mt-0.5 flex items-center">
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
                className={`w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm ${
                  errors.nro ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
                disabled={isSubmitting}
              />
              <div className="min-h-[16px] mt-0.5 flex items-center">
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
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                disabled={isSubmitting}
              />
              <div className="min-h-[16px] mt-0.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-start mt-0.5">
            <div className="sm:col-span-2">
              <input
                name="localidad"
                type="text"
                value={formData.localidad}
                onChange={handleChange}
                placeholder="Localidad"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
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
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
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
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Asignación de Administrador de Consultorio (Cadena de Mando) */}
        <div className="pt-2 border-t border-slate-100">
          <div className="mb-1.5">
            <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Responsable de Sede (Opcional)
            </p>
            <p className="text-[11px] text-slate-500">
              Designa al Administrador de Consultorio a cargo de esta sede física.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/80">
            <div>
              <label htmlFor="adminCuil" className="block text-[11px] font-medium text-slate-700 mb-0.5">
                CUIL del Administrador
              </label>
              <input
                id="adminCuil"
                name="cuil"
                type="text"
                value={adminData.cuil}
                onChange={handleAdminChange}
                placeholder="Ej: 20334455667"
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-primary-500 focus:outline-none"
                disabled={isSubmitting}
              />
              <div className="min-h-[16px] mt-0.5 flex items-center">
                {(errors['adminConsultorio.cuil'] || errors.adminCuil) && (
                  <p className="text-[10px] text-rose-600 truncate animate-in fade-in-0">{errors['adminConsultorio.cuil'] || errors.adminCuil}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
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
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  disabled={isSubmitting}
                />
                <input
                  aria-label="Apellido del administrador"
                  name="apellido"
                  type="text"
                  value={adminData.apellido}
                  onChange={handleAdminChange}
                  placeholder="Apellido"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  disabled={isSubmitting}
                />
              </div>
              <div className="min-h-[16px]" />
            </div>

            <div>
              <label htmlFor="adminTelefono" className="block text-[11px] font-medium text-slate-700 mb-0.5">
                Teléfono
              </label>
              <input
                id="adminTelefono"
                name="telefono"
                type="text"
                value={adminData.telefono}
                onChange={handleAdminChange}
                placeholder="Ej: 381-4556677"
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                disabled={isSubmitting}
              />
              <div className="min-h-[16px]" />
            </div>

            <div>
              <label htmlFor="adminMail" className="block text-[11px] font-medium text-slate-700 mb-0.5">
                Email Profesional
              </label>
              <input
                id="adminMail"
                name="mail"
                type="email"
                value={adminData.mail}
                onChange={handleAdminChange}
                placeholder="admin.sede@tempuscare.com"
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                disabled={isSubmitting}
              />
              <div className="min-h-[16px] mt-0.5 flex items-center">
                {(errors['adminConsultorio.mail'] || errors.adminMail) && (
                  <p className="text-[10px] text-rose-600 truncate animate-in fade-in-0">{errors['adminConsultorio.mail'] || errors.adminMail}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción con slot de error inline */}
        <div className="pt-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-slate-100">
          <div className="min-h-[16px] flex items-center text-xs text-rose-600 font-medium w-full sm:w-auto">
            {errors.general && (
              <span className="flex items-center gap-1 animate-in fade-in-0">
                <span aria-hidden="true">⚠</span> {errors.general}
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
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
              <span>Agregar Sede</span>
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
