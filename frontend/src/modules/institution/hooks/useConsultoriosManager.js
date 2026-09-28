import { useState, useEffect, useCallback } from 'react';
import { institutionAdminService } from '../services/institutionAdminService';
import { useToast } from '../../../shared/components/ui/Toast';
import { useConfirmDelete } from '../../../shared/hooks/useConfirmDelete';

/**
 * Hook para la gestión de Sedes Físicas y Consultorios Médicos.
 */
export const useConsultoriosManager = () => {
  const { addToast } = useToast();
  const { confirmDelete } = useConfirmDelete();
  const [consultorios, setConsultorios] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingConsultorio, setEditingConsultorio] = useState(null);
  const [error, setError] = useState(null);

  const fetchConsultorios = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [data, insts] = await Promise.all([
        institutionAdminService.getConsultorios(),
        institutionAdminService.getInstituciones().catch(() => []),
      ]);
      setConsultorios(data);
      setInstituciones(insts);
    } catch (err) {
      setError(err.message || 'Error al cargar sedes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConsultorios();
  }, [fetchConsultorios]);

  const openEditModal = (consultorio) => {
    setEditingConsultorio(consultorio);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingConsultorio(null);
    setIsEditModalOpen(false);
  };

  const handleCreateConsultorio = async (dto) => {
    try {
      setIsSubmitting(true);
      const { adminConsultorio, ...consultorioDto } = dto;
      await institutionAdminService.createConsultorio(consultorioDto);

      if (adminConsultorio && adminConsultorio.cuil) {
        try {
          await institutionAdminService.createAdminConsultorio({
            cuil: adminConsultorio.cuil,
            nombre: adminConsultorio.nombre,
            apellido: adminConsultorio.apellido,
            telefono: adminConsultorio.telefono || consultorioDto.telefono,
            fechaNacimiento: adminConsultorio.fechaNacimiento || '1990-01-01',
            consultorioCuit: consultorioDto.cuit,
            nombreUsuario: adminConsultorio.cuil,
            contrasena: `Admin.${adminConsultorio.cuil}!`,
            mail: adminConsultorio.mail || `${adminConsultorio.cuil}@adminconsultorio.com`,
          });
        } catch {
          // Si falla la creación opcional del admin, el consultorio ya fue creado exitosamente
        }
      }

      addToast({
        title: 'Sede Registrada',
        description: `El consultorio "${dto.nombre}" ha sido registrado correctamente${adminConsultorio?.nombre ? ' con su administrador asignado' : ''}.`,
        variant: 'success',
      });

      setIsModalOpen(false);
      await fetchConsultorios();
      return true;
    } catch (err) {
      addToast({
        title: 'Error al Registrar Sede',
        description: err.message || 'No se pudo crear el consultorio.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateConsultorio = async (cuit, dto) => {
    try {
      setIsSubmitting(true);
      await institutionAdminService.updateConsultorio(cuit, dto);

      addToast({
        title: 'Sede Modificada',
        description: `La sede "${dto.nombre}" ha sido actualizada correctamente.`,
        variant: 'success',
      });

      closeEditModal();
      await fetchConsultorios();
      return true;
    } catch (err) {
      addToast({
        title: 'Error al Modificar Sede',
        description: err.message || 'No se pudo actualizar la sede.',
        variant: 'error',
      });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConsultorio = async (cuit, nombre) => {
    const ok = await confirmDelete({
      title: '¿Desea eliminar esta sede?',
      message: `¿Estás seguro de que deseas eliminar la sede física "${nombre}" (CUIT: ${cuit})? Esta acción desvinculará sus médicos y agendas asociadas.`,
      itemName: `${nombre} (CUIT: ${cuit})`,
      confirmText: 'Sí, eliminar definitivamente',
      cancelText: 'Cancelar',
    });
    if (!ok) return false;

    try {
      await institutionAdminService.deleteConsultorio(cuit);
      addToast({
        title: 'Sede Eliminada',
        description: `El consultorio "${nombre}" ha sido eliminado.`,
        variant: 'info',
      });
      await fetchConsultorios();
      return true;
    } catch (err) {
      addToast({
        title: 'Error al Eliminar',
        description: err.message || 'No se pudo eliminar el consultorio.',
        variant: 'error',
      });
      return false;
    }
  };

  return {
    consultorios,
    instituciones,
    isLoading,
    isSubmitting,
    isModalOpen,
    setIsModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    editingConsultorio,
    openEditModal,
    closeEditModal,
    error,
    createConsultorio: handleCreateConsultorio,
    updateConsultorio: handleUpdateConsultorio,
    deleteConsultorio: handleDeleteConsultorio,
    refreshConsultorios: fetchConsultorios,
  };
};
