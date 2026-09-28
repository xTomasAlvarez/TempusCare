import { useState, useEffect, useCallback } from 'react';
import { institutionAdminService } from '../services/institutionAdminService';
import { useToast } from '../../../shared/components/ui/Toast';
import { useConfirmDelete } from '../../../shared/hooks/useConfirmDelete';

/**
 * Hook para la administración exclusiva de un Consultorio / Sede física.
 * Gestiona los asistentes de la sede y los profesionales vinculados.
 */
export const useConsultorioAdmin = (consultorioCuit) => {
  const [consultorio, setConsultorio] = useState(null);
  const [asistentes, setAsistentes] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [allProfesionales, setAllProfesionales] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para Modal de Edición de Asistente
  const [editingAsistente, setEditingAsistente] = useState(null);
  const [isEditAsistenteModalOpen, setIsEditAsistenteModalOpen] = useState(false);

  // Estados para Modal de Edición de Profesional
  const [editingProfesional, setEditingProfesional] = useState(null);
  const [isEditProfesionalModalOpen, setIsEditProfesionalModalOpen] = useState(false);

  const { addToast } = useToast();
  const { confirmDelete } = useConfirmDelete();

  const loadData = useCallback(async () => {
    if (!consultorioCuit) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [consData, asisData, profsData, todosProfs, espData] = await Promise.all([
        institutionAdminService.getConsultorioByCuit(consultorioCuit).catch(() => null),
        institutionAdminService.getAsistentes(consultorioCuit).catch(() => []),
        institutionAdminService.getConsultorioProfesionales(consultorioCuit).catch(() => []),
        institutionAdminService.getProfesionales().catch(() => []),
        institutionAdminService.getEspecialidades().catch(() => []),
      ]);

      setConsultorio(consData);
      setAsistentes(asisData);
      setProfesionales(profsData);
      setAllProfesionales(todosProfs);
      setEspecialidades(espData);
    } catch (err) {
      addToast({
        title: 'Error de sincronización',
        description: 'Error al sincronizar los recursos del consultorio: ' + (err.message || 'Error desconocido'),
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [consultorioCuit, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================
  // Acciones sobre Asistentes (ABM)
  // ==========================================

  const createAsistente = async (dto) => {
    try {
      setIsSubmitting(true);
      await institutionAdminService.createAsistente(dto);
      addToast({
        title: 'Asistente Registrado',
        description: `Asistente ${dto.nombre} ${dto.apellido} registrado exitosamente en la sede.`,
        variant: 'success',
      });
      await loadData();
      return true;
    } catch (err) {
      addToast({
        title: 'Error de Registro',
        description: err.message || 'No se pudo registrar el asistente.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAsistente = async (cuil, dto) => {
    try {
      setIsSubmitting(true);
      await institutionAdminService.updateAsistente(cuil, dto);
      addToast({
        title: 'Asistente Actualizado',
        description: `Los datos del asistente ${dto.nombre} ${dto.apellido} se actualizaron correctamente.`,
        variant: 'success',
      });
      setIsEditAsistenteModalOpen(false);
      setEditingAsistente(null);
      await loadData();
      return true;
    } catch (err) {
      addToast({
        title: 'Error de Modificación',
        description: err.message || 'No se pudieron actualizar los datos del asistente.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAsistente = async (cuil, nombreCompleto) => {
    const ok = await confirmDelete({
      title: '¿Dar de baja asistente definitivamente?',
      message: `¿Estás seguro de que deseas dar de baja al asistente ${nombreCompleto || cuil}? Perderá el acceso de gestión para esta sede.`,
      itemName: nombreCompleto || cuil,
      confirmText: 'Sí, eliminar definitivamente',
      cancelText: 'Cancelar',
    });
    if (!ok) return false;

    try {
      setIsSubmitting(true);
      await institutionAdminService.deleteAsistente(cuil);
      addToast({
        title: 'Asistente Desvinculado',
        description: `Asistente ${nombreCompleto || cuil} desvinculado de la sede.`,
        variant: 'success',
      });
      await loadData();
      return true;
    } catch (err) {
      addToast({
        title: 'Error al dar de baja',
        description: err.message || 'No se pudo dar de baja al asistente.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditAsistenteModal = (asis) => {
    setEditingAsistente(asis);
    setIsEditAsistenteModalOpen(true);
  };

  const closeEditAsistenteModal = () => {
    setIsEditAsistenteModalOpen(false);
    setEditingAsistente(null);
  };

  // ==========================================
  // Acciones sobre Profesionales (ABM - Solo Cuentas)
  // ==========================================

  const assignProfesional = async (cuil) => {
    if (!consultorioCuit || !cuil) return false;

    try {
      setIsSubmitting(true);
      await institutionAdminService.assignProfesionalToConsultorio(consultorioCuit, cuil);
      addToast({
        title: 'Profesional Vinculado',
        description: 'Profesional vinculado correctamente a esta sede.',
        variant: 'success',
      });
      await loadData();
      return true;
    } catch (err) {
      addToast({
        title: 'Error de Vinculación',
        description: err.message || 'No se pudo vincular al profesional.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeProfesional = async (cuil, nombreCompleto) => {
    const ok = await confirmDelete({
      title: '¿Desvincular médico de la sede definitivamente?',
      message: `¿Estás seguro de que deseas desvincular al Dr./Dra. ${nombreCompleto || cuil} de esta sede física? No se podrán agendar nuevos turnos para este profesional en este consultorio.`,
      itemName: `Dr./Dra. ${nombreCompleto || cuil}`,
      confirmText: 'Sí, eliminar definitivamente',
      cancelText: 'Cancelar',
    });
    if (!ok) return false;

    try {
      setIsSubmitting(true);
      await institutionAdminService.removeProfesionalFromConsultorio(consultorioCuit, cuil);
      addToast({
        title: 'Profesional Desvinculado',
        description: `El profesional ${nombreCompleto || cuil} fue desvinculado de la sede.`,
        variant: 'success',
      });
      await loadData();
      return true;
    } catch (err) {
      addToast({
        title: 'Error de Desvinculación',
        description: err.message || 'No se pudo desvincular al profesional.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const registerDoctor = async (dto) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...dto,
        consultoriosCuits: [consultorioCuit],
      };
      await institutionAdminService.registerDoctor(payload);
      addToast({
        title: 'Profesional Registrado',
        description: `Dr./Dra. ${dto.nombre} ${dto.apellido} registrado y habilitado para esta sede.`,
        variant: 'success',
      });
      await loadData();
      return true;
    } catch (err) {
      addToast({
        title: 'Error de Registro',
        description: err.message || 'No se pudo registrar al profesional.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDoctor = async (cuil, dto) => {
    try {
      setIsSubmitting(true);
      await institutionAdminService.updateDoctor(cuil, dto);
      addToast({
        title: 'Profesional Actualizado',
        description: `Dr./Dra. ${dto.nombre} ${dto.apellido} actualizado exitosamente.`,
        variant: 'success',
      });
      setIsEditProfesionalModalOpen(false);
      setEditingProfesional(null);
      await loadData();
      return true;
    } catch (err) {
      addToast({
        title: 'Error de Modificación',
        description: err.message || 'No se pudo modificar la cuenta del profesional.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteDoctor = async (cuil, nombreCompleto) => {
    const ok = await confirmDelete({
      title: '¿Dar de baja médico definitivamente?',
      message: `¿Estás seguro de que deseas dar de baja la cuenta del Dr./Dra. ${nombreCompleto || cuil}? Se eliminará permanentemente del cuerpo médico del sistema.`,
      itemName: `Dr./Dra. ${nombreCompleto || cuil}`,
      confirmText: 'Sí, dar de baja definitivamente',
      cancelText: 'Cancelar',
    });
    if (!ok) return false;

    try {
      setIsSubmitting(true);
      await institutionAdminService.deleteDoctor(cuil);
      addToast({
        title: 'Médico Dado de Baja',
        description: `Se dio de baja la cuenta del Dr./Dra. ${nombreCompleto || cuil} correctamente.`,
        variant: 'success',
      });
      await loadData();
      return true;
    } catch (err) {
      addToast({
        title: 'Error al dar de baja',
        description: err.message || 'No se pudo dar de baja la cuenta del profesional.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditProfesionalModal = (prof) => {
    setEditingProfesional(prof);
    setIsEditProfesionalModalOpen(true);
  };

  const closeEditProfesionalModal = () => {
    setIsEditProfesionalModalOpen(false);
    setEditingProfesional(null);
  };

  return {
    consultorio,
    asistentes,
    profesionales,
    allProfesionales,
    especialidades,
    isLoading,
    isSubmitting,
    createAsistente,
    updateAsistente,
    deleteAsistente,
    assignProfesional,
    removeProfesional,
    registerDoctor,
    updateDoctor,
    deleteDoctor,
    editingAsistente,
    isEditAsistenteModalOpen,
    openEditAsistenteModal,
    closeEditAsistenteModal,
    editingProfesional,
    isEditProfesionalModalOpen,
    openEditProfesionalModal,
    closeEditProfesionalModal,
    refresh: loadData,
  };
};
