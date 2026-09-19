import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Shield, CheckCircle2, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { patientService } from '../../patient/services/patientService';

export const CreateWalkInPatientModal = ({
  isOpen,
  onClose,
  onPatientCreated,
}) => {
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    obraSocialId: '',
    numeroAfiliado: '',
  });

  const [obrasSociales, setObrasSociales] = useState([]);
  const [loadingObrasSociales, setLoadingObrasSociales] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createdPatient, setCreatedPatient] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        dni: '',
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        obraSocialId: '',
        numeroAfiliado: '',
      });
      setError(null);
      setCreatedPatient(null);
      setCopied(false);

      const fetchObrasSociales = async () => {
        try {
          setLoadingObrasSociales(true);
          const data = await patientService.getHealthInsurances();
          setObrasSociales(Array.isArray(data) ? data : []);
        } catch {
          // Si falla, se permite continuar sin selección
          setObrasSociales([]);
        } finally {
          setLoadingObrasSociales(false);
        }
      };

      fetchObrasSociales();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanDni = formData.dni.replace(/\D/g, '');
    if (!cleanDni || cleanDni.length < 7 || cleanDni.length > 9) {
      setError('El DNI debe tener entre 7 y 9 dígitos numéricos.');
      return;
    }

    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      setError('Nombre y Apellido son obligatorios.');
      return;
    }

    if (!formData.telefono.trim()) {
      setError('El número de teléfono es obligatorio para contactar al paciente.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        dni: cleanDni,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        telefono: formData.telefono.trim(),
        email: formData.email.trim() || null,
        obraSocialId: formData.obraSocialId ? Number(formData.obraSocialId) : null,
        numeroAfiliado: formData.numeroAfiliado.trim() || null,
      };

      const result = await patientService.registerWalkInPatient(payload);
      setCreatedPatient(result);
      if (onPatientCreated) {
        onPatientCreated(result);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Error al dar de alta al paciente presencial. Verifique los datos e intente nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdPatient) return;
    const text = `Usuario: ${createdPatient.nombreUsuario || createdPatient.dni}\nContraseña Provisional: ${createdPatient.contrasenaProvisoria || `Tempus.${createdPatient.dni}!`}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Paciente Presencial (Walk-in)"
      description="Alta inmediata en mesa de recepción sin verificación de correo requerida."
      maxWidth="max-w-lg"
    >
      {createdPatient ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">¡Paciente registrado con éxito!</p>
              <p className="text-xs text-teal-700 mt-1">
                El paciente <strong>{createdPatient.nombre} {createdPatient.apellido}</strong> (DNI: {createdPatient.dni}) ya está activo en el sistema y habilitado para reservar turnos de inmediato.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Credenciales de Acceso Provisorio</span>
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-800 font-medium cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado' : 'Copiar datos'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-sans font-medium uppercase">Usuario (DNI)</span>
                <span className="font-bold text-slate-800">{createdPatient.nombreUsuario || createdPatient.dni}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-sans font-medium uppercase">Contraseña Provisoria</span>
                <span className="font-bold text-slate-800">{createdPatient.contrasenaProvisoria || `Tempus.${createdPatient.dni}!`}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Entrega estas credenciales al paciente si desea consultar sus turnos o historia clínica desde la web más tarde.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={onClose} className="rounded-xl w-full sm:w-auto">
              Listo, Continuar a Recepción
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                label="DNI / Documento"
                name="dni"
                id="walkin-dni"
                placeholder="Ej. 38123456"
                value={formData.dni}
                onChange={handleChange}
                required
                maxLength={9}
              />
            </div>
            <div>
              <Input
                label="Teléfono de Contacto"
                name="telefono"
                id="walkin-telefono"
                placeholder="Ej. 11-4567-8901"
                value={formData.telefono}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                label="Nombre"
                name="nombre"
                id="walkin-nombre"
                placeholder="Ej. Carlos"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Input
                label="Apellido"
                name="apellido"
                id="walkin-apellido"
                placeholder="Ej. Gómez"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <Input
              label="Correo Electrónico (Opcional)"
              name="email"
              id="walkin-email"
              type="email"
              placeholder="correo@ejemplo.com (Opcional)"
              value={formData.email}
              onChange={handleChange}
              helperText="Si se omite, se generará una casilla provisional vinculada a su DNI."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label htmlFor="walkin-obra-social" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Obra Social (Opcional)
              </label>
              <select
                id="walkin-obra-social"
                name="obraSocialId"
                value={formData.obraSocialId}
                onChange={handleChange}
                disabled={loadingObrasSociales}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Particular / Sin Cobertura</option>
                {obrasSociales.map((os) => (
                  <option key={os.id} value={os.id}>
                    {os.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Input
                label="N° de Afiliado (Opcional)"
                name="numeroAfiliado"
                id="walkin-afiliado"
                placeholder="Ej. 001-9876543-0"
                value={formData.numeroAfiliado}
                onChange={handleChange}
                disabled={!formData.obraSocialId}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="rounded-xl font-semibold gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registrando...</span>
                </>
              ) : (
                <span>Dar de Alta Paciente</span>
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
