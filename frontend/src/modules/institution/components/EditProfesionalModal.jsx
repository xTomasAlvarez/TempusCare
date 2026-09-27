import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Stethoscope, CheckCircle2, Hospital } from 'lucide-react';

/**
 * Modal para modificar los datos de cuenta y especialidad de un Profesional.
 * Regla de negocio crítica: Solo gestiona datos de cuenta e identidad profesional
 * (Nombre, Apellido, CUIL, Matrícula, Teléfono, Especialidad).
 * Excluye expresamente la configuración de obras sociales o estudios.
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
    matricula: '',
    telefono: '',
    especialidadId: '',
    genero: 'Otro',
    fecNac: '1985-06-15',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profesional) {
      let fecNacFormatted = '1985-06-15';
      if (profesional.fechaNacimiento) {
        try {
          fecNacFormatted = new Date(profesional.fechaNacimiento).toISOString().split('T')[0];
        } catch {
          fecNacFormatted = '1985-06-15';
        }
      }

      // Encontrar id de la especialidad actual si viene por nombre
      let currentEspId = '';
      if (profesional.especialidades?.length > 0 && especialidades?.length > 0) {
        const firstEspName = profesional.especialidades[0];
        const match = especialidades.find(
          (e) => e.nombre?.toLowerCase() === firstEspName?.toLowerCase() || e.id === firstEspName
        );
        if (match) currentEspId = String(match.id);
      }

      setFormData({
        nombre: profesional.nombre || '',
        apellido: profesional.apellido || '',
        matricula: profesional.matricula || '',
        telefono: profesional.telefono || '',
        especialidadId: currentEspId,
        genero: profesional.genero || 'Otro',
        fecNac: fecNacFormatted,
      });
      setErrors({});
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

    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio.';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es obligatorio.';
    if (!formData.matricula.trim()) newErrors.matricula = 'La matrícula es obligatoria.';
    if (!formData.especialidadId) newErrors.especialidadId = 'Debe seleccionar una especialidad.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      cuil: profesional.cuil,
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      matricula: formData.matricula.trim(),
      telefono: formData.telefono.trim(),
      genero: formData.genero,
      fecNac: new Date(formData.fecNac).toISOString(),
      especialidadesIds: [Number(formData.especialidadId)],
    };

    const success = await onSubmit(profesional.cuil, payload);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modificar Cuenta de Profesional"
      description={`Actualiza la cuenta del médico asignado a "${sedeNombre}".`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs sm:text-sm">
        {/* Identificación (CUIL) y Matrícula */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              CUIL / CUIT (Cuenta)
            </label>
            <input
              type="text"
              value={profesional?.cuil || ''}
              disabled
              className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-500 cursor-not-allowed select-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">Identificador de cuenta inmutable.</p>
          </div>

          <div>
            <label htmlFor="edit-prof-matricula" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Matrícula Profesional <span className="text-rose-500">*</span>
            </label>
            <input
              id="edit-prof-matricula"
              name="matricula"
              type="text"
              value={formData.matricula}
              onChange={handleChange}
              placeholder="Ej: MP-9842"
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-mono ${
                errors.matricula ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
            />
            <div className="min-h-[20px] mt-0.5 flex items-center">
              {errors.matricula && (
                <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.matricula}</p>
              )}
            </div>
          </div>
        </div>

        {/* Nombre y Apellido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-prof-nombre" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Nombre <span className="text-rose-500">*</span>
            </label>
            <input
              id="edit-prof-nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Esteban"
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
            <label htmlFor="edit-prof-apellido" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Apellido <span className="text-rose-500">*</span>
            </label>
            <input
              id="edit-prof-apellido"
              name="apellido"
              type="text"
              value={formData.apellido}
              onChange={handleChange}
              placeholder="Ej: Rossi"
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

        {/* Especialidad y Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-prof-especialidad" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Especialidad <span className="text-rose-500">*</span>
            </label>
            <select
              id="edit-prof-especialidad"
              name="especialidadId"
              value={formData.especialidadId}
              onChange={handleChange}
              className={`w-full h-10 px-3.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all ${
                errors.especialidadId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Seleccionar especialidad...</option>
              {especialidades.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nombre}
                </option>
              ))}
            </select>
            <div className="min-h-[20px] mt-0.5 flex items-center">
              {errors.especialidadId && (
                <p className="text-[11px] text-rose-600 truncate animate-in fade-in-0">{errors.especialidadId}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="edit-prof-telefono" className="block text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-1">
              Teléfono de Contacto
            </label>
            <input
              id="edit-prof-telefono"
              name="telefono"
              type="text"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Ej: 381-4998877"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Indicador de Sede Física */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-2.5">
          <Hospital className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-slate-800">Sede asignada: </span>
            <span className="text-slate-600">{sedeNombre || 'Sede Actual'}</span>
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
            className="gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
            <span>Guardar Cambios</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
