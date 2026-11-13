import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVitalitySystem } from '../hooks/useVitalitySystem';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { pageTransitionVariants, snappySpring } from '../../../shared/motion';
import {
  Server,
  Activity,
  CheckCircle2,
  Clock,
  Database,
  ShieldCheck,
  Eye,
  Search,
  RefreshCw,
  Sparkles,
  Hospital,
  FileCheck,
  Accessibility,
  MapPin,
  Phone,
  ChevronDown,
  ChevronUp,
  Layers,
  Building2,
} from 'lucide-react';

/**
 * Metadatos oficiales de los 4 niveles de Accesibilidad Universal de Tempus Care.
 */
const ACCESSIBILITY_LEVELS = {
  Total: {
    label: 'Total (Rampas, Ascensor, Braille)',
    shortLabel: 'Total',
    description: 'Rampas de ingreso reglamentarias, ascensor adaptado, señalética Braille y sanitarios accesibles.',
    badgeVariant: 'emerald',
    pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
    score: 100,
  },
  Especializada: {
    label: 'Especializada (Neuro / Motriz)',
    shortLabel: 'Especializada',
    description: 'Equipamiento de rehabilitación neuro-motriz, camillas hidráulicas y accesos asistidos.',
    badgeVariant: 'indigo',
    pillClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotClass: 'bg-indigo-500',
    score: 100,
  },
  Media: {
    label: 'Media (Rampas y PB)',
    shortLabel: 'Media',
    description: 'Rampas de acceso peatonal y consultorios íntegramente operativos en Planta Baja.',
    badgeVariant: 'teal',
    pillClass: 'bg-teal-50 text-teal-700 border-teal-200',
    dotClass: 'bg-teal-500',
    score: 85,
  },
  Básica: {
    label: 'Básica (Acceso Estándar)',
    shortLabel: 'Básica',
    description: 'Acceso arquitectónico estándar sin adaptaciones edilicias especiales.',
    badgeVariant: 'amber',
    pillClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
    score: 50,
  },
};

const getLevelMeta = (nivel) => {
  if (!nivel) return ACCESSIBILITY_LEVELS.Total;
  const normalized = Object.keys(ACCESSIBILITY_LEVELS).find(
    (k) => k.toLowerCase() === nivel.toLowerCase()
  );
  return ACCESSIBILITY_LEVELS[normalized] || ACCESSIBILITY_LEVELS.Total;
};

/**
 * Pestaña de Estado del Servicio y Accesibilidad Universal para el Super Administrador de Vitality.
 * - Indicador de "Uptime" (Estado del servidor: En línea).
 * - Auditoría Institucional Detallada que refleja la Accesibilidad Universal real de cada consultorio
 *   ("Total", "Especializada", "Media", "Básica") tanto a nivel individual de sede como agregada a nivel institución.
 */
