import React, { useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Input } from '../../../shared/components/ui/Input';
import { Stethoscope, Search, Link2, AlertCircle } from 'lucide-react';
import { profesionalSchema } from '../../../shared/validation/schemas';
import { validateWithSchema, parseBackendError } from '../../../shared/validation/validateForm';

/**
 * Modal para vincular un profesional existente o dar de alta un nuevo médico para la sede física.
 * Cumple con la cadena de mando: Admin Consultorio es el único que gestiona los médicos de su sede.
 */
export const AssignProfesionalModal = ({
  isOpen,
  onClose,
  onSubmit,
  onRegisterDoctor,
  isSubmitting,
  availableProfesionales = [],
  alreadyAssignedCuils = [],
  sedeNombre = '',
}) => {
  const [mode, setMode] = useState('link'); // 'link' | 'create'
  const [selectedCuil, setSelectedCuil] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Formulario de alta nuevo médico
  const [newDoctor, setNewDoctor] = useState({
    cuil: '',
    nombre: '',
    apellido: '',
    matricula: '',
    telefono: '',
    genero: 'Otro',
    fecNac: '1985-06-15',
  });
  const [createError, setCreateError] = useState(null);
  const [createFieldErrors, setCreateFieldErrors] = useState({});

  // Filtrar médicos no asignados aún y que coincidan con la búsqueda
  const unassigned = availableProfesionales.filter(
    (p) => !alreadyAssignedCuils.includes(p.cuil)
  );

  const filtered = unassigned.filter((p) => {
    const q = searchQuery.toLowerCase();
    const nombreCompleto = `${p.nombre} ${p.apellido}`.toLowerCase();
    const matricula = (p.matricula || '').toLowerCase();
    const cuil = (p.cuil || '').toLowerCase();
    return nombreCompleto.includes(q) || matricula.includes(q) || cuil.includes(q);
  });

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCuil) return;

    const success = await onSubmit(selectedCuil);
    if (success) {
      setSelectedCuil('');
      setSearchQuery('');
      onClose();
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError(null);
    setCreateFieldErrors({});

    const { isValid, errors: validationErrors, data: sanitizedData } = validateWithSchema(
      profesionalSchema,
      newDoctor
    );

    if (!isValid) {
      setCreateFieldErrors(validationErrors);
      setCreateError(Object.values(validationErrors)[0]);
      return;
    }

    // Validación preventiva en memoria si el CUIL ya está vinculado
    if (alreadyAssignedCuils.includes(sanitizedData.cuil)) {
      setCreateFieldErrors((p) => ({ ...p, cuil: 'Este profesional ya está vinculado a esta sede.' }));
      setCreateError('Este profesional ya está vinculado a esta sede.');
      return;
    }

    if (!onRegisterDoctor) {
      setCreateError('Función de registro no disponible.');
      return;
    }

    try {
      const success = await onRegisterDoctor({
        cuil: sanitizedData.cuil,
        nombre: sanitizedData.nombre,
        apellido: sanitizedData.apellido,
        matricula: sanitizedData.matricula,
        telefono: sanitizedData.telefono,
        genero: sanitizedData.genero,
        fecNac: sanitizedData.fecNac,
      });

      if (success) {
        setNewDoctor({
          cuil: '',
          nombre: '',
          apellido: '',
          matricula: '',
          telefono: '',
          genero: 'Otro',
          fecNac: '1985-06-15',
        });
        setCreateFieldErrors({});
        onClose();
      }
    } catch (err) {
      const parsed = parseBackendError(err, 'Error al registrar profesional.');
      setCreateError(parsed.message);
      if (parsed.isDuplicate) {
        setCreateFieldErrors((p) => ({ ...p, cuil: parsed.message }));
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestión de Profesionales de la Sede"
      description={`Administra el plantel médico habilitado para atender en "${sedeNombre}".`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Toggle de Modo: Vincular Existente vs Nuevo Médico */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('link')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'link'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Vincular del Catálogo</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'create'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Dar de Alta Nuevo Médico</span>
          </button>
        </div>

        {mode === 'link' ? (
          <form onSubmit={handleLinkSubmit} className="space-y-4 font-sans text-xs sm:text-sm">
            {/* Buscador Rápido */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, matrícula o CUIL..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              />
            </div>

            {/* Lista Seleccionable de Médicos */}
            <div className="border border-slate-200 rounded-xl max-h-64 overflow-y-auto divide-y divide-slate-100 bg-white shadow-inner">
              {filtered.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  {unassigned.length === 0
                    ? 'Todos los profesionales registrados ya están vinculados a esta sede.'
                    : 'No se encontraron profesionales con ese criterio.'}
                </div>
              ) : (
                filtered.map((prof) => {
                  const isSelected = selectedCuil === prof.cuil;
                  return (
                    <label
                      key={prof.cuil}
                      className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary-50/70 border-l-4 border-l-primary-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="selectedDoctor"
                        value={prof.cuil}
                        checked={isSelected}
                        onChange={() => setSelectedCuil(prof.cuil)}
                        className="mt-1 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold font-heading text-slate-900 truncate">
                            Dr./Dra. {prof.nombre} {prof.apellido}
                          </p>
                          <Badge variant="primary" size="sm">
                            {prof.matricula ? `Mat. ${prof.matricula}` : 'Activo'}
                          </Badge>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">CUIL: {prof.cuil}</p>
                        {prof.especialidades?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {prof.especialidades.map((esp, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                              >
                                {esp}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            {/* Acciones */}
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
                disabled={!selectedCuil}
              >
                <Stethoscope className="w-4 h-4 mr-1.5" strokeWidth={2} />
                Vincular a la Sede
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateSubmit} className="space-y-3.5 font-sans text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  label="CUIL / CUIT"
                  value={newDoctor.cuil}
                  onChange={(e) => {
                    setNewDoctor((p) => ({ ...p, cuil: e.target.value }));
                    if (createFieldErrors.cuil) setCreateFieldErrors((p) => ({ ...p, cuil: '' }));
                  }}
                  error={createFieldErrors.cuil}
                  placeholder="Ej: 20301234567"
                  maxLength={11}
                  required
                />
              </div>
              <div>
                <Input
                  label="Matrícula Profesional"
                  value={newDoctor.matricula}
                  onChange={(e) => {
                    setNewDoctor((p) => ({ ...p, matricula: e.target.value }));
                    if (createFieldErrors.matricula) setCreateFieldErrors((p) => ({ ...p, matricula: '' }));
                  }}
                  error={createFieldErrors.matricula}
                  placeholder="Ej: MP-9842"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  label="Nombre"
                  value={newDoctor.nombre}
                  onChange={(e) => {
                    setNewDoctor((p) => ({ ...p, nombre: e.target.value }));
                    if (createFieldErrors.nombre) setCreateFieldErrors((p) => ({ ...p, nombre: '' }));
                  }}
                  error={createFieldErrors.nombre}
                  placeholder="Ej: Esteban"
                  required
                />
              </div>
              <div>
                <Input
                  label="Apellido"
                  value={newDoctor.apellido}
                  onChange={(e) => {
                    setNewDoctor((p) => ({ ...p, apellido: e.target.value }));
                    if (createFieldErrors.apellido) setCreateFieldErrors((p) => ({ ...p, apellido: '' }));
                  }}
                  error={createFieldErrors.apellido}
                  placeholder="Ej: Rossi"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  label="Teléfono"
                  value={newDoctor.telefono}
                  onChange={(e) => {
                    setNewDoctor((p) => ({ ...p, telefono: e.target.value }));
                    if (createFieldErrors.telefono) setCreateFieldErrors((p) => ({ ...p, telefono: '' }));
                  }}
                  error={createFieldErrors.telefono}
                  placeholder="Ej: 381-4998877"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Género
                </label>
                <select
                  value={newDoctor.genero}
                  onChange={(e) => setNewDoctor((p) => ({ ...p, genero: e.target.value }))}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <div className="min-h-[20px] flex items-center text-xs text-rose-600 font-medium w-full sm:w-auto">
                {createError && (
                  <span className="flex items-center gap-1 animate-in fade-in-0">
                    <span aria-hidden="true">⚠</span> {createError}
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
                >
                  <Stethoscope className="w-4 h-4 mr-1.5" strokeWidth={2} />
                  Registrar y Habilitar Médico
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
