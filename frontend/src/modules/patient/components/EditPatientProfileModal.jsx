import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import {
  User,
  Phone,
  Calendar,
  ShieldPlus,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
  X,
  Building,
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { useAuth } from '../../../core/context/AuthContext';
import { parseBackendError } from '../../../shared/validation/validateForm';

/**
 * Modal accesible y validado para la edición de perfil del Paciente.
 * Permite modificar datos personales (Nombre, Apellido, Teléfono, Género, Fecha de Nacimiento, Domicilio)
 * y agregar o cambiar su Obra Social / Prepaga asociada.
 */
export const EditPatientProfileModal = ({
  isOpen,
  onClose,
  paciente,
  onSuccess,
}) => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    genero: 'Otro',
    fecNac: '1990-01-01',
    calle: '',
    nro: '',
    depto: '',
    localidad: '',
    provincia: '',
    codPostal: '',
  });

  const [selectedObrasSocialesIds, setSelectedObrasSocialesIds] = useState([]);
  const [obrasSocialesCatalog, setObrasSocialesCatalog] = useState([]);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showAddressSection, setShowAddressSection] = useState(false);

  // Cargar catálogo de obras sociales al abrir
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      setIsLoadingCatalogs(true);
      patientService
        .getHealthInsurances()
        .then((res) => {
          if (isMounted) {
            setObrasSocialesCatalog(Array.isArray(res) ? res : []);
          }
        })
        .catch(() => {
          if (isMounted) setObrasSocialesCatalog([]);
        })
        .finally(() => {
          if (isMounted) setIsLoadingCatalogs(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Pre-popular datos cuando se abre el modal o cambia el paciente
  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      setSuccessMessage(null);
      setErrors({});

      let fecNacStr = '1990-01-01';
      const rawDate = paciente?.fechaNacimiento || user?.fechaNacimiento;
      if (rawDate) {
        try {
          fecNacStr = new Date(rawDate).toISOString().split('T')[0];
        } catch {
          fecNacStr = '1990-01-01';
        }
      }

      setFormData({
        nombre: paciente?.nombre || user?.nombre || '',
        apellido: paciente?.apellido || user?.apellido || '',
        telefono: paciente?.telefono || user?.telefono || '',
        genero: paciente?.genero || 'Otro',
        fecNac: fecNacStr,
        calle: '',
        nro: '',
        depto: '',
        localidad: '',
        provincia: '',
        codPostal: '',
      });

      // Determinar IDs de obras sociales
      if (Array.isArray(paciente?.obrasSocialesIds) && paciente.obrasSocialesIds.length > 0) {
        setSelectedObrasSocialesIds(paciente.obrasSocialesIds);
      } else if (Array.isArray(paciente?.obrasSociales) && paciente.obrasSociales.length > 0) {
        // Mapear nombres a IDs desde el catálogo si están disponibles
        const names = paciente.obrasSociales.map((s) => String(s).toLowerCase().trim());
        const matched = obrasSocialesCatalog
          .filter((os) => names.includes(os.nombre.toLowerCase().trim()))
          .map((os) => os.id);
        setSelectedObrasSocialesIds(matched);
      } else {
        setSelectedObrasSocialesIds([]);
      }
    }
  }, [isOpen, paciente, user, obrasSocialesCatalog]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAddObraSocial = (e) => {
    const id = Number(e.target.value);
    if (!id) return;
    if (!selectedObrasSocialesIds.includes(id)) {
      setSelectedObrasSocialesIds((prev) => [...prev, id]);
    }
    e.target.value = '';
  };

  const handleRemoveObraSocial = (idToRemove) => {
    setSelectedObrasSocialesIds((prev) => prev.filter((id) => id !== idToRemove));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre?.trim() || formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre es obligatorio (mínimo 2 caracteres).';
    }
    if (!formData.apellido?.trim() || formData.apellido.trim().length < 2) {
      newErrors.apellido = 'El apellido es obligatorio (mínimo 2 caracteres).';
    }
    if (!formData.telefono?.trim() || formData.telefono.trim().length < 6) {
      newErrors.telefono = 'El teléfono es obligatorio (mínimo 6 dígitos).';
    }
    if (!formData.fecNac) {
      newErrors.fecNac = 'La fecha de nacimiento es obligatoria.';
    } else {
      const selected = new Date(formData.fecNac);
      const today = new Date();
      if (selected > today) {
        newErrors.fecNac = 'La fecha no puede ser futura.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const patientCuil = paciente?.cuil || user?.cuil;
    if (!patientCuil) {
      setSubmitError('No se encontró el CUIL/DNI del paciente autenticado.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    const payload = {
      cuil: patientCuil,
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      fecNac: new Date(`${formData.fecNac}T00:00:00`).toISOString(),
      genero: formData.genero,
      telefono: formData.telefono.trim(),
      calle: formData.calle?.trim() || null,
      nro: formData.nro?.trim() || null,
      depto: formData.depto?.trim() || null,
      localidad: formData.localidad?.trim() || null,
      provincia: formData.provincia?.trim() || null,
      codPostal: formData.codPostal?.trim() || null,
      obrasSocialesIds: selectedObrasSocialesIds,
    };

    try {
      const updated = await patientService.updatePatientProfile(patientCuil, payload);

      // Nombres de las obras sociales seleccionadas
      const osNames = selectedObrasSocialesIds
        .map((id) => obrasSocialesCatalog.find((os) => os.id === id)?.nombre)
        .filter(Boolean);

      // Actualizar contexto global de usuario para refrescar header y navbar
      if (updateUser) {
        updateUser({
          nombre: payload.nombre,
          apellido: payload.apellido,
          nombreCompleto: `${payload.nombre} ${payload.apellido}`.trim(),
          obrasSociales: osNames,
          obrasSocialesIds: selectedObrasSocialesIds,
        });
      }

      setSuccessMessage('¡Perfil actualizado con éxito!');

      setTimeout(() => {
        if (onSuccess) onSuccess(updated);
        onClose();
      }, 1000);
    } catch (err) {
      const parsed = parseBackendError(err, 'No se pudo actualizar el perfil.');
      setSubmitError(parsed.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cuilDisplay = paciente?.cuil || user?.cuil || 'Sin registrar';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Perfil de Paciente"
      description="Actualiza tus datos personales y gestiona tu cobertura médica"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-3 font-sans text-sm" noValidate>
        {/* Identificador / CUIL (Solo Lectura) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-100/80 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">CUIL / DNI del Paciente</p>
              <p className="text-xs sm:text-sm font-mono font-bold text-slate-900">{cuilDisplay}</p>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-medium">
            Identificador Oficial
          </span>
        </div>

        {/* Alerta de Éxito o Error */}
        {successMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {submitError && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* 1. Datos Personales Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
          <Input
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            error={errors.nombre}
            required
            placeholder="Ej. Martín"
            className="py-1.5 text-sm"
          />

          <Input
            label="Apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            error={errors.apellido}
            required
            placeholder="Ej. Gómez"
            className="py-1.5 text-sm"
          />
        </div>

        {/* Fila compacta de Teléfono, Fecha de Nacimiento y Género */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-start">
          <Input
            label="Teléfono de Contacto"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            error={errors.telefono}
            required
            placeholder="Ej. 381 4123456"
            leadingIcon={<Phone className="w-4 h-4 text-primary-600" />}
            className="py-1.5 text-sm"
          />

          <Input
            label="Fecha de Nacimiento"
            type="date"
            name="fecNac"
            value={formData.fecNac}
            onChange={handleChange}
            error={errors.fecNac}
            required
            leadingIcon={<Calendar className="w-4 h-4 text-primary-600" />}
            className="py-1.5 text-sm"
          />

          <div>
            <label htmlFor="genero-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Género
            </label>
            <select
              id="genero-select"
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              className="w-full h-[38px] px-3 rounded-xl border border-slate-200/80 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro / Prefiero no decir</option>
            </select>
          </div>
        </div>

        {/* 2. Cobertura Médica / Obra Social */}
        <div className="border-t border-slate-200/80 pt-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
              <ShieldPlus className="w-3.5 h-3.5 text-primary-600" strokeWidth={2} />
              Obra Social o Prepaga
            </label>
            <span className="text-[11px] text-slate-400">
              {selectedObrasSocialesIds.length === 0 ? 'Atención Particular' : `${selectedObrasSocialesIds.length} asignada(s)`}
            </span>
          </div>

          {/* Lista de Obras Sociales seleccionadas */}
          <div className="flex flex-wrap gap-1.5 min-h-7 items-center">
            {selectedObrasSocialesIds.length === 0 ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                Atención Particular (Sin Obra Social asociada)
              </span>
            ) : (
              selectedObrasSocialesIds.map((id) => {
                const os = obrasSocialesCatalog.find((item) => item.id === id);
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold shadow-2xs"
                  >
                    <ShieldPlus className="w-3 h-3 text-primary-600" />
                    <span>{os?.nombre || `Obra Social #${id}`}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveObraSocial(id)}
                      className="p-0.5 rounded-full hover:bg-sky-200 text-sky-600 hover:text-sky-900 transition-colors ml-0.5"
                      title="Quitar obra social"
                      aria-label={`Quitar ${os?.nombre || id}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })
            )}
          </div>

          {/* Selector para agregar / cambiar obra social */}
          <div>
            <select
              id="select-add-os"
              defaultValue=""
              onChange={handleAddObraSocial}
              disabled={isLoadingCatalogs}
              className="w-full h-9 px-3 rounded-lg border border-slate-200/80 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="" disabled>
                {isLoadingCatalogs ? 'Cargando obras sociales...' : '+ Agregar o cambiar Obra Social / Prepaga...'}
              </option>
              {obrasSocialesCatalog
                .filter((os) => !selectedObrasSocialesIds.includes(os.id))
                .map((os) => (
                  <option key={os.id} value={os.id}>
                    {os.nombre}
                  </option>
                ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              Selecciona una obra social de la lista para añadirla. Puedes removerlas con la cruz si cambiaste de cobertura.
            </p>
          </div>
        </div>

        {/* 3. Domicilio (Opcional desplegable) */}
        <div className="border-t border-slate-200/80 pt-2.5">
          <button
            type="button"
            onClick={() => setShowAddressSection(!showAddressSection)}
            className="text-xs font-semibold text-primary-700 hover:text-primary-800 flex items-center gap-1.5 focus:outline-none"
          >
            <MapPin className="w-3.5 h-3.5 text-primary-600" />
            <span>{showAddressSection ? 'Ocultar datos de domicilio' : 'Editar domicilio (opcional)'}</span>
          </button>

          {showAddressSection && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 p-2.5 bg-slate-50/60 rounded-xl border border-slate-200/60 animate-in fade-in-50 duration-200 items-start">
              <div className="col-span-2">
                <Input
                  label="Calle"
                  name="calle"
                  value={formData.calle}
                  onChange={handleChange}
                  placeholder="Ej. Av. Aconquija"
                  className="py-1.5 text-xs"
                />
              </div>
              <Input
                label="Nro"
                name="nro"
                value={formData.nro}
                onChange={handleChange}
                placeholder="Ej. 1450"
                className="py-1.5 text-xs"
              />
              <Input
                label="Depto / Piso"
                name="depto"
                value={formData.depto}
                onChange={handleChange}
                placeholder="Ej. 3B"
                className="py-1.5 text-xs"
              />
              <div className="col-span-2">
                <Input
                  label="Localidad"
                  name="localidad"
                  value={formData.localidad}
                  onChange={handleChange}
                  placeholder="Ej. Yerba Buena"
                  className="py-1.5 text-xs"
                />
              </div>
              <div className="col-span-2">
                <Input
                  label="Código Postal"
                  name="codPostal"
                  value={formData.codPostal}
                  onChange={handleChange}
                  placeholder="Ej. 4107"
                  className="py-1.5 text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-slate-200/80">
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
            disabled={isSubmitting}
            className="gap-1.5 shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-white" />
                <span>Guardar Cambios</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
