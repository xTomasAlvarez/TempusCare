import { useState, useEffect, useCallback } from 'react';
import { vitalityService } from '../services/vitalityService';

/**
 * Hook para la gestión y carga de métricas globales de adopción en Vitality.
 * Consume GET /api/vitality/metrics y ofrece estados de carga, error y recarga.
 */
export const useVitalityMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalInstituciones: 0,
    totalSedes: 0,
    totalProfesionales: 0,
    totalTurnos: 0,
    totalCitas: 0,
    institucionesPorPlan: [],
    turnosPorEstado: [],
    profesionalesPorEspecialidad: [],
    volumenMensual: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await vitalityService.getMetrics();
      if (data) {
        setMetrics({
          totalInstituciones: data.totalInstituciones ?? data.TotalInstituciones ?? 0,
          totalSedes: data.totalSedes ?? data.TotalSedes ?? 0,
          totalProfesionales: data.totalProfesionales ?? data.TotalProfesionales ?? 0,
          totalTurnos: data.totalTurnos ?? data.TotalTurnos ?? 0,
          totalCitas: data.totalCitas ?? data.TotalCitas ?? 0,
          institucionesPorPlan: data.institucionesPorPlan ?? data.InstitucionesPorPlan ?? [],
          turnosPorEstado: data.turnosPorEstado ?? data.TurnosPorEstado ?? [],
          profesionalesPorEspecialidad: data.profesionalesPorEspecialidad ?? data.ProfesionalesPorEspecialidad ?? [],
          volumenMensual: data.volumenMensual ?? data.VolumenMensual ?? [],
        });
      }
    } catch (err) {
      console.error('Error al cargar métricas de Vitality:', err);
      setError('No se pudieron obtener las métricas globales del sistema.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refreshMetrics: fetchMetrics,
  };
};
