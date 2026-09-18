import { useState, useEffect, useCallback } from 'react';
import { patientService } from '../services/patientService';

export const useSearchProfessionals = () => {
  const [professionals, setProfessionals] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [healthInsurances, setHealthInsurances] = useState([]);

  const [filters, setFilters] = useState({
    nombre: '',
    especialidadId: '',
    obraSocialId: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [highlightedDoctorCuil, setHighlightedDoctorCuil] = useState(null);

  // Carga inicial de catálogos
  useEffect(() => {
    let isMounted = true;

    async function loadCatalogs() {
      try {
        const [specs, insurances] = await Promise.all([
          patientService.getSpecialties().catch(() => []),
          patientService.getHealthInsurances().catch(() => []),
        ]);
        if (isMounted) {
          setSpecialties(specs);
          setHealthInsurances(insurances);
        }
      } catch (err) {
        // Silently handled fallback
      }
    }

    loadCatalogs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Búsqueda de profesionales
  const search = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await patientService.getProfessionals({
        nombre: filters.nombre,
        especialidadId: filters.especialidadId || null,
        obraSocialId: filters.obraSocialId || null,
      });
      setProfessionals(data);
    } catch (err) {
      setError(err.message || 'No se pudieron obtener los profesionales.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      search();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      nombre: '',
      especialidadId: '',
      obraSocialId: '',
    });
  };

  return {
    professionals,
    specialties,
    healthInsurances,
    filters,
    isLoading,
    error,
    selectedDoctorForBooking,
    setSelectedDoctorForBooking,
    highlightedDoctorCuil,
    setHighlightedDoctorCuil,
    updateFilter,
    resetFilters,
    refreshSearch: search,
  };
};
