import React from 'react';
import { useVitalityMetrics } from '../hooks/useVitalityMetrics';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import {
  Hospital,
  Building2,
  Users,
  CalendarCheck,
  TrendingUp,
  RefreshCw,
  Award,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

/**
 * Pestaña de Métricas de Adopción para el Super Administrador de Vitality.
 * Consume GET /api/vitality/metrics y presenta estadísticas globales de la plataforma:
 * - Total de instituciones activas
 * - Sedes registradas
 * - Profesionales en la plataforma
 * - Volumen de turnos procesados
 * Con gráficos dinámicos e interactivos mediante Recharts.
 */
export const VitalityMetricsPage = () => {
  const { metrics, isLoading, error, refreshMetrics } = useVitalityMetrics();

  // Colores profesionales para Recharts
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
  const PLAN_COLORS = {
    Enterprise: '#6366f1',
    Profesional: '#0284c7',
    Starter: '#64748b',
  };

  const planChartData = (metrics.institucionesPorPlan || []).map((item) => ({
    name: item.plan || item.Plan || 'Otro',
    value: item.cantidad ?? item.Cantidad ?? 0,
  }));

  const turnosEstadoData = (metrics.turnosPorEstado || []).map((item) => ({
    name: item.estado || item.Estado || 'Desconocido',
    value: item.cantidad ?? item.Cantidad ?? 0,
  }));

  const profsEspecData = (metrics.profesionalesPorEspecialidad || []).map((item) => ({
    name: item.especialidad || item.Especialidad || 'General',
    profesionales: item.cantidad ?? item.Cantidad ?? 0,
  }));

  const volumenData = (metrics.volumenMensual || []).map((item) => ({
    mes: item.mes || item.Mes,
    Turnos: item.turnos ?? item.Turnos ?? 0,
    Citas: item.citas ?? item.Citas ?? 0,
  }));

  // Estadísticas derivadas
  const promedioSedesPorInst =
    metrics.totalInstituciones > 0
      ? (metrics.totalSedes / metrics.totalInstituciones).toFixed(1)
      : '0';

  const promedioMedicosPorInst =
    metrics.totalInstituciones > 0
      ? (metrics.totalProfesionales / metrics.totalInstituciones).toFixed(1)
      : '0';

  const tasaOcupacion =
    metrics.totalTurnos > 0
      ? (((metrics.totalCitas || 1) / metrics.totalTurnos) * 100).toFixed(1)
      : '0';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-primary-50 text-primary-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-700">
              Panel de Control Global
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
            Métricas de Adopción de la Plataforma
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Monitoriza en tiempo real la penetración del SaaS Vitality, expansión de sedes, capacidad médica
            y el flujo transaccional de turnos y citas médicas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white text-slate-700 hover:text-primary-700 border-slate-300"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-primary-600' : ''}`} />
            <span>Actualizar Métricas</span>
          </Button>
        </div>
      </div>

      {/* Alerta de Error si ocurre */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={refreshMetrics}>Reintentar</Button>
        </div>
      )}

      {/* Tarjetas de Resumen Principales (4 Métricas Estrictas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Instituciones Activas */}
        <Card className="hover:shadow-md transition-all border-slate-200/90 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
                Instituciones Activas
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Hospital className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-heading text-slate-900">
                {isLoading ? '...' : metrics.totalInstituciones}
              </span>
              <Badge variant="emerald" size="sm" className="font-semibold">
                +100% activas
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Clientes B2B multi-tenant en producción
            </p>
          </CardContent>
        </Card>

        {/* 2. Sedes Registradas */}
        <Card className="hover:shadow-md transition-all border-slate-200/90 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
                Sedes Registradas
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-heading text-slate-900">
                {isLoading ? '...' : metrics.totalSedes}
              </span>
              <Badge variant="teal" size="sm" className="font-semibold">
                {promedioSedesPorInst} por cliente
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Consultorios y centros operativos
            </p>
          </CardContent>
        </Card>

        {/* 3. Profesionales en la Plataforma */}
        <Card className="hover:shadow-md transition-all border-slate-200/90 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-600" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
                Profesionales en Red
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-heading text-slate-900">
                {isLoading ? '...' : metrics.totalProfesionales}
              </span>
              <Badge variant="indigo" size="sm" className="font-semibold">
                {promedioMedicosPorInst} por sede
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-purple-500" />
              Especialistas con agendas habilitadas
            </p>
          </CardContent>
        </Card>

        {/* 4. Volumen de Turnos Procesados */}
        <Card className="hover:shadow-md transition-all border-slate-200/90 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
                Volumen de Turnos
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-heading text-slate-900">
                {isLoading ? '...' : metrics.totalTurnos}
              </span>
              <Badge variant="warning" size="sm" className="font-semibold">
                {metrics.totalCitas} citas
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              Franjas horarias y slots asistenciales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Visuales de Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Evolución y Volumen Mensual (Span 2 cols) */}
        <Card className="lg:col-span-2 border-slate-200/90">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-600" />
                Evolución Mensual: Turnos Habilitados vs Citas Agendadas
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Capacidad asistencial generada mes a mes en todo el ecosistema hospitalario
              </p>
            </div>
            <Badge variant="default" size="sm" className="font-mono">
              Últimos 5 meses
            </Badge>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[280px] w-full">
              {volumenData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumenData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="mes"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '13px' }} />
                    <Bar dataKey="Turnos" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Turnos Totales" />
                    <Bar dataKey="Citas" fill="#10b981" radius={[6, 6, 0, 0]} name="Citas Confirmadas" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Cargando datos históricos...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico 2: Distribución por Plan de Suscripción */}
        <Card className="border-slate-200/90">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-indigo-600" />
              Instituciones por Plan
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Segmentación comercial de los clientes activos
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[220px] w-full">
              {planChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {planChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PLAN_COLORS[entry.name] || PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No hay datos suficientes
                </div>
              )}
            </div>
            {/* Leyenda personalizada */}
            <div className="mt-2 space-y-2">
              {planChartData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          PLAN_COLORS[item.name] || PIE_COLORS[idx % PIE_COLORS.length],
                      }}
                    />
                    <span className="font-medium text-slate-800">Plan {item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.value} ({((item.value / (metrics.totalInstituciones || 1)) * 100).toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico 3 & 4: Profesionales por Especialidad y Turnos por Estado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profesionales por Especialidad */}
        <Card className="border-slate-200/90">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Profesionales por Especialidad Médica
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Cobertura de especialidades en la red asistencial
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[250px] w-full">
              {profsEspecData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={profsEspecData}
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 11, fill: '#334155' }}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                      }}
                    />
                    <Bar dataKey="profesionales" fill="#0d9488" radius={[0, 6, 6, 0]} name="Médicos Activos" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Sin especialidades registradas
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estado del Inventario de Turnos */}
        <Card className="border-slate-200/90">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-indigo-600" />
              Distribución de Turnos por Estado
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Disponibilidad inmediata vs turnos reservados y atendidos
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[200px] w-full">
              {turnosEstadoData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={turnosEstadoData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {turnosEstadoData.map((entry, index) => {
                        let color = '#3b82f6';
                        if (entry.name === 'Disponible') color = '#10b981';
                        if (entry.name === 'Reservado') color = '#f59e0b';
                        if (entry.name === 'Atendido') color = '#8b5cf6';
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Sin turnos creados
                </div>
              )}
            </div>
            {/* Badges de Estado */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
              {turnosEstadoData.map((item, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-50">
                  <span className="block text-[11px] font-medium text-slate-500">{item.name}</span>
                  <span className="text-base font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs de Rendimiento de la Red */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/40 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <Award className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Capacidad Promedio</span>
          </div>
          <div className="text-2xl font-bold font-heading text-slate-900">
            {promedioSedesPorInst} Sedes / Institución
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Nivel de escalabilidad multi-sede adoptado por las redes médicas adheridas.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-700 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Cuerpo Médico</span>
          </div>
          <div className="text-2xl font-bold font-heading text-slate-900">
            {promedioMedicosPorInst} Profesionales / Sede
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Densidad de atención por consultorio registrado en la base central.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/40 border border-purple-100">
          <div className="flex items-center gap-2 text-purple-700 mb-2">
            <Activity className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Disponibilidad Inmediata</span>
          </div>
          <div className="text-2xl font-bold font-heading text-slate-900">
            {metrics.totalTurnos > 0 ? `${(100 - parseFloat(tasaOcupacion)).toFixed(0)}%` : '100%'} Disponible
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Capacidad ociosa lista para ser asignada a pacientes en tiempo real.
          </p>
        </div>
      </div>
    </div>
  );
};
