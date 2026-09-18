import React, { useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Stethoscope, Search, UserCheck } from 'lucide-react';

/**
 * Modal para vincular un Profesional a la sede física actual.
 */
export const AssignProfesionalModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  availableProfesionales = [],
  alreadyAssignedCuils = [],
  sedeNombre = '',
}) => {
  const [selectedCuil, setSelectedCuil] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCuil) return;

    const success = await onSubmit(selectedCuil);
    if (success) {
      setSelectedCuil('');
      setSearchQuery('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vincular Profesional a la Sede"
      description={`Asigna un médico del catálogo general para atender en "${sedeNombre}".`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs sm:text-sm">
        {/* Buscador Rápido */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, matrícula o CUIL..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
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
                    isSelected ? 'bg-teal-50/70 border-l-4 border-l-teal-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="selectedDoctor"
                    value={prof.cuil}
                    checked={isSelected}
                    onChange={() => setSelectedCuil(prof.cuil)}
                    className="mt-1 text-teal-600 focus:ring-teal-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold font-heading text-slate-900 truncate">
                        Dr./Dra. {prof.nombre} {prof.apellido}
                      </p>
                      <Badge variant="teal" size="sm">
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
            <UserCheck className="w-4 h-4 mr-1.5" />
            Vincular a la Sede
          </Button>
        </div>
      </form>
    </Modal>
  );
};
