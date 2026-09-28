import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Hospital, MapPin, Phone, Mail, Hash, Building2, Accessibility } from 'lucide-react';
import { updateConsultorioSchema } from '../../../shared/validation/schemas';
import { validateWithSchema, parseBackendError } from '../../../shared/validation/validateForm';

/**
 * Modal para la Edición y Modificación de una Sede Física / Consultorio.
 * Permite al Administrador de Institución actualizar nombre, dirección y datos de contacto.
 */
export const EditConsultorioModal = ({
  isOpen,
  onClose,
  consultorio,
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
    institucionId: '',
    calle: '',
    nro: '',
    depto: '',
    localidad: 'San Miguel de Tucumán',
    provincia: 'Tucumán',
    codPostal: '4000',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  // Inicializar el formulario con los datos de la sede seleccionada
  useEffect(() => {
    if (consultorio) {
      // Extracción inteligente de dirección si los campos desglosados no vienen directamente
      let defaultCalle = consultorio.calle || '';
      let defaultNro = consultorio.nro || '';
      let defaultLocalidad = consultorio.localidad || 'San Miguel de Tucumán';
      let defaultProvincia = consultorio.provincia || 'Tucumán';

      if (!defaultCalle && consultorio.direccionCompleta) {
        const parts = consultorio.direccionCompleta.split(',');
        if (parts[0]) {
          const streetParts = parts[0].trim().split(' ');
          defaultNro = streetParts.pop() || '';
          defaultCalle = streetParts.join(' ') || parts[0].trim();
        }
        if (parts[1]) defaultLocalidad = parts[1].trim();
        if (parts[2]) defaultProvincia = parts[2].trim();
      }

      setFormData({
        cuit: consultorio.cuit || '',
        nombre: consultorio.nombre || '',
        email: consultorio.email || '',
        telefono: consultorio.telefono || '',
        nivelAccesibilidad: consultorio.nivelAccesibilidad || 'Total',
        institucionId: consultorio.institucionId || '',
        calle: defaultCalle,
        nro: defaultNro,
        depto: consultorio.depto || '',
        localidad: defaultLocalidad,
        provincia: defaultProvincia,
        codPostal: consultorio.codPostal || '4000',
      });
      setErrors({});
      setServerError(null);
    }
  }, [consultorio, isOpen]);

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
      updateConsultorioSchema,
      formData
    );

    if (!isValid) {
      setErrors(validationErrors);
      setServerError(Object.values(validationErrors)[0]);
      return;
    }

    try {
      const payload = {
        ...sanitizedData,
        institucionId: sanitizedData.institucionId ? Number(sanitizedData.institucionId) : null,
      };

      const success = await onSubmit(formData.cuit, payload);
      if (success) {
        onClose();
      }
    } catch (err) {
      const parsed = parseBackendError(err, 'Error al actualizar la sede.');
      setServerError(parsed.message);
      setErrors((prev) => ({ ...prev, general: parsed.message }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Sede / Consultorio"
      description={`Modifica los datos de identificación, contacto y dirección física de la sede ${consultorio?.nombre ? `"${consultorio.nombre}"` : ''}.`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs sm:text-sm">
        {/* Grilla Superior: CUIT (inmutable) y Nombre de Sede */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <label htmlFor="edit-sede-cuit" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              CUIT de la Sede (Identificador)
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
              <input
                id="edit-sede-cuit"
                name="cuit"
                type="text"
                value={formData.cuit}
                readOnly
                aria-readonly="true"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl font-mono cursor-not-allowed select-all"
              />
            </div>
            <div className="min-h-[20px] mt-0.5 flex items-center">
              <span className="text-[11px] text-slate-400">Identificador fiscal inmutable</span>
            </div>
          </div>

          <div>
            <label htmlFor="edit-sede-nombre" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Nombre de Sede / Consultorio <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Hospital className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
              <input
                id="edit-sede-nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Sede Central - Consultorio 101"
                className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium ${
                  errors.nombre ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
                disabled={isSubmitting}
              />
            </div>
            <div className="min-h-[20px] mt-0.5 flex items-center">
              {errors.nombre && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.nombre}</p>}
            </div>
          </div>
        </div>

        {/* Contacto: Email y Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <label htmlFor="edit-sede-email" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Email Institucional de la Sede <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
              <input
                id="edit-sede-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="sede@tempuscare.com"
                className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all ${
                  errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
                disabled={isSubmitting}
              />
            </div>
            <div className="min-h-[20px] mt-0.5 flex items-center">
              {errors.email && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="edit-sede-telefono" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Teléfono de Contacto <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
              <input
                id="edit-sede-telefono"
                name="telefono"
                type="text"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="381-4001234"
                className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-mono ${
                  errors.telefono ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
                disabled={isSubmitting}
              />
            </div>
            <div className="min-h-[20px] mt-0.5 flex items-center">
              {errors.telefono && <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.telefono}</p>}
            </div>
          </div>
        </div>

        {/* Nivel de Accesibilidad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <label htmlFor="edit-sede-accesibilidad" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Nivel de Accesibilidad Universal
            </label>
            <div className="relative">
              <Accessibility className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
              <select
                id="edit-sede-accesibilidad"
                name="nivelAccesibilidad"
                value={formData.nivelAccesibilidad}
                onChange={handleChange}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                disabled={isSubmitting}
              >
                <option value="Total">Total (Rampas, Ascensor, Braille)</option>
                <option value="Media">Media (Rampas y Planta Baja)</option>
                <option value="Básica">Básica (Acceso Estándar)</option>
                <option value="Especializada">Especializada (Neuro / Motriz)</option>
              </select>
            </div>
            <div className="min-h-[20px] mt-0.5" />
          </div>

          {/* Institución Asociada (si aplica) */}
          {instituciones.length > 0 && (
            <div>
              <label htmlFor="edit-sede-institucion" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
                Institución Sanitaria
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
                <select
                  id="edit-sede-institucion"
                  name="institucionId"
                  value={formData.institucionId}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                  disabled={isSubmitting}
                >
                  <option value="">Sin institución asignada</option>
                  {instituciones.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.nombre} ({inst.cuit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-h-[20px] mt-0.5" />
            </div>
          )}
        </div>

        {/* Sección de Dirección Física */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 mb-2.5">
            <MapPin className="w-4 h-4 text-primary-600" strokeWidth={2} />
            <h2 className="text-xs font-bold font-heading text-slate-800 uppercase tracking-wider">
              Dirección Física de la Sede
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-start">
            <div className="sm:col-span-2">
              <label htmlFor="edit-sede-calle" className="block text-[11px] font-semibold text-slate-700 mb-1">
                Calle <span className="text-rose-500">*</span>
              </label>
              <input
                id="edit-sede-calle"
                name="calle"
                type="text"
                value={formData.calle}
                onChange={handleChange}
                placeholder="Ej: Av. San Martín"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all ${
                  errors.calle ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
                disabled={isSubmitting}
              />
              <div className="min-h-[18px] mt-0.5 flex items-center">
                {errors.calle && <p className="text-[10px] text-rose-600 truncate animate-in fade-in-0">{errors.calle}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="edit-sede-nro" className="block text-[11px] font-semibold text-slate-700 mb-1">
                Número <span className="text-rose-500">*</span>
              </label>
              <input
                id="edit-sede-nro"
                name="nro"
                type="text"
                value={formData.nro}
                onChange={handleChange}
                placeholder="Ej: 450"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-mono ${
                  errors.nro ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
                disabled={isSubmitting}
              />
              <div className="min-h-[18px] mt-0.5 flex items-center">
                {errors.nro && <p className="text-[10px] text-rose-600 truncate animate-in fade-in-0">{errors.nro}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="edit-sede-depto" className="block text-[11px] font-semibold text-slate-700 mb-1">
                Depto / Piso
              </label>
              <input
                id="edit-sede-depto"
                name="depto"
                type="text"
                value={formData.depto}
                onChange={handleChange}
                placeholder="Ej: 2° B"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                disabled={isSubmitting}
              />
              <div className="min-h-[18px] mt-0.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1 items-start">
            <div>
              <label htmlFor="edit-sede-localidad" className="block text-[11px] font-semibold text-slate-700 mb-1">
                Localidad <span className="text-rose-500">*</span>
              </label>
              <input
                id="edit-sede-localidad"
                name="localidad"
                type="text"
                value={formData.localidad}
                onChange={handleChange}
                placeholder="Ej: San Miguel de Tucumán"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all ${
                  errors.localidad ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
                disabled={isSubmitting}
              />
              <div className="min-h-[18px] mt-0.5 flex items-center">
                {errors.localidad && <p className="text-[10px] text-rose-600 truncate animate-in fade-in-0">{errors.localidad}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="edit-sede-provincia" className="block text-[11px] font-semibold text-slate-700 mb-1">
                Provincia
              </label>
              <input
                id="edit-sede-provincia"
                name="provincia"
                type="text"
                value={formData.provincia}
                onChange={handleChange}
                placeholder="Ej: Tucumán"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                disabled={isSubmitting}
              />
              <div className="min-h-[18px] mt-0.5" />
            </div>

            <div>
              <label htmlFor="edit-sede-codPostal" className="block text-[11px] font-semibold text-slate-700 mb-1">
                Código Postal
              </label>
              <input
                id="edit-sede-codPostal"
                name="codPostal"
                type="text"
                value={formData.codPostal}
                onChange={handleChange}
                placeholder="Ej: 4000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-mono"
                disabled={isSubmitting}
              />
              <div className="min-h-[18px] mt-0.5" />
            </div>
          </div>
        </div>

        {/* Acciones y slot de error general */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <div className="min-h-[20px] flex items-center text-xs text-rose-600 font-medium w-full sm:w-auto">
            {serverError && (
              <span className="flex items-center gap-1 animate-in fade-in-0">
                <span aria-hidden="true">⚠</span> {serverError}
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
              disabled={isSubmitting}
              className="shadow-xs"
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
