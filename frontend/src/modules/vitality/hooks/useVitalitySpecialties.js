import { useState, useEffect, useCallback, useMemo } from 'react';
import { vitalityService } from '../services/vitalityService';
import { useToast } from '../../../shared/components/ui/Toast';
import { useConfirmDelete } from '../../../shared/hooks/useConfirmDelete';

/**
 * Hook para la gestión integral del Catálogo de Especialidades y Estudios Médicos (Super Admin).
 */
export const useVitalitySpecialties = () => {
  const { addToast } = useToast();
  const { confirmDelete } = useConfirmDelete();
  const [specialties, setSpecialties] = useState([]);
  const [studies, setStudies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSpecialtyId, setExpandedSpecialtyId] = useState(null);

  // Modales
  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);

  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [editingStudy, setEditingStudy] = useState(null);
  const [targetSpecialtyForStudy, setTargetSpecialtyForStudy] = useState(null);

  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [specData, studiesData] = await Promise.all([
        vitalityService.getSpecialties(),
        vitalityService.getAllStudies(),
      ]);
      setSpecialties(specData || []);
      setStudies(studiesData || []);
    } catch (err) {
      setError(err.message || 'Error al obtener el catálogo de especialidades y estudios.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ===============================
  // ESPECIALIDADES CRUD
  // ===============================
  const openCreateSpecialtyModal = () => {
    setEditingSpecialty(null);
    setIsSpecialtyModalOpen(true);
  };

  const openEditSpecialtyModal = (specialty) => {
    setEditingSpecialty(specialty);
    setIsSpecialtyModalOpen(true);
  };

  const closeSpecialtyModal = () => {
    setIsSpecialtyModalOpen(false);
    setEditingSpecialty(null);
  };

  const handleSaveSpecialty = async ({ id, nombre, descripcion }) => {
    try {
      setIsSubmitting(true);
      if (id) {
        await vitalityService.updateSpecialty({ id, nombre, descripcion });
        addToast({
          title: 'Especialidad Actualizada',
          description: `Se modificó "${nombre}" exitosamente.`,
          variant: 'success',
        });
      } else {
        await vitalityService.createSpecialty({ nombre, descripcion });
        addToast({
          title: 'Especialidad Creada',
          description: `Se dio de alta "${nombre}" en el catálogo.`,
          variant: 'success',
        });
      }
      closeSpecialtyModal();
      await fetchData();
      return true;
    } catch (err) {
      addToast({
        title: 'Error al Guardar Especialidad',
        description: err.message || 'No se pudo procesar la solicitud.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSpecialty = async (id, nombre) => {
    const studiesOfSpec = studies.filter((s) => s.especialidadId === id);
    const message =
      studiesOfSpec.length > 0
        ? `La especialidad "${nombre}" tiene ${studiesOfSpec.length} estudios asociados. ¿Deseas eliminarla definitivamente junto con sus estudios vinculados?`
        : `¿Estás seguro de que deseas eliminar definitivamente la especialidad "${nombre}" del catálogo general?`;

    const ok = await confirmDelete({
      title: '¿Eliminar especialidad definitivamente?',
      message,
      itemName: nombre,
      confirmText: 'Sí, eliminar definitivamente',
      cancelText: 'Cancelar',
    });
    if (!ok) return false;

    try {
      await vitalityService.deleteSpecialty(id);
      addToast({
        title: 'Especialidad Eliminada',
        description: `Se eliminó "${nombre}" del catálogo.`,
        variant: 'info',
      });
      if (expandedSpecialtyId === id) {
        setExpandedSpecialtyId(null);
      }
      await fetchData();
      return true;
    } catch (err) {
      addToast({
        title: 'Error al Eliminar Especialidad',
        description: err.message || 'No se pudo eliminar la especialidad.',
        variant: 'error',
      });
      return false;
    }
  };

  // ===============================
  // ESTUDIOS CRUD
  // ===============================
  const openCreateStudyModal = (specialtyId = null) => {
    setEditingStudy(null);
    setTargetSpecialtyForStudy(specialtyId || (specialties[0]?.id ?? null));
    setIsStudyModalOpen(true);
  };

  const openEditStudyModal = (study) => {
    setEditingStudy(study);
    setTargetSpecialtyForStudy(study.especialidadId);
    setIsStudyModalOpen(true);
  };

  const closeStudyModal = () => {
    setIsStudyModalOpen(false);
    setEditingStudy(null);
    setTargetSpecialtyForStudy(null);
  };

  const handleSaveStudy = async ({ id, nombre, descripcion, duracion, preparacion, especialidadId }) => {
    try {
      setIsSubmitting(true);
      if (id) {
        await vitalityService.updateStudy({
          id,
          nombre,
          descripcion,
          duracion,
          preparacion,
          especialidadId,
        });
        addToast({
          title: 'Estudio Modificado',
          description: `Se actualizó el estudio "${nombre}" (${duracion} min).`,
          variant: 'success',
        });
      } else {
        await vitalityService.createStudy({
          nombre,
          descripcion,
          duracion,
          preparacion,
          especialidadId,
        });
        addToast({
          title: 'Estudio Creado',
          description: `Se dio de alta el estudio "${nombre}" con duración obligatoria de ${duracion} min.`,
          variant: 'success',
        });
      }
      closeStudyModal();
      await fetchData();
      return true;
    } catch (err) {
      addToast({
        title: 'Error al Guardar Estudio',
        description: err.message || 'No se pudo guardar el estudio médico.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudy = async (id, nombre) => {
    const ok = await confirmDelete({
      title: '¿Eliminar estudio definitivamente?',
      message: `¿Estás seguro de que deseas eliminar el estudio "${nombre}" del catálogo? Se removerá de las coberturas y prestaciones asociadas.`,
      itemName: nombre,
      confirmText: 'Sí, eliminar definitivamente',
      cancelText: 'Cancelar',
    });
    if (!ok) return false;

    try {
      await vitalityService.deleteStudy(id);
      addToast({
        title: 'Estudio Eliminado',
        description: `Se eliminó el estudio "${nombre}" del catálogo.`,
        variant: 'info',
      });
      await fetchData();
      return true;
    } catch (err) {
      addToast({
        title: 'Error al Eliminar Estudio',
        description: err.message || 'No se pudo eliminar el estudio.',
        variant: 'error',
      });
      return false;
    }
  };

  // Mapeo enriquecido de especialidades con sus estudios
  const enrichedSpecialties = useMemo(() => {
    return specialties.map((spec) => {
      const associatedStudies = studies.filter((s) => s.especialidadId === spec.id);
      return {
        ...spec,
        estudios: associatedStudies,
        totalEstudios: associatedStudies.length,
      };
    });
  }, [specialties, studies]);

  // Estadísticas globales
  const stats = useMemo(() => {
    const totalSpecialties = specialties.length;
    const totalStudies = studies.length;
    const avgDuration = totalStudies > 0
      ? Math.round(studies.reduce((acc, s) => acc + (s.duracion || 0), 0) / totalStudies)
      : 30;

    return {
      totalSpecialties,
      totalStudies,
      avgDuration,
    };
  }, [specialties, studies]);

  return {
    specialties: enrichedSpecialties,
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
    saveSpecialty: handleSaveSpecialty,
    deleteSpecialty: handleDeleteSpecialty,
    // Estudios
    isStudyModalOpen,
    editingStudy,
    targetSpecialtyForStudy,
    openCreateStudyModal,
    openEditStudyModal,
    closeStudyModal,
    saveStudy: handleSaveStudy,
    deleteStudy: handleDeleteStudy,
    refreshData: fetchData,
  };
};
