import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { institutionAdminService } from '../services/institutionAdminService';
import { useToast } from '../../../shared/components/ui/Toast';
import { useConfirmDelete } from '../../../shared/hooks/useConfirmDelete';
import { coverageParameterizationSchema } from '../../../shared/validation/schemas';
import {
  validateWithSchema,
  parseBackendError,
  validateStudyCoverageAssignment,
} from '../../../shared/validation/validateForm';

/**
 * Hook para la Parametrización de Cobertura B2B (Cumplimiento de la RN-02).
 * Exclusivo de Asistente: Vincula Profesional + Estudio específico + Obras Sociales aceptadas.
 */
export const useCoverageParameterization = (customConsultorioCuit = null) => {
  const { user } = useAuth();
  const consultorioCuit = customConsultorioCuit || user?.consultorioCuit || '30111222331';

  const { addToast } = useToast();
  const { confirmDelete } = useConfirmDelete();

  // Sede y Catálogos base
  const [consultorio, setConsultorio] = useState(null);
  const [profesionales, setProfesionales] = useState([]);
  const [estudios, setEstudios] = useState([]);
  const [obrasSociales, setObrasSociales] = useState([]);

  // Estado del formulario dependiente
  const [selectedDoctorCuil, setSelectedDoctorCuil] = useState('');
  const [doctorStudies, setDoctorStudies] = useState([]);
  const [selectedEstudioId, setSelectedEstudioId] = useState('');
  const [duracionTurno, setDuracionTurno] = useState(30);
  const [precioParticular, setPrecioParticular] = useState('');
  const [selectedObrasSocialesIds, setSelectedObrasSocialesIds] = useState([]);

  // Estados de carga y validación
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);
  const [isLoadingStudies, setIsLoadingStudies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [conflictWarning, setConflictWarning] = useState(null);

  // Carga de catálogos iniciales
  useEffect(() => {
    let isMounted = true;
    const loadCatalogs = async () => {
      try {
        setIsLoadingCatalogs(true);
        const [consData, sedeProfs, allProfs, ests, obs] = await Promise.all([
          consultorioCuit ? institutionAdminService.getConsultorioByCuit(consultorioCuit).catch(() => null) : null,
          consultorioCuit ? institutionAdminService.getConsultorioProfesionales(consultorioCuit).catch(() => []) : [],
          institutionAdminService.getProfesionales().catch(() => []),
          institutionAdminService.getEstudios().catch(() => []),
          institutionAdminService.getObrasSociales().catch(() => []),
        ]);

        if (!isMounted) return;
        setConsultorio(consData);

        // Aislamiento Multitenant estricto: Si hay consultorioCuit, solo usar médicos de esa sede
        const availableProfs = consultorioCuit ? (sedeProfs || []) : allProfs;

        setProfesionales(availableProfs);
        setEstudios(ests);
        setObrasSociales(obs.filter((o) => o.activo !== false));

        if (availableProfs.length > 0) {
          if (!selectedDoctorCuil || !availableProfs.some((p) => p.cuil === selectedDoctorCuil)) {
            setSelectedDoctorCuil(availableProfs[0].cuil);
          }
        } else {
          setSelectedDoctorCuil('');
        }
      } catch (err) {
        setError('Error al cargar catálogos de cobertura médica.');
      } finally {
        if (isMounted) setIsLoadingCatalogs(false);
      }
    };

    loadCatalogs();
    return () => {
      isMounted = false;
    };
  }, [consultorioCuit]);

  // Cargar estudios activos del profesional seleccionado
  const fetchDoctorStudies = useCallback(async (cuil) => {
    if (!cuil) {
      setDoctorStudies([]);
      return;
    }
    try {
      setIsLoadingStudies(true);
      const data = await institutionAdminService.getProfesionalEstudios(cuil);
      setDoctorStudies(data);
    } catch (err) {
      setDoctorStudies([]);
    } finally {
      setIsLoadingStudies(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDoctorCuil) {
      fetchDoctorStudies(selectedDoctorCuil);
    }
  }, [selectedDoctorCuil, fetchDoctorStudies]);

  // Profesional actualmente seleccionado
  const selectedDoctor = useMemo(() => {
    return profesionales.find((p) => p.cuil === selectedDoctorCuil);
  }, [profesionales, selectedDoctorCuil]);

  // Comprobar si el estudio seleccionado ya está parametrizado para este profesional
  const existingMapping = useMemo(() => {
    if (!selectedEstudioId) return null;
    return doctorStudies.find((pe) => pe.estudioId === Number(selectedEstudioId)) || null;
  }, [doctorStudies, selectedEstudioId]);

  // Al seleccionar o cambiar de estudio, precargar datos si ya existe la combinación o usar duración base
  useEffect(() => {
    if (existingMapping) {
      setDuracionTurno(existingMapping.duracionTurno || 30);
      setPrecioParticular(existingMapping.precioParticular || 0);

      // Mapear nombres de obras sociales a IDs
      const mappedIds = obrasSociales
        .filter((os) => existingMapping.obrasSocialesAceptadas?.includes(os.nombre))
        .map((os) => os.id);

      setSelectedObrasSocialesIds(mappedIds);
    } else if (selectedEstudioId) {
      const selectedEst = estudios.find((e) => e.id === Number(selectedEstudioId));
      setDuracionTurno(selectedEst?.duracion || 30);
      setPrecioParticular('');
      setSelectedObrasSocialesIds([]);
    } else {
      setDuracionTurno(30);
      setPrecioParticular('');
      setSelectedObrasSocialesIds([]);
    }
  }, [existingMapping, selectedEstudioId, estudios, obrasSociales]);

  // Selección/deselección de obra social individual
  const toggleObraSocial = (id) => {
    setSelectedObrasSocialesIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Seleccionar todas las obras sociales
  const selectAllObrasSociales = () => {
    setSelectedObrasSocialesIds(obrasSociales.map((os) => os.id));
  };

  // Deseleccionar todas
  const clearAllObrasSociales = () => {
    setSelectedObrasSocialesIds([]);
  };

  const clearFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  // Guardar parametrización de cobertura (RN-02)
  const saveParameterization = async () => {
    setFieldErrors({});
    setError(null);

    // 1. Validación estricta con esquema Zod
    const { isValid, errors: validationErrors, data: sanitizedData } = validateWithSchema(
      coverageParameterizationSchema,
      {
        profesionalCuil: selectedDoctorCuil,
        estudioId: selectedEstudioId,
        duracionTurno,
        precioParticular: precioParticular === '' ? 0 : precioParticular,
        obrasSocialesAceptadasIds: selectedObrasSocialesIds,
      }
    );

    if (!isValid) {
      setFieldErrors(validationErrors);
      addToast({
        title: 'Parámetros Inválidos',
        description: Object.values(validationErrors)[0],
        variant: 'warning',
      });
      return false;
    }

    // 2. Validación preventiva en memoria / deduplicación de cobertura (RN-02)
    const check = validateStudyCoverageAssignment(
      sanitizedData.profesionalCuil,
      sanitizedData.estudioId,
      sanitizedData.obrasSocialesAceptadasIds,
      doctorStudies
    );

    try {
      setIsSubmitting(true);

      const dto = {
        estudioId: sanitizedData.estudioId,
        duracionTurno: sanitizedData.duracionTurno,
        precioParticular: sanitizedData.precioParticular,
        obrasSocialesAceptadasIds: check.deduplicatedObrasSociales,
      };

      await institutionAdminService.assignEstudioProfesional(selectedDoctorCuil, dto);

      const estudioObj = estudios.find((e) => e.id === sanitizedData.estudioId);

      addToast({
        title: existingMapping ? 'Parametrización Actualizada' : 'Cobertura Parametrizada',
        description: `Se configuró el estudio "${estudioObj?.nombre || 'Médico'}" con ${check.deduplicatedObrasSociales.length} obras sociales para el Dr./Dra. ${selectedDoctor?.nombre || ''} ${selectedDoctor?.apellido || ''}.`,
        variant: 'success',
      });

      // Recargar estudios del profesional
      await fetchDoctorStudies(selectedDoctorCuil);

      // Limpiar selección de estudio
      setSelectedEstudioId('');
      setSelectedObrasSocialesIds([]);
      setPrecioParticular('');
      setFieldErrors({});
      return true;
    } catch (err) {
      const parsed = parseBackendError(err, 'No se pudo guardar la parametrización de cobertura.');
      setError(parsed.message);
      if (parsed.isDuplicate) {
        setFieldErrors((prev) => ({
          ...prev,
          estudioId: 'Conflicto de duplicidad: Este estudio ya se encuentra registrado con estas coberturas.',
        }));
      }
      addToast({
        title: parsed.isDuplicate ? 'Conflicto de Duplicidad' : 'Error al Parametrizar',
        description: parsed.message,
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Desvincular estudio
  const removeDoctorStudy = async (estudioId, estudioNombre) => {
    const ok = await confirmDelete({
      title: '¿Desvincular estudio médico definitivamente?',
      message: `¿Estás seguro de que deseas desvincular el estudio "${estudioNombre}" de este profesional? Se eliminarán también las obras sociales asociadas a este estudio.`,
      itemName: estudioNombre,
      confirmText: 'Sí, eliminar definitivamente',
      cancelText: 'Cancelar',
    });
    if (!ok) return false;

    try {
      await institutionAdminService.deleteEstudioProfesional(selectedDoctorCuil, estudioId);
      addToast({
        title: 'Estudio Desvinculado',
        description: `Se removió "${estudioNombre}" de las coberturas del profesional.`,
        variant: 'info',
      });
      await fetchDoctorStudies(selectedDoctorCuil);
      return true;
    } catch (err) {
      addToast({
        title: 'Error al Desvincular',
        description: err.message || 'No se pudo desvincular el estudio.',
        variant: 'error',
      });
      return false;
    }
  };

  return {
    profesionales,
    estudios,
    obrasSociales,
    selectedDoctorCuil,
    setSelectedDoctorCuil,
    selectedDoctor,
    doctorStudies,
    selectedEstudioId,
    setSelectedEstudioId,
    existingMapping,
    duracionTurno,
    setDuracionTurno,
    precioParticular,
    setPrecioParticular,
    selectedObrasSocialesIds,
    toggleObraSocial,
    selectAllObrasSociales,
    clearAllObrasSociales,
    isLoadingCatalogs,
    isLoadingStudies,
    isSubmitting,
    error,
    fieldErrors,
    clearFieldError,
    conflictWarning,
    consultorio,
    consultorioCuit,
    sedeNombre: consultorio?.nombre || user?.sedeNombre || 'Sede Actual',
    saveParameterization,
    removeDoctorStudy,
    refreshDoctorStudies: () => fetchDoctorStudies(selectedDoctorCuil),
  };
};
