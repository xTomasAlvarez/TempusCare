import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { UserCheck, ShieldCheck, MapPin } from 'lucide-react';

/**
 * Modal para modificar los datos del Asistente / Secretario de la sede.
 * El CUIL y la sede asignada son inmutables por regla de seguridad.
 */
export const EditAsistenteModal = ({
  isOpen,
  onClose,
  asistente,
  onSubmit,
  isSubmitting,
  sedeNombre = '',
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    fecNac: '1995-05-15',
    genero: 'F',
    calle: '',
    nro: '',
    depto: '',
    localidad: 'San Miguel de Tucumán',
    provincia: 'Tucumán',
    codPostal: '4000',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (asistente) {
      let fecNacFormatted = '1995-05-15';
      if (asistente.fechaNacimiento) {
        try {
          fecNacFormatted = new Date(asistente.fechaNacimiento).toISOString().split('T')[0];
        } catch {
          fecNacFormatted = '1995-05-15';
        }
      }

      setFormData({
        nombre: asistente.nombre || '',
        apellido: asistente.apellido || '',
        telefono: asistente.telefono || '',
        fecNac: fecNacFormatted,
        genero: asistente.genero || 'F',
        calle: asistente.calle || '',
        nro: asistente.nro || '',
        depto: asistente.depto || '',
        localidad: asistente.localidad || 'San Miguel de Tucumán',
        provincia: asistente.provincia || 'Tucumán',
        codPostal: asistente.codPostal || '4000',
      });
      setErrors({});
    }
  }, [asistente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!asistente) return;

    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio.';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es obligatorio.';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      cuil: asistente.cuil,
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      fecNac: new Date(formData.fecNac).toISOString(),
      telefono: formData.telefono.trim(),
      genero: formData.genero,
      calle: formData.calle?.trim() || null,
      nro: formData.nro?.trim() || null,
      depto: formData.depto?.trim() || null,
      localidad: formData.localidad?.trim() || 'San Miguel de Tucumán',
      provincia: formData.provincia?.trim() || 'Tucumán',
      codPostal: formData.codPostal?.trim() || '4000',
      institucionId: asistente.institucionId || null,
      consultorioCuit: asistente.consultorioCuit || null,
      adminConsultorioCuil: asistente.adminConsultorioCuil || null,
    };

    const success = await onSubmit(asistente.cuil, payload);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modificar Datos del Asistente"
      description={`Actualiza la información personal y de contacto del asistente en "${sedeNombre}".`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs sm:text-sm">
        {/* Identificación (CUIL de sólo lectura) y Nombre */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
          <div>
            <label className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              CUIL (Identificador)
            </label>
            <input
              type="text"
              value={asistente?.cuil || ''}
              disabled
              className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-500 cursor-not-allowed select-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">Identificador inmutable.</p>
          </div>

          <div>
            <label htmlFor="edit-asis-nombre" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Nombre <span className="text-rose-500">*</span>
            </label>
            <input
              id="edit-asis-nombre"
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
            <div className="min-h-[20px] mt-0.5 flex items-center">
              {errors.nombre && (
                <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.nombre}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="edit-asis-apellido" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Apellido <span className="text-rose-500">*</span>
            </label>
            <input
              id="edit-asis-apellido"
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
            <label htmlFor="edit-asis-telefono" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Teléfono Celular <span className="text-rose-500">*</span>
            </label>
            <input
              id="edit-asis-telefono"
              name="telefono"
              type="text"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Ej: 381-5123456"
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all ${
                errors.telefono ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
            />
            <div className="min-h-[20px] mt-0.5 flex items-center">
              {errors.telefono && (
                <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.telefono}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="edit-asis-fecNac" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Fecha de Nacimiento
            </label>
            <input
              id="edit-asis-fecNac"
              name="fecNac"
              type="date"
              value={formData.fecNac}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="edit-asis-genero" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Género
            </label>
            <select
              id="edit-asis-genero"
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

        {/* Domicilio */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs font-bold font-heading text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Domicilio</span>
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

        {/* Sede Asignada (Read-only) */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <p className="text-[11px] font-bold font-heading text-slate-600 uppercase tracking-wider">
            Sede Física Asignada
          </p>
          <p className="text-sm font-semibold text-slate-800 mt-0.5">
            {sedeNombre || asistente?.consultorioNombre || 'Sede Actual'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            La reasignación de sede sólo puede realizarse desde la administración central.
          </p>
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
            className="gap-1.5"
          >
            <UserCheck className="w-4 h-4" strokeWidth={2} />
            <span>Guardar Cambios</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
