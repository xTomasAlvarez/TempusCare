import React, { useState } from 'react';
import { useVitalitySystem } from '../hooks/useVitalitySystem';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import {
  Server,
  Activity,
  CheckCircle2,
  Clock,
  Database,
  ShieldCheck,
  Eye,
  Contrast,
  Keyboard,
  Volume2,
  Search,
  RefreshCw,
  Sparkles,
  Hospital,
  AlertTriangle,
  FileCheck,
  Check,
  HelpCircle,
} from 'lucide-react';

/**
 * Pestaña de Estado del Servicio y Accesibilidad para el Super Administrador de Vitality.
 * - Indicador simulado de "Uptime" (Estado del servidor: En línea).
 * - Sección de "Accesibilidad Global" para visualizar y auditar qué instituciones
 *   tienen activadas las funciones de accesibilidad (lectores de pantalla, alto contraste, navegación por teclado).
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

  // Días para el historial visual de Uptime (30 días de 100% de operatividad)
  const uptimeDays = Array.from({ length: 30 }, (_, i) => ({
    day: 30 - i,
    status: 'operational',
    uptime: '100%',
  })).reverse();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Server className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Infraestructura & Normativa
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
            Estado del Servicio y Accesibilidad Global
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Monitorización continua de disponibilidad de servidores, latencia de red y auditoría integral
            de cumplimiento de estándares de accesibilidad universal (WCAG 2.1 AA).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshSystem}
            disabled={isLoading}
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
          <Button variant="ghost" size="sm" onClick={refreshSystem}>Reintentar</Button>
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
                  <Badge variant="emerald" size="sm" className="bg-emerald-500/20 text-emerald-100 border-emerald-400/30 font-bold">
                    SISTEMA OPERATIVO
                  </Badge>
                  <span className="text-xs text-emerald-100 font-mono">
                    {systemData.version}
                  </span>
                </div>
                {/* Indicador simulado estricto: "Estado del servidor: En línea" */}
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
            <div className="grid grid-cols-15 sm:grid-cols-30 gap-1.5 pt-1">
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
                <span className="block text-[11px] text-slate-500 font-medium">Seguridad & Cifrado</span>
                <span className="text-xs font-bold text-slate-800">TLS 1.3 / AES-256 GCM</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center">
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <span className="block text-[11px] text-slate-500 font-medium">Última Auditoría</span>
                <span className="text-xs font-bold text-slate-800 font-mono">
                  {new Date(systemData.serverTime).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })} UTC
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 2. SECCIÓN: ACCESIBILIDAD GLOBAL Y AUDITORÍA DE INSTITUCIONES             */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Auditoría Inclusiva
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
              Accesibilidad Global del Ecosistema
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Auditoría en tiempo real de funciones inclusivas activadas en cada institución cliente:
              compatibilidad con lectores de pantalla, alto contraste y navegación universal sin mouse.
            </p>
          </div>

          <Badge variant="indigo" size="lg" className="font-bold self-start sm:self-auto py-1.5 px-3">
            <Sparkles className="w-4 h-4 mr-1 text-indigo-600" />
            Estándar WCAG 2.1 AA
          </Badge>
        </div>

        {/* 4 Métricas de Cumplimiento de Accesibilidad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tarjeta 1: Cumplimiento Promedio */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Cumplimiento Global</span>
              <FileCheck className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-3xl font-extrabold font-heading text-slate-900">
              {auditSummary.cumplimientoPromedio}%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {auditSummary.conformeCount} de {auditSummary.totalAuditadas} instituciones al 100%
            </p>
          </div>

          {/* Tarjeta 2: Lectores de Pantalla */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Lectores de Pantalla</span>
              <Volume2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-3xl font-extrabold font-heading text-indigo-600">
              {auditSummary.lectoresActivos} / {auditSummary.totalAuditadas}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Atributos ARIA & compatibilidad JAWS/NVDA
            </p>
          </div>

          {/* Tarjeta 3: Alto Contraste */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Alto Contraste</span>
              <Contrast className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold font-heading text-emerald-600">
              {auditSummary.altoContrasteActivo} / {auditSummary.totalAuditadas}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ratio de contraste 7:1 para baja visión
            </p>
          </div>

          {/* Tarjeta 4: Navegación por Teclado */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Navegación Teclado</span>
              <Keyboard className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold font-heading text-amber-600">
              {auditSummary.navegacionTecladoActiva} / {auditSummary.totalAuditadas}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Foco accesible y atajos sin ratón
            </p>
          </div>
        </div>

        {/* Tabla de Auditoría por Institución */}
        <Card className="border-slate-200/90 shadow-xs">
          <CardHeader className="border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Auditoría Institucional Detallada</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Verifica individualmente la activación de funciones asistivas en cada institución cliente
              </p>
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar institución o CUIT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setFilterStatus('ALL')}
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
                    <th className="py-3.5 px-6 text-center">Sedes / Consultorios</th>
                    <th className="py-3.5 px-6 text-center">Lector de Pantalla</th>
                    <th className="py-3.5 px-6 text-center">Alto Contraste</th>
                    <th className="py-3.5 px-6 text-center">Navegación Teclado</th>
                    <th className="py-3.5 px-6 text-center">Cumplimiento</th>
                    <th className="py-3.5 px-6 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredInstituciones.length > 0 ? (
                    filteredInstituciones.map((inst) => {
                      const porcentaje = inst.porcentajeCumplimiento ?? 100;
                      const conforms = porcentaje >= 80;

                      return (
                        <tr
                          key={inst.institucionId || inst.nombre}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          {/* Institución */}
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

                          {/* Sedes */}
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {inst.sedesAccesibles} / {inst.sedesTotal} sedes
                            </span>
                          </td>

                          {/* Lector de Pantalla */}
                          <td className="py-4 px-6 text-center">
                            {inst.lectorPantalla ? (
                              <Badge variant="indigo" size="sm" className="font-semibold">
                                <Check className="w-3 h-3 mr-0.5 text-indigo-600" />
                                Activo
                              </Badge>
                            ) : (
                              <Badge variant="default" size="sm">
                                Pendiente
                              </Badge>
                            )}
                          </td>

                          {/* Alto Contraste */}
                          <td className="py-4 px-6 text-center">
                            {inst.altoContraste ? (
                              <Badge variant="emerald" size="sm" className="font-semibold">
                                <Check className="w-3 h-3 mr-0.5 text-emerald-600" />
                                Activo
                              </Badge>
                            ) : (
                              <Badge variant="default" size="sm">
                                Pendiente
                              </Badge>
                            )}
                          </td>

                          {/* Navegación Teclado */}
                          <td className="py-4 px-6 text-center">
                            {inst.navegacionTeclado ? (
                              <Badge variant="teal" size="sm" className="font-semibold">
                                <Check className="w-3 h-3 mr-0.5 text-teal-600" />
                                Activo
                              </Badge>
                            ) : (
                              <Badge variant="default" size="sm">
                                Pendiente
                              </Badge>
                            )}
                          </td>

                          {/* Porcentaje Cumplimiento */}
                          <td className="py-4 px-6 text-center">
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
                            </div>
                          </td>

                          {/* Acción Detalle */}
                          <td className="py-4 px-6 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAuditInst(inst)}
                              className="text-xs text-slate-700 hover:text-indigo-600 border-slate-200"
                            >
                              Ver Auditoría
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No se encontraron instituciones bajo el criterio de búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalle de Auditoría de Accesibilidad */}
      {selectedAuditInst && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAuditInst(null)}
          title={`Auditoría Técnica: ${selectedAuditInst.nombre}`}
        >
          <div className="space-y-5">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedAuditInst.nombre}</h4>
                  <p className="text-xs font-mono text-slate-500">CUIT: {selectedAuditInst.cuit}</p>
                </div>
                <Badge variant="emerald" size="md">
                  WCAG 2.1 AA Verificado
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Puntos de Control Verificados
              </h5>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-white">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Volume2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Compatibilidad con Lectores de Pantalla (Screen Readers)
                    </span>
                    <p className="text-slate-500 mt-0.5">
                      Todos los elementos interactivos, botones de agendamiento y formularios
                      cuentan con roles semánticos WAI-ARIA, etiquetas `aria-label` descriptivas y
                      anuncios de cambio de estado en vivo (`aria-live`).
                    </p>
                  </div>
                  <Badge variant="indigo" size="sm" className="ml-auto flex-shrink-0">
                    Conforme
                  </Badge>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-white">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Contrast className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Modo Alto Contraste & Legibilidad Visual
                    </span>
                    <p className="text-slate-500 mt-0.5">
                      Las tipografías y contrastes de color cumplen con un ratio mínimo de 4.5:1
                      para texto normal y 7:1 para elementos asistenciales prioritarios según la
                      norma WCAG AAA.
                    </p>
                  </div>
                  <Badge variant="emerald" size="sm" className="ml-auto flex-shrink-0">
                    Conforme
                  </Badge>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-white">
                  <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Keyboard className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Navegación Total sin Ratón (Keyboard Accessible)
                    </span>
                    <p className="text-slate-500 mt-0.5">
                      Flujo de reserva de turnos, selección de fechas y confirmación completamente
                      operables mediante la tecla Tab, Enter y atajos accesibles con anillos de foco
                      visibles (`focus-visible`).
                    </p>
                  </div>
                  <Badge variant="teal" size="sm" className="ml-auto flex-shrink-0">
                    Conforme
                  </Badge>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-white">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Hospital className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Infraestructura Física de Sedes y Consultorios
                    </span>
                    <p className="text-slate-500 mt-0.5">
                      {selectedAuditInst.sedesAccesibles} de {selectedAuditInst.sedesTotal} consultorios
                      registran nivel de accesibilidad física total o media (rampas de ingreso, ascensores
                      y baños adaptados).
                    </p>
                  </div>
                  <Badge variant="primary" size="sm" className="ml-auto flex-shrink-0">
                    Verificado
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedAuditInst(null)}>
                Cerrar Auditoría
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
