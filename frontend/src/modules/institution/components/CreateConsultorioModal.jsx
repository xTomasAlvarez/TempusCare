import React, { useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Building2, MapPin, Phone, Mail, Accessibility } from 'lucide-react';

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

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.cuit.trim()) newErrors.cuit = 'El CUIT es obligatorio.';
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre de la sede es obligatorio.';
    if (!formData.email.trim()) newErrors.email = 'El email es obligatorio.';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio.';
    if (!formData.calle.trim()) newErrors.calle = 'La calle es obligatoria.';
    if (!formData.nro.trim()) newErrors.nro = 'El número es obligatorio.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await onSubmit({
      ...formData,
      institucionId: formData.institucionId ? Number(formData.institucionId) : null,
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
      setErrors({});
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
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-mono"
              disabled={isSubmitting}
            />
            {errors.cuit && <p className="text-[11px] text-rose-600 mt-1">{errors.cuit}</p>}
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
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              disabled={isSubmitting}
            />
            {errors.nombre && <p className="text-[11px] text-rose-600 mt-1">{errors.nombre}</p>}
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
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
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
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              disabled={isSubmitting}
            />
            {errors.telefono && <p className="text-[11px] text-rose-600 mt-1">{errors.telefono}</p>}
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
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
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
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
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
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                disabled={isSubmitting}
              />
              {errors.calle && <p className="text-[11px] text-rose-600 mt-1">{errors.calle}</p>}
            </div>

            <div>
              <input
                name="nro"
                type="text"
                value={formData.nro}
                onChange={handleChange}
                placeholder="Número *"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                disabled={isSubmitting}
              />
              {errors.nro && <p className="text-[11px] text-rose-600 mt-1">{errors.nro}</p>}
            </div>

            <div>
              <input
                name="depto"
                type="text"
                value={formData.depto}
                onChange={handleChange}
                placeholder="Piso / Depto"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
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
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
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
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
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
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
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
          >
            Registrar Consultorio
          </Button>
        </div>
      </form>
    </Modal>
  );
};
