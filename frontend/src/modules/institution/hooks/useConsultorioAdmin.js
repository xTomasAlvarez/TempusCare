import { useState, useEffect, useCallback } from 'react';
import { institutionAdminService } from '../services/institutionAdminService';
import { useToast } from '../../../shared/components/ui/Toast';

/**
 * Hook para la administración exclusiva de un Consultorio / Sede física.
 * Gestiona los asistentes de la sede y los profesionales vinculados.
 */
export const useConsultorioAdmin = (consultorioCuit) => {
  const [consultorio, setConsultorio] = useState(null);
  const [asistentes, setAsistentes] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [allProfesionales, setAllProfesionales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToast } = useToast();

  const loadData = useCallback(async () => {
    if (!consultorioCuit) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [consData, asisData, profsData, todosProfs] = await Promise.all([
        institutionAdminService.getConsultorioByCuit(consultorioCuit).catch(() => null),
        institutionAdminService.getAsistentes(consultorioCuit).catch(() => []),
        institutionAdminService.getConsultorioProfesionales(consultorioCuit).catch(() => []),
        institutionAdminService.getProfesionales().catch(() => []),
      ]);

      setConsultorio(consData);
      setAsistentes(asisData);
      setProfesionales(profsData);
      setAllProfesionales(todosProfs);
    } catch (err) {
      addToast({
        type: 'error',
        message: 'Error al sincronizar los recursos del consultorio: ' + (err.message || 'Error desconocido'),
      });
    } finally {
      setIsLoading(false);
    }
  }, [consultorioCuit, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================
  // Acciones sobre Asistentes
  // ==========================================

  const createAsistente = async (dto) => {
    try {
      setIsSubmitting(true);
      await institutionAdminService.createAsistente(dto);
      addToast({
        type: 'success',
        message: `Asistente ${dto.nombre} ${dto.apellido} registrado exitosamente en la sede.`,
      });
      await loadData();
      return true;
    } catch (err) {
      addToast({
        type: 'error',
        message: err.message || 'No se pudo registrar el asistente.',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAsistente = async (cuil, nombreCompleto) => {
    if (!window.confirm(`¿Confirmas la baja del asistente ${nombreCompleto || cuil}?`)) {
      return false;
    }

    try {
      setIsSubmitting(true);
      await institutionAdminService.deleteAsistente(cuil);
      addToast({
        type: 'success',
        message: `Asistente ${nombreCompleto || cuil} desvinculado de la sede.`,
      });
      await loadData();
      return true;
    } catch (err) {
      addToast({
        type: 'error',
        message: err.message || 'No se pudo dar de baja al asistente.',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // Acciones sobre Profesionales Vinculados
  // ==========================================

  const assignProfesional = async (cuil) => {
    if (!consultorioCuit || !cuil) return false;

    try {
      setIsSubmitting(true);
      await institutionAdminService.assignProfesionalToConsultorio(consultorioCuit, cuil);
      addToast({
        type: 'success',
        message: 'Profesional vinculado correctamente a esta sede.',
      });
      await loadData();
      return true;
    } catch (err) {
      addToast({
        type: 'error',
        message: err.message || 'No se pudo vincular al profesional.',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeProfesional = async (cuil, nombreCompleto) => {
    if (!window.confirm(`¿Confirmas desvincular al Dr./Dra. ${nombreCompleto || cuil} de esta sede física?`)) {
      return false;
    }

    try {
      setIsSubmitting(true);
      await institutionAdminService.removeProfesionalFromConsultorio(consultorioCuit, cuil);
      addToast({
        type: 'success',
        message: `El profesional ${nombreCompleto || cuil} fue desvinculado de la sede.`,
      });
      await loadData();
      return true;
    } catch (err) {
      addToast({
        type: 'error',
        message: err.message || 'No se pudo desvincular al profesional.',
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
        type: 'success',
        message: `Dr./Dra. ${dto.nombre} ${dto.apellido} registrado y habilitado para esta sede.`,
      });
      await loadData();
      return true;
    } catch (err) {
      addToast({
        type: 'error',
        message: err.message || 'No se pudo registrar al profesional.',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    consultorio,
    asistentes,
    profesionales,
    allProfesionales,
    isLoading,
    isSubmitting,
    createAsistente,
    deleteAsistente,
    assignProfesional,
    removeProfesional,
    registerDoctor,
    refresh: loadData,
  };
};