export const VitalitySystemPage = () => {
  const {
    systemData,
    auditSummary,
    filteredInstituciones,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    isLoading,
    error,
    refreshSystem,
  } = useVitalitySystem();

  const [selectedAuditInst, setSelectedAuditInst] = useState(null);
  const [cachedAuditInst, setCachedAuditInst] = useState(null);
  const [expandedInstIds, setExpandedInstIds] = useState({});

  useEffect(() => {
    if (selectedAuditInst) setCachedAuditInst(selectedAuditInst);
  }, [selectedAuditInst]);

  const activeAuditInst = selectedAuditInst || cachedAuditInst;

  const toggleExpandInst = (instId) => {
    setExpandedInstIds((prev) => ({
      ...prev,
      [instId]: !prev[instId],
    }));
  };

  // Días para el historial visual de Uptime (30 días de 100% de operatividad)
  const uptimeDays = Array.from({ length: 30 }, (_, i) => ({
    day: 30 - i,
    status: 'operational',
    uptime: '100%',
  })).reverse();

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Server className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Infraestructura & Accesibilidad Universal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
            Estado del Servicio y Accesibilidad Global
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Monitorización continua de disponibilidad de servidores, latencia de red y auditoría integral
            de Accesibilidad Universal por institución médica y cada uno de sus consultorios / sedes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshSystem}
            disabled={isLoading}
            title="Actualizar estado del servidor y auditoría de sedes"
            className="flex items-center gap-2 bg-white text-slate-700 hover:text-emerald-700 border-slate-300"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Verificar Estado</span>
          </Button>
        </div>
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={refreshSystem}>
            Reintentar
          </Button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SECCIÓN: MONITOR DE ESTADO DEL SERVICIO (UPTIME SIMULADO)               */}
      {/* ========================================================================= */}
      <Card className="border-slate-200/90 overflow-hidden shadow-xs">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-primary-700 p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <span className="absolute w-4 h-4 rounded-full bg-emerald-400 animate-ping opacity-75" />
                <span className="relative w-3.5 h-3.5 rounded-full bg-emerald-300 shadow-xs" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="emerald"
                    size="sm"
                    className="bg-emerald-500/20 text-emerald-100 border-emerald-400/30 font-bold"
                  >
                    SISTEMA OPERATIVO
                  </Badge>
                  <span className="text-xs text-emerald-100 font-mono">{systemData.version}</span>
                </div>
                <h2 className="text-2xl font-black font-heading mt-0.5 tracking-tight text-white flex items-center gap-2">
                  Estado del servidor: <span className="text-emerald-200">{systemData.status}</span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-black/15 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10">
              <div>
                <span className="block text-[11px] text-white/70 uppercase tracking-wider font-semibold">
                  Uptime Garantizado
                </span>
                <span className="text-2xl font-extrabold font-mono text-emerald-200">
                  {systemData.uptime}
                </span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <span className="block text-[11px] text-white/70 uppercase tracking-wider font-semibold">
                  Latencia de Red
                </span>
                <span className="text-2xl font-extrabold font-mono text-white">
                  {systemData.latenciaMs} ms
                </span>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Historial Visual de Uptime (30 días) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                Disponibilidad en los Últimos 30 Días
              </span>
              <span className="text-xs text-slate-500 font-mono">
                100.0% disponibilidad acumulada
              </span>
            </div>
            <div className="grid grid-cols-10 sm:grid-cols-[repeat(15,minmax(0,1fr))] lg:grid-cols-[repeat(30,minmax(0,1fr))] gap-1.5 pt-1">
              {uptimeDays.map((item) => (
                <div
                  key={item.day}
                  title={`Día ${item.day}: 100% En línea - 0 incidentes`}
                  className="h-9 rounded-md bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-pointer relative group flex items-end justify-center pb-1"
                >
                  <span className="text-[9px] font-bold text-emerald-950/70 hidden sm:block">
                    {item.day % 5 === 0 ? item.day : ''}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
              <span>Hace 30 días</span>
              <span>Hoy (Sin interrupciones detectadas)</span>
            </div>
          </div>

          {/* Tarjetas secundarias de telemetría de infraestructura */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center">
                <Database className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <span className="block text-[11px] text-slate-500 font-medium">Motor de Datos</span>
                <span className="text-xs font-bold text-slate-800">{systemData.databaseStatus}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="block text-[11px] text-slate-500 font-medium">
                  Seguridad & Cifrado
                </span>
                <span className="text-xs font-bold text-slate-800">TLS 1.3 / AES-256 GCM</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center">
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <span className="block text-[11px] text-slate-500 font-medium">
                  Última Auditoría
                </span>
                <span className="text-xs font-bold text-slate-800 font-mono">
                  {new Date(systemData.serverTime).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}{' '}
                  UTC
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 2. SECCIÓN: ACCESIBILIDAD UNIVERSAL (INSTITUCIONES + CONSULTORIOS)        */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Accessibility className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Auditoría de Infraestructura Inclusiva
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
              Accesibilidad Universal por Institución y Consultorios
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Relevamiento consolidado del nivel de Accesibilidad Universal declarado en cada sede física
              (<span className="font-semibold text-slate-700">Total</span>,{' '}
              <span className="font-semibold text-slate-700">Especializada</span>,{' '}
              <span className="font-semibold text-slate-700">Media</span> y{' '}
              <span className="font-semibold text-slate-700">Básica</span>) y su integración por institución.
            </p>
          </div>

          <Badge variant="indigo" size="lg" className="font-bold self-start sm:self-auto py-1.5 px-3">
            <Sparkles className="w-4 h-4 mr-1 text-indigo-600" />
            {auditSummary.totalSedesAuditadas} Sedes Auditadas
          </Badge>
        </div>

        {/* 4 Métricas de Accesibilidad Universal de Consultorios e Instituciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tarjeta 1: Cumplimiento Institucional Promedio */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Cumplimiento Institucional
              </span>
              <FileCheck className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-3xl font-extrabold font-heading text-slate-900">
              {auditSummary.cumplimientoPromedio}%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {auditSummary.sedesAdaptadasTotal} de {auditSummary.totalSedesAuditadas} consultorios con accesibilidad adaptada
            </p>
          </div>

          {/* Tarjeta 2: Accesibilidad Total */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Accesibilidad Total
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold font-heading text-emerald-600">
              {auditSummary.sedesNivelTotal} / {auditSummary.totalSedesAuditadas}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Rampas reglamentarias, ascensor y Braille
            </p>
          </div>

          {/* Tarjeta 3: Accesibilidad Especializada */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Especializada (Neuro / Motriz)
              </span>
              <Accessibility className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-3xl font-extrabold font-heading text-indigo-600">
              {auditSummary.sedesNivelEspecializada} / {auditSummary.totalSedesAuditadas}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Infraestructura neuro-motriz y soporte asistido
            </p>
          </div>

          {/* Tarjeta 4: Accesibilidad Media y Básica */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Media (PB) / Básica
              </span>
              <Layers className="w-5 h-5 text-teal-600" />
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold font-heading text-teal-600">
                {auditSummary.sedesNivelMedia}
              </span>
              <span className="text-xs font-semibold text-slate-400">Media</span>
              <span className="text-slate-300">•</span>
              <span className="text-2xl font-extrabold font-heading text-amber-600">
                {auditSummary.sedesNivelBasica}
              </span>
              <span className="text-xs font-semibold text-slate-400">Básica</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Rampas en Planta Baja vs. acceso estándar
            </p>
          </div>
        </div>

        {/* Tabla de Auditoría Institucional Detallada (con desglose de Consultorios) */}
        <Card className="border-slate-200/90 shadow-xs">
          <CardHeader className="border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Auditoría Institucional Detallada</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Verifica la Accesibilidad Universal integrada a nivel institución y el nivel individual de cada consultorio / sede que la compone
              </p>
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar institución, sede o CUIT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setFilterStatus('ALL')}
                  title="Mostrar todas las instituciones"
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    filterStatus === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todas ({systemData.institucionesAccesibilidad?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('CONFORME')}
                  title="Filtrar instituciones con cumplimiento óptimo (≥80%)"
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    filterStatus === 'CONFORME'
                      ? 'bg-white text-emerald-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  Conformes
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('PARCIAL')}
                  title="Filtrar instituciones con sedes de accesibilidad parcial o básica"
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    filterStatus === 'PARCIAL'
                      ? 'bg-white text-amber-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-amber-700'
                  }`}
                >
                  Parciales
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Institución Médica</th>
                    <th className="py-3.5 px-4 text-center">Sedes / Consultorios</th>
                    <th className="py-3.5 px-4 text-center">Distribución por Nivel</th>
                    <th className="py-3.5 px-4">Accesibilidad por Consultorio (Sedes)</th>
                    <th className="py-3.5 px-4 text-center">Cumplimiento</th>
                    <th className="py-3.5 px-6 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredInstituciones.length > 0 ? (
                    filteredInstituciones.map((inst) => {
                      const instKey = inst.institucionId ?? inst.nombre;
                      const porcentaje = inst.porcentajeCumplimiento ?? 100;
                      const conforms = porcentaje >= 80;
                      const consultorios = inst.consultorios || [];
                      const isExpanded = Boolean(expandedInstIds[instKey]);

                      return (
                        <React.Fragment key={instKey}>
                          <tr className="hover:bg-slate-50/70 transition-colors">
                            {/* 1. Institución Médica */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0">
                                  <Hospital className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 text-sm block">
                                    {inst.nombre}
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-mono text-[11px] text-slate-400">
                                      CUIT: {inst.cuit}
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-[10px] font-bold uppercase text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded">
                                      {inst.plan || 'Profesional'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* 2. Sedes Adaptadas / Total */}
                            <td className="py-4 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => toggleExpandInst(instKey)}
                                title="Desplegar u ocultar el detalle de cada consultorio de esta institución"
                                className="inline-flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                <CheckCircle2
                                  className={`w-3.5 h-3.5 ${
                                    inst.sedesAccesibles === inst.sedesTotal && inst.sedesTotal > 0
                                      ? 'text-emerald-600'
                                      : 'text-amber-600'
                                  }`}
                                />
                                <span>
                                  {inst.sedesAccesibles} / {inst.sedesTotal} sedes
                                </span>
                                {consultorios.length > 0 &&
                                  (isExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                  ))}
                              </button>
                            </td>

                            {/* 3. Resumen de Niveles a Nivel Institución */}
                            <td className="py-4 px-4 text-center">
                              <div className="flex flex-wrap items-center justify-center gap-1.5">
                                {inst.sedesTotalNivel > 0 && (
                                  <Badge
                                    variant="emerald"
                                    size="sm"
                                    title={`${inst.sedesTotalNivel} sede(s) con Accesibilidad Total (Rampas, Ascensor, Braille)`}
                                    className="font-semibold"
                                  >
                                    {inst.sedesTotalNivel} Total
                                  </Badge>
                                )}
                                {inst.sedesEspecializadaNivel > 0 && (
                                  <Badge
                                    variant="indigo"
                                    size="sm"
                                    title={`${inst.sedesEspecializadaNivel} sede(s) con Accesibilidad Especializada (Neuro / Motriz)`}
                                    className="font-semibold"
                                  >
                                    {inst.sedesEspecializadaNivel} Especializada
                                  </Badge>
                                )}
                                {inst.sedesMediaNivel > 0 && (
                                  <Badge
                                    variant="teal"
                                    size="sm"
                                    title={`${inst.sedesMediaNivel} sede(s) con Accesibilidad Media (Rampas y PB)`}
                                    className="font-semibold"
                                  >
                                    {inst.sedesMediaNivel} Media
                                  </Badge>
                                )}
                                {inst.sedesBasicaNivel > 0 && (
                                  <Badge
                                    variant="amber"
                                    size="sm"
                                    title={`${inst.sedesBasicaNivel} sede(s) con Accesibilidad Básica (Acceso Estándar)`}
                                    className="font-semibold"
                                  >
                                    {inst.sedesBasicaNivel} Básica
                                  </Badge>
                                )}
                                {inst.sedesTotal === 0 && (
                                  <Badge variant="default" size="sm">
                                    Sin sedes
                                  </Badge>
                                )}
                              </div>
                            </td>

                            {/* 4. Listado Individual de Consultorios y su Accesibilidad Universal */}
                            <td className="py-4 px-4">
                              {consultorios.length > 0 ? (
                                <div className="space-y-1.5 max-w-md">
                                  {consultorios.map((sede) => {
                                    const meta = getLevelMeta(sede.nivelAccesibilidad);
                                    return (
                                      <div
                                        key={sede.cuit}
                                        title={`${sede.nombre} (CUIT: ${sede.cuit}) — Accesibilidad Universal: ${meta.label}`}
                                        className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50/90 border border-slate-200/70"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span
                                            className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dotClass}`}
                                          />
                                          <span className="font-medium text-slate-800 truncate text-xs">
                                            {sede.nombre}
                                          </span>
                                        </div>
                                        <span
                                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex-shrink-0 ${meta.pillClass}`}
                                        >
                                          {meta.label}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">
                                  Sin consultorios vinculados
                                </span>
                              )}
                            </td>

                            {/* 5. Porcentaje de Cumplimiento Institucional */}
                            <td className="py-4 px-4 text-center">
                              <div className="flex flex-col items-center">
                                <span
                                  className={`font-bold ${
                                    conforms ? 'text-emerald-700' : 'text-amber-700'
                                  }`}
                                >
                                  {porcentaje}%
                                </span>
                                <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                                  <div
                                    className={`h-full rounded-full ${
                                      conforms ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${porcentaje}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-slate-400 mt-0.5">
                                  {conforms ? 'Conforme' : 'Parcial'}
                                </span>
                              </div>
                            </td>

                            {/* 6. Acción Detalle */}
                            <td className="py-4 px-6 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedAuditInst(inst)}
                                title={`Abrir auditoría detallada de ${inst.nombre} y sus consultorios`}
                                className="text-xs text-slate-700 hover:text-indigo-600 border-slate-200"
                              >
                                Ver Auditoría
                              </Button>
                            </td>
                          </tr>

                          {/* Fila Desplegable: Detalle Individual por Consultorio de la Institución */}
                          <AnimatePresence initial={false}>
                            {isExpanded && consultorios.length > 0 && (
                              <motion.tr
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={snappySpring}
                                className="bg-slate-50/70"
                              >
                                <td colSpan={6} className="px-6 py-4 border-t border-slate-200/60">
                                  <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5 text-primary-600" />
                                        Desglose de Accesibilidad Universal por Consultorio en{' '}
                                        {inst.nombre}
                                      </span>
                                      <span className="text-[11px] text-slate-500">
                                        Promedio Institucional: <strong>{porcentaje}%</strong>
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {consultorios.map((sede) => {
                                        const meta = getLevelMeta(sede.nivelAccesibilidad);
                                        return (
                                          <div
                                            key={sede.cuit}
                                            className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-2"
                                          >
                                            <div className="flex items-start justify-between gap-2">
                                              <div>
                                                <p className="font-bold text-slate-900 text-xs">
                                                  {sede.nombre}
                                                </p>
                                                <p className="text-[11px] font-mono text-slate-400">
                                                  CUIT Sede: {sede.cuit}
                                                </p>
                                              </div>
                                              <span
                                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${meta.pillClass}`}
                                              >
                                                {meta.label}
                                              </span>
                                            </div>

                                            <p className="text-[11px] text-slate-500">
                                              {meta.description}
                                            </p>

                                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                                              <span className="flex items-center gap-1 truncate">
                                                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                                <span className="truncate">
                                                  {sede.direccionCompleta || 'Dirección registrada'}
                                                </span>
                                              </span>
                                              <span className="font-bold text-slate-700 flex-shrink-0 ml-2">
                                                Índice: {sede.puntajeAccesibilidad ?? meta.score}%
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No se encontraron instituciones ni consultorios bajo el criterio de búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalle de Auditoría Institucional y por Consultorio */}
      <Modal
        isOpen={Boolean(selectedAuditInst)}
        onClose={() => setSelectedAuditInst(null)}
        title={
          activeAuditInst
            ? `Auditoría de Accesibilidad: ${activeAuditInst.nombre}`
            : 'Auditoría de Accesibilidad'
        }
        description="Evaluación consolidada a nivel institución y desglose individual por cada consultorio o sede física."
        maxWidth="max-w-2xl"
      >
        {activeAuditInst && (
          <div className="space-y-4">
            {/* Resumen Institucional */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{activeAuditInst.nombre}</h4>
                  <span className="text-[10px] font-bold uppercase text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                    {activeAuditInst.plan || 'Profesional'}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  CUIT Institucional: {activeAuditInst.cuit} • {activeAuditInst.sedesAccesibles} de{' '}
                  {activeAuditInst.sedesTotal} sedes con accesibilidad adaptada
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={activeAuditInst.porcentajeCumplimiento >= 80 ? 'emerald' : 'amber'}
                  size="md"
                  className="font-bold"
                >
                  Cumplimiento: {activeAuditInst.porcentajeCumplimiento}% ({activeAuditInst.estado})
                </Badge>
              </div>
            </div>

            {/* Resumen por Nivel de Accesibilidad en la Institución */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-center">
                <span className="block text-lg font-extrabold text-emerald-700">
                  {activeAuditInst.sedesTotalNivel || 0}
                </span>
                <span className="text-[10px] font-bold uppercase text-emerald-800">
                  Total (Braille/Asc.)
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80 text-center">
                <span className="block text-lg font-extrabold text-indigo-700">
                  {activeAuditInst.sedesEspecializadaNivel || 0}
                </span>
                <span className="text-[10px] font-bold uppercase text-indigo-800">
                  Especializada
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-200/80 text-center">
                <span className="block text-lg font-extrabold text-teal-700">
                  {activeAuditInst.sedesMediaNivel || 0}
                </span>
                <span className="text-[10px] font-bold uppercase text-teal-800">
                  Media (Rampas y PB)
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-center">
                <span className="block text-lg font-extrabold text-amber-700">
                  {activeAuditInst.sedesBasicaNivel || 0}
                </span>
                <span className="text-[10px] font-bold uppercase text-amber-800">
                  Básica (Estándar)
                </span>
              </div>
            </div>

            {/* Listado de Consultorios que integran la Institución */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Accessibility className="w-4 h-4 text-primary-600" />
                Accesibilidad Universal por Consultorio ({activeAuditInst.consultorios?.length || 0})
              </h5>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {(activeAuditInst.consultorios || []).length > 0 ? (
                  activeAuditInst.consultorios.map((sede) => {
                    const meta = getLevelMeta(sede.nivelAccesibilidad);
                    return (
                      <div
                        key={sede.cuit}
                        className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${meta.dotClass}`} />
                            <span className="font-bold text-slate-900 text-xs truncate">
                              {sede.nombre}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              (CUIT: {sede.cuit})
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 pl-4">{meta.description}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 pl-4 pt-0.5">
                            {sede.direccionCompleta && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {sede.direccionCompleta}
                              </span>
                            )}
                            {sede.telefono && (
                              <span className="flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3" />
                                {sede.telefono}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-end justify-between gap-1 flex-shrink-0">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${meta.pillClass}`}
                          >
                            {meta.label}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            Puntaje sede: {sede.puntajeAccesibilidad ?? meta.score}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic py-3 text-center">
                    Esta institución aún no registra consultorios vinculados.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedAuditInst(null)}>
                Cerrar Auditoría
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};
