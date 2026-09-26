import React, { useState, useMemo } from 'react';
import { useVitalitySpecialties } from '../hooks/useVitalitySpecialties';
import { SpecialtyModal } from '../components/SpecialtyModal';
import { StudyModal } from '../components/StudyModal';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import {
  Stethoscope,
  Activity,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

/**
 * Pestaña de Gestión de Catálogo de Especialidades y Estudios Médicos (Super Admin Vitality).
 * Permite realizar ABM de especialidades y gestionar dentro de cada una sus estudios asociados,
 * con duración obligatoria en minutos.
 */
export const VitalitySpecialtiesPage = () => {
  const {
    specialties,
    studies,
    stats,
    isLoading,
    isSubmitting,
    expandedSpecialtyId,
    setExpandedSpecialtyId,
    // Especialidades
    isSpecialtyModalOpen,
    editingSpecialty,
    openCreateSpecialtyModal,
    openEditSpecialtyModal,
    closeSpecialtyModal,
    saveSpecialty,
    deleteSpecialty,
    // Estudios
    isStudyModalOpen,
    editingStudy,
    targetSpecialtyForStudy,
    openCreateStudyModal,
    openEditStudyModal,
    closeStudyModal,
    saveStudy,
    deleteStudy,
  } = useVitalitySpecialties();

  const [searchTerm, setSearchTerm] = useState('');

  // Filtrado reactivo por término de búsqueda en especialidad o estudio
  const filteredSpecialties = useMemo(() => {
    if (!searchTerm.trim()) return specialties;
    const term = searchTerm.toLowerCase();

    return specialties.filter((spec) => {
      const matchName = spec.nombre?.toLowerCase().includes(term);
      const matchDesc = spec.descripcion?.toLowerCase().includes(term);
      const matchStudy = spec.estudios?.some(
        (s) => s.nombre?.toLowerCase().includes(term) || s.descripcion?.toLowerCase().includes(term)
      );
      return matchName || matchDesc || matchStudy;
    });
  }, [specialties, searchTerm]);

  const toggleExpand = (id) => {
    setExpandedSpecialtyId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
            Catálogo de Especialidades y Estudios
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Administración centralizada de ramas médicas y definición obligatoria de estudios con duración en minutos.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="primary"
            onClick={openCreateSpecialtyModal}
            className="gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>Nueva Especialidad</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas de Catálogo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Especialidades Médicas</p>
            <p className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mt-1">{stats.totalSpecialties}</p>
            <span className="text-[11px] text-primary-700 font-medium mt-1 block">Áreas registradas</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estudios Clínicos Totales</p>
            <p className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mt-1">{stats.totalStudies}</p>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Prácticas homologadas</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Duración Promedio</p>
            <p className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mt-1">{stats.avgDuration} min</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Franja habitual por slot</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Barra de Filtro y Búsqueda */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-1.5 flex-shrink-0" strokeWidth={2} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar especialidad o estudio médico en el catálogo..."
          className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-md"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Listado de Especialidades y Acordeón de Estudios */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Cargando catálogo médico...</p>
        </div>
      ) : filteredSpecialties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No se encontraron especialidades</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm ? 'Intenta modificar el término de búsqueda.' : 'Comienza registrando la primera especialidad médica.'}
          </p>
          {!searchTerm && (
            <Button size="sm" variant="primary" onClick={openCreateSpecialtyModal} className="mt-4">
              <Plus className="w-4 h-4 mr-1.5" /> Nueva Especialidad
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSpecialties.map((spec) => {
            const isExpanded = expandedSpecialtyId === spec.id;
            const studiesList = spec.estudios || [];

            return (
              <div
                key={spec.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
              >
                {/* Cabecera de la Especialidad */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-primary-100 to-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0 border border-primary-200/60 shadow-xs">
                      <Stethoscope className="w-5 h-5" strokeWidth={2} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-bold font-heading text-slate-900 leading-tight">
                          {spec.nombre}
                        </h3>
                        <Badge variant="primary" size="sm">
                          {studiesList.length} {studiesList.length === 1 ? 'estudio' : 'estudios'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {spec.descripcion || 'Sin descripción detallada.'}
                      </p>
                    </div>
                  </div>

                  {/* Acciones de la Especialidad */}
                  <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openCreateStudyModal(spec.id)}
                      className="gap-1.5 text-xs text-primary-700 hover:bg-primary-50 border-primary-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Estudio</span>
                    </Button>

                    <button
                      type="button"
                      onClick={() => openEditSpecialtyModal(spec)}
                      title="Editar Especialidad"
                      className="p-2 rounded-xl text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <Pencil className="w-4 h-4" strokeWidth={2} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteSpecialty(spec.id, spec.nombre)}
                      title="Eliminar Especialidad"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2} />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExpand(spec.id)}
                      title={isExpanded ? 'Contraer estudios' : 'Desplegar estudios'}
                      className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" strokeWidth={2} />
                      ) : (
                        <ChevronDown className="w-4 h-4" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Sub-sección Desplegable: Estudios de la Especialidad */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/60 p-4 sm:p-5 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary-600" />
                        <h4 className="text-xs font-bold font-heading text-slate-800 uppercase tracking-wider">
                          Estudios Médicos Registrados en {spec.nombre}
                        </h4>
                      </div>

                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => openCreateStudyModal(spec.id)}
                        className="gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Nuevo Estudio</span>
                      </Button>
                    </div>

                    {studiesList.length === 0 ? (
                      <div className="bg-white rounded-xl border border-dashed border-slate-200 p-6 text-center">
                        <p className="text-xs text-slate-500">
                          Aún no hay estudios configurados para esta especialidad.
                        </p>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => openCreateStudyModal(spec.id)}
                          className="mt-2.5"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Definir primer estudio
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {studiesList.map((st) => (
                          <div
                            key={st.id}
                            className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs hover:border-primary-300 transition-all flex flex-col justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="font-bold text-sm text-slate-900 leading-snug">
                                  {st.nombre}
                                </h5>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800 flex-shrink-0">
                                  <Clock className="w-3 h-3 text-amber-600" strokeWidth={2.5} />
                                  <span>{st.duracion} min</span>
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                {st.descripcion || 'Sin descripción clínica específica.'}
                              </p>

                              {st.preparacion && (
                                <div className="mt-2 pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-500">
                                  <FileCheck2 className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                  <span className="line-clamp-2">
                                    <strong className="text-slate-700 font-semibold">Prep:</strong> {st.preparacion}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-50">
                              <button
                                type="button"
                                onClick={() => openEditStudyModal(st)}
                                title="Editar Estudio"
                                className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-primary-700 hover:bg-primary-50 transition-colors flex items-center gap-1"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteStudy(st.id, st.nombre)}
                                title="Eliminar Estudio"
                                className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Eliminar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Especialidad (Alta / Edición) */}
      <SpecialtyModal
        isOpen={isSpecialtyModalOpen}
        onClose={closeSpecialtyModal}
        specialty={editingSpecialty}
        onSubmit={saveSpecialty}
        isSubmitting={isSubmitting}
      />

      {/* Modal de Estudio (Alta / Edición con Duración Obligatoria) */}
      <StudyModal
        isOpen={isStudyModalOpen}
        onClose={closeStudyModal}
        study={editingStudy}
        specialties={specialties}
        defaultSpecialtyId={targetSpecialtyForStudy}
        onSubmit={saveStudy}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default VitalitySpecialtiesPage;
