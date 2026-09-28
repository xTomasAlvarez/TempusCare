import { useState, useEffect, useCallback, useMemo } from 'react';
import { vitalityService } from '../services/vitalityService';

/**
 * Hook para la gestión del estado de servicio y auditoría global de accesibilidad en Vitality.
 * Consume GET /api/vitality/system.
 */
export const useVitalitySystem = () => {
  const [systemData, setSystemData] = useState({
    status: 'En línea',
    uptime: '99.98%',
    databaseStatus: 'Saludable',
    serverTime: new Date().toISOString(),
    latenciaMs: 12,
    version: 'v1.4.2-enterprise',
    totalInstitucionesAuditadas: 0,
    institucionesAccesibilidad: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchSystemStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await vitalityService.getSystemStatus();
      if (data) {
        setSystemData({
          status: data.status ?? data.Status ?? 'En línea',
          uptime: data.uptime ?? data.Uptime ?? '99.98%',
          databaseStatus: data.databaseStatus ?? data.DatabaseStatus ?? 'Saludable',
          serverTime: data.serverTime ?? data.ServerTime ?? new Date().toISOString(),
          latenciaMs: data.latenciaMs ?? data.LatenciaMs ?? 12,
          version: data.version ?? data.Version ?? 'v1.4.2-enterprise',
          totalInstitucionesAuditadas:
            data.totalInstitucionesAuditadas ?? data.TotalInstitucionesAuditadas ?? 0,
          institucionesAccesibilidad:
            data.institucionesAccesibilidad ?? data.InstitucionesAccesibilidad ?? [],
        });
      }
    } catch {
      setError('No se pudo verificar el estado del servidor ni la auditoría de accesibilidad.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemStatus();
  }, [fetchSystemStatus]);

  // Auditoría calculada
  const auditSummary = useMemo(() => {
    const list = systemData.institucionesAccesibilidad || [];
    const total = list.length;
    if (total === 0) {
      return {
        totalAuditadas: 0,
        cumplimientoPromedio: 100,
        conformeCount: 0,
        parcialCount: 0,
        lectoresActivos: 0,
        altoContrasteActivo: 0,
        navegacionTecladoActiva: 0,
      };
    }

    const sumaPorcentajes = list.reduce(
      (acc, curr) => acc + (curr.porcentajeCumplimiento ?? curr.PorcentajeCumplimiento ?? 100),
      0
    );
    const lectores = list.filter((i) => i.lectorPantalla ?? i.LectorPantalla).length;
    const altoContraste = list.filter((i) => i.altoContraste ?? i.AltoContraste).length;
    const teclado = list.filter((i) => i.navegacionTeclado ?? i.NavegacionTeclado).length;
    const conformes = list.filter(
      (i) => (i.porcentajeCumplimiento ?? i.PorcentajeCumplimiento ?? 100) >= 80
    ).length;

    return {
      totalAuditadas: total,
      cumplimientoPromedio: Math.round(sumaPorcentajes / total),
      conformeCount: conformes,
      parcialCount: total - conformes,
      lectoresActivos: lectores,
      altoContrasteActivo: altoContraste,
      navegacionTecladoActiva: teclado,
    };
  }, [systemData.institucionesAccesibilidad]);

  // Lista filtrada para visualización y auditoría
  const filteredInstituciones = useMemo(() => {
    return (systemData.institucionesAccesibilidad || []).filter((inst) => {
      const nombre = (inst.nombre || inst.Nombre || '').toLowerCase();
      const cuit = (inst.cuit || inst.Cuit || '').toLowerCase();
      const matchesSearch =
        nombre.includes(searchTerm.toLowerCase()) || cuit.includes(searchTerm.toLowerCase());

      const estado = (inst.estado || inst.Estado || 'Conforme').toUpperCase();
      const matchesStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'CONFORME' && estado === 'CONFORME') ||
        (filterStatus === 'PARCIAL' && estado === 'PARCIAL');

      return matchesSearch && matchesStatus;
    });
  }, [systemData.institucionesAccesibilidad, searchTerm, filterStatus]);

  return {
    systemData,
    auditSummary,
    filteredInstituciones,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    isLoading,
    error,
    refreshSystem: fetchSystemStatus,
  };
};
