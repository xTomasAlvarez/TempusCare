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
    consultoriosAccesibilidad: [],
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
        const rawInstituciones =
          data.institucionesAccesibilidad ?? data.InstitucionesAccesibilidad ?? [];

        const normalizedInstituciones = rawInstituciones.map((inst) => {
          const rawSedes = inst.consultorios ?? inst.Consultorios ?? [];
          const normalizedSedes = rawSedes.map((s) => ({
            cuit: s.cuit ?? s.Cuit ?? '',
            nombre: s.nombre ?? s.Nombre ?? '',
            direccionCompleta: s.direccionCompleta ?? s.DireccionCompleta ?? '',
            telefono: s.telefono ?? s.Telefono ?? '',
            nivelAccesibilidad: s.nivelAccesibilidad ?? s.NivelAccesibilidad ?? 'Total',
            institucionId: s.institucionId ?? s.InstitucionId ?? null,
            institucionNombre: s.institucionNombre ?? s.InstitucionNombre ?? inst.nombre ?? inst.Nombre ?? '',
            puntajeAccesibilidad: s.puntajeAccesibilidad ?? s.PuntajeAccesibilidad ?? 100,
          }));

          return {
            institucionId: inst.institucionId ?? inst.InstitucionId,
            nombre: inst.nombre ?? inst.Nombre ?? '',
            cuit: inst.cuit ?? inst.Cuit ?? '',
            plan: inst.plan ?? inst.Plan ?? 'Profesional',
            sedesTotal: inst.sedesTotal ?? inst.SedesTotal ?? normalizedSedes.length,
            sedesAccesibles: inst.sedesAccesibles ?? inst.SedesAccesibles ?? 0,
            sedesTotalNivel:
              inst.sedesTotalNivel ??
              inst.SedesTotalNivel ??
              normalizedSedes.filter((s) => s.nivelAccesibilidad === 'Total').length,
            sedesEspecializadaNivel:
              inst.sedesEspecializadaNivel ??
              inst.SedesEspecializadaNivel ??
              normalizedSedes.filter((s) => s.nivelAccesibilidad === 'Especializada').length,
            sedesMediaNivel:
              inst.sedesMediaNivel ??
              inst.SedesMediaNivel ??
              normalizedSedes.filter((s) => s.nivelAccesibilidad === 'Media').length,
            sedesBasicaNivel:
              inst.sedesBasicaNivel ??
              inst.SedesBasicaNivel ??
              normalizedSedes.filter((s) => s.nivelAccesibilidad === 'Básica').length,
            nivelPredominante:
              inst.nivelPredominante ?? inst.NivelPredominante ?? 'Total',
            lectorPantalla: inst.lectorPantalla ?? inst.LectorPantalla ?? true,
            altoContraste: inst.altoContraste ?? inst.AltoContraste ?? true,
            navegacionTeclado: inst.navegacionTeclado ?? inst.NavegacionTeclado ?? true,
            porcentajeCumplimiento:
              inst.porcentajeCumplimiento ?? inst.PorcentajeCumplimiento ?? 100,
            estado: inst.estado ?? inst.Estado ?? 'Conforme',
            consultorios: normalizedSedes,
          };
        });

        const rawConsultorios =
          data.consultoriosAccesibilidad ?? data.ConsultoriosAccesibilidad ?? [];

        const normalizedConsultorios =
          rawConsultorios.length > 0
            ? rawConsultorios.map((s) => ({
                cuit: s.cuit ?? s.Cuit ?? '',
                nombre: s.nombre ?? s.Nombre ?? '',
                direccionCompleta: s.direccionCompleta ?? s.DireccionCompleta ?? '',
                telefono: s.telefono ?? s.Telefono ?? '',
                nivelAccesibilidad: s.nivelAccesibilidad ?? s.NivelAccesibilidad ?? 'Total',
                institucionId: s.institucionId ?? s.InstitucionId ?? null,
                institucionNombre: s.institucionNombre ?? s.InstitucionNombre ?? '',
                puntajeAccesibilidad: s.puntajeAccesibilidad ?? s.PuntajeAccesibilidad ?? 100,
              }))
            : normalizedInstituciones.flatMap((i) => i.consultorios || []);

        setSystemData({
          status: data.status ?? data.Status ?? 'En línea',
          uptime: data.uptime ?? data.Uptime ?? '99.98%',
          databaseStatus: data.databaseStatus ?? data.DatabaseStatus ?? 'Saludable',
          serverTime: data.serverTime ?? data.ServerTime ?? new Date().toISOString(),
          latenciaMs: data.latenciaMs ?? data.LatenciaMs ?? 12,
          version: data.version ?? data.Version ?? 'v1.4.2-enterprise',
          totalInstitucionesAuditadas:
            data.totalInstitucionesAuditadas ??
            data.TotalInstitucionesAuditadas ??
            normalizedInstituciones.length,
          institucionesAccesibilidad: normalizedInstituciones,
          consultoriosAccesibilidad: normalizedConsultorios,
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

  // Auditoría calculada a nivel institución y a nivel de cada consultorio
  const auditSummary = useMemo(() => {
    const list = systemData.institucionesAccesibilidad || [];
    const consultorios = systemData.consultoriosAccesibilidad || [];
    const total = list.length;
    const totalSedes = consultorios.length;

    if (total === 0) {
      return {
        totalAuditadas: 0,
        totalSedesAuditadas: 0,
        cumplimientoPromedio: 100,
        conformeCount: 0,
        parcialCount: 0,
        sedesNivelTotal: 0,
        sedesNivelEspecializada: 0,
        sedesNivelMedia: 0,
        sedesNivelBasica: 0,
        sedesAdaptadasTotal: 0,
        lectoresActivos: 0,
        altoContrasteActivo: 0,
        navegacionTecladoActiva: 0,
      };
    }

    const sumaPorcentajes = list.reduce(
      (acc, curr) => acc + (curr.porcentajeCumplimiento ?? 100),
      0
    );
    const sedesNivelTotal = consultorios.filter((c) => c.nivelAccesibilidad === 'Total').length;
    const sedesNivelEspecializada = consultorios.filter(
      (c) => c.nivelAccesibilidad === 'Especializada'
    ).length;
    const sedesNivelMedia = consultorios.filter((c) => c.nivelAccesibilidad === 'Media').length;
    const sedesNivelBasica = consultorios.filter((c) => c.nivelAccesibilidad === 'Básica').length;
    const sedesAdaptadasTotal = sedesNivelTotal + sedesNivelEspecializada + sedesNivelMedia;

    const conformes = list.filter((i) => (i.porcentajeCumplimiento ?? 100) >= 80).length;

    return {
      totalAuditadas: total,
      totalSedesAuditadas: totalSedes,
      cumplimientoPromedio: Math.round(sumaPorcentajes / total),
      conformeCount: conformes,
      parcialCount: total - conformes,
      sedesNivelTotal,
      sedesNivelEspecializada,
      sedesNivelMedia,
      sedesNivelBasica,
      sedesAdaptadasTotal,
      lectoresActivos: list.filter((i) => i.lectorPantalla).length,
      altoContrasteActivo: list.filter((i) => i.altoContraste).length,
      navegacionTecladoActiva: list.filter((i) => i.navegacionTeclado).length,
    };
  }, [systemData.institucionesAccesibilidad, systemData.consultoriosAccesibilidad]);

  // Lista filtrada para visualización y auditoría (busca también por nombre o CUIT de consultorio)
  const filteredInstituciones = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return (systemData.institucionesAccesibilidad || []).filter((inst) => {
      const nombre = (inst.nombre || '').toLowerCase();
      const cuit = (inst.cuit || '').toLowerCase();
      const matchesConsultorio = (inst.consultorios || []).some(
        (c) =>
          (c.nombre || '').toLowerCase().includes(query) ||
          (c.cuit || '').toLowerCase().includes(query) ||
          (c.nivelAccesibilidad || '').toLowerCase().includes(query)
      );
      const matchesSearch =
        !query || nombre.includes(query) || cuit.includes(query) || matchesConsultorio;

      const estado = (inst.estado || 'Conforme').toUpperCase();
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
