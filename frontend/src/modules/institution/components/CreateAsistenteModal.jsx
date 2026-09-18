import React, { useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { UserCheck, ShieldCheck } from 'lucide-react';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.cuil.trim()) newErrors.cuil = 'El CUIL es obligatorio.';
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio.';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es obligatorio.';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      fecNac: new Date(formData.fecNac).toISOString(),
      institucionId: formData.institucionId ? Number(formData.institucionId) : (defaultInstitucionId ? Number(defaultInstitucionId) : null),
      consultorioCuit: defaultConsultorioCuit || formData.consultorioCuit || null,
      adminConsultorioCuil: adminConsultorioCuil || formData.adminConsultorioCuil || null,
    };

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-mono"
              disabled={isSubmitting}
            />
            {errors.cuil && <p className="text-[11px] text-rose-600 mt-1">{errors.cuil}</p>}
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
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              disabled={isSubmitting}
            />
            {errors.nombre && <p className="text-[11px] text-rose-600 mt-1">{errors.nombre}</p>}
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
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              disabled={isSubmitting}
            />
            {errors.apellido && <p className="text-[11px] text-rose-600 mt-1">{errors.apellido}</p>}
          </div>
        </div>

        {/* Datos demográficos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              disabled={isSubmitting}
            />
            {errors.telefono && <p className="text-[11px] text-rose-600 mt-1">{errors.telefono}</p>}
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
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
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
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
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
          <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200/80">
            <p className="text-[11px] font-bold font-heading text-teal-800 uppercase tracking-wider">
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
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              name="calle"
              type="text"
              value={formData.calle}
              onChange={handleChange}
              placeholder="Calle"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              disabled={isSubmitting}
            />
            <input
              name="nro"
              type="text"
              value={formData.nro}
              onChange={handleChange}
              placeholder="Número"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              disabled={isSubmitting}
            />
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
        </div>

        {/* Nota informativa sobre credenciales */}
        <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/80 text-xs text-teal-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span>
            Se creará automáticamente la cuenta de acceso al sistema con rol <strong>Asistente</strong> y contraseña temporal inicial.
          </span>
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
            Registrar Personal
          </Button>
        </div>
      </form>
    </Modal>
  );
};
