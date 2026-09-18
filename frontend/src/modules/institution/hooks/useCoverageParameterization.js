import { useState, useEffect, useCallback, useMemo } from 'react';
import { institutionAdminService } from '../services/institutionAdminService';
import { useToast } from '../../../shared/components/ui/Toast';

/**
 * Hook para la Parametrización de Cobertura B2B (Cumplimiento de la RN-02).
 * Vincula Profesional + Estudio específico + Obras Sociales aceptadas.
 */
export const useCoverageParameterization = () => {
  const { addToast } = useToast();

  // Catálogos base
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

  // Estados de carga
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);
  const [isLoadingStudies, setIsLoadingStudies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Carga de catálogos iniciales
  useEffect(() => {
    let isMounted = true;
    const loadCatalogs = async () => {
      try {
        setIsLoadingCatalogs(true);
        const [profs, ests, obs] = await Promise.all([
          institutionAdminService.getProfesionales(),
          institutionAdminService.getEstudios(),
          institutionAdminService.getObrasSociales(),
        ]);

        if (!isMounted) return;
        setProfesionales(profs);
        setEstudios(ests);
        setObrasSociales(obs.filter((o) => o.activo !== false));

        if (profs.length > 0 && !selectedDoctorCuil) {
          setSelectedDoctorCuil(profs[0].cuil);
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
  }, []);

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

  // Al seleccionar o cambiar de estudio, precargar datos si ya existe la combinación
  useEffect(() => {
    if (existingMapping) {
      setDuracionTurno(existingMapping.duracionTurno || 30);
      setPrecioParticular(existingMapping.precioParticular || 0);

      // Mapear nombres de obras sociales a IDs
      const mappedIds = obrasSociales
        .filter((os) => existingMapping.obrasSocialesAceptadas?.includes(os.nombre))
        .map((os) => os.id);

      setSelectedObrasSocialesIds(mappedIds);
    } else {
      setDuracionTurno(30);
      setPrecioParticular('');
      setSelectedObrasSocialesIds([]);
    }
  }, [existingMapping, obrasSociales]);

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

  // Guardar parametrización de cobertura (RN-02)
  const saveParameterization = async () => {
    if (!selectedDoctorCuil) {
      addToast({
        title: 'Selección Requerida',
        description: 'Por favor seleccione un profesional médico.',
        variant: 'warning',
      });
      return false;
    }

    if (!selectedEstudioId) {
      addToast({
        title: 'Selección Requerida',
        description: 'Por favor seleccione un estudio médico a parametrizar.',
        variant: 'warning',
      });
      return false;
    }

    const duracion = Number(duracionTurno);
    if (!duracion || duracion <= 0) {
      addToast({
        title: 'Duración Inválida',
        description: 'La duración del turno debe ser mayor a 0 minutos.',
        variant: 'warning',
      });
      return false;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const dto = {
        estudioId: Number(selectedEstudioId),
        duracionTurno: duracion,
        precioParticular: Number(precioParticular) || 0,
        obrasSocialesAceptadasIds: selectedObrasSocialesIds,
      };

      await institutionAdminService.assignEstudioProfesional(selectedDoctorCuil, dto);

      const estudioObj = estudios.find((e) => e.id === Number(selectedEstudioId));

      addToast({
        title: existingMapping ? 'Parametrización Actualizada' : 'Cobertura Parametrizada',
        description: `Se configuró el estudio "${estudioObj?.nombre || 'Médico'}" con ${selectedObrasSocialesIds.length} obras sociales para el Dr./Dra. ${selectedDoctor?.nombre || ''} ${selectedDoctor?.apellido || ''}.`,
        variant: 'success',
      });

      // Recargar estudios del profesional
      await fetchDoctorStudies(selectedDoctorCuil);

      // Limpiar selección de estudio
      setSelectedEstudioId('');
      setSelectedObrasSocialesIds([]);
      setPrecioParticular('');
      return true;
    } catch (err) {
      addToast({
        title: 'Error al Parametrizar',
        description: err.message || 'No se pudo guardar la parametrización de cobertura.',
        variant: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Desvincular estudio
  const removeDoctorStudy = async (estudioId, estudioNombre) => {
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
    saveParameterization,
    removeDoctorStudy,
    refreshDoctorStudies: () => fetchDoctorStudies(selectedDoctorCuil),
  };
};
