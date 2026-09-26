import React, { useState } from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { useVitalityAdmins } from '../hooks/useVitalityAdmins';
import { ProposeAdminModal } from '../components/ProposeAdminModal';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import {
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Lock,
  Mail,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Shield,
  KeyRound,
} from 'lucide-react';

/**
 * Vista de Gestión de Admins y Protocolo de Consenso Multipartito (Super Admin).
 * Reemplaza la creación directa de Super Admins por un flujo de aprobación cruzada de terceros:
 * Si Super Admin A propone al Super Admin B, un Super Admin C debe aprobar la solicitud.
 */
export const VitalityAdminsPage = () => {
  const { user } = useAuth();
  const {
    requests,
    pendingRequests,
    resolvedRequests,
    admins,
    isLoading,
    isSubmitting,
    isProposeModalOpen,
    setIsProposeModalOpen,
    error,
    proposeAdmin,
    approveAdmin,
    rejectAdmin,
    refreshAdmins,
  } = useVitalityAdmins();

  const [activeTab, setActiveTab] = useState('PENDING'); // 'PENDING' | 'ACTIVE_ADMINS' | 'HISTORY'

  // Determina si el usuario logueado es el proponente de una solicitud
  const isCurrentProposer = (solicitud) => {
    if (!user) return false;
    const currentUserId = user.id || user.usuarioId;
    if (currentUserId && solicitud.proponenteId === currentUserId) return true;
    if (user.usuario && solicitud.proponenteNombre === user.usuario) return true;
    if (user.mail && solicitud.proponenteNombre === user.mail) return true;
    return false;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <KeyRound className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Gobernanza & Seguridad de Vitality
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
            Gestión de Administradores
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Protocolo de consenso multipartito. La incorporación de nuevos Super Administradores
            requiere la aprobación cruzada de un tercer administrador independiente.
          </p>
        </div>

        {/* Botón Requerido: "Proponer Nuevo Admin" (reemplazando cualquier botón directo) */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAdmins}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white text-slate-700 hover:text-slate-900 border-slate-300"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-primary-600' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsProposeModalOpen(true)}
            className="gap-2 bg-primary-600 hover:bg-primary-700 font-semibold shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Proponer Nuevo Admin</span>
          </Button>
        </div>
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={refreshAdmins}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Banner Explicativo del Protocolo de Consenso Multipartito */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="indigo" size="sm" className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Seguridad de Cuatro Ojos (Two-Man Rule)
              </Badge>
            </div>
            <h2 className="text-lg font-bold font-heading text-white">
              Regla de Aprobación Cruzada Obligatoria
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Si el <strong>Super Admin A</strong> propone crear la cuenta del usuario <strong>B</strong>,
              un <strong>Super Admin C</strong> debe auditar y aprobar la solicitud. El proponente tiene
              estrictamente bloqueada la auto-aprobación para garantizar la integridad del SaaS.
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 bg-white/5 p-3 rounded-xl border border-white/10 text-xs">
            <div className="text-center px-2">
              <span className="block font-bold text-base text-white">{admins.length}</span>
              <span className="text-[11px] text-slate-400">Admins Activos</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center px-2">
              <span className="block font-bold text-base text-amber-400">{pendingRequests.length}</span>
              <span className="text-[11px] text-slate-400">Por Consensuar</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center px-2">
              <span className="block font-bold text-base text-emerald-400">{resolvedRequests.length}</span>
              <span className="text-[11px] text-slate-400">Procesadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas de Vista */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('PENDING')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'PENDING'
              ? 'bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Solicitudes Pendientes</span>
          {pendingRequests.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ACTIVE_ADMINS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'ACTIVE_ADMINS'
              ? 'bg-primary-50 text-primary-700 border border-primary-200/90 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4 text-primary-600" />
          <span>Super Administradores Activos ({admins.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HISTORY')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'HISTORY'
              ? 'bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          <span>Historial de Consenso ({resolvedRequests.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. TABLA OBLIGATORIA: SOLICITUDES PENDIENTES                              */}
      {/* ========================================================================= */}
      {activeTab === 'PENDING' && (
        <Card className="border-slate-200/90 shadow-xs">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  Solicitudes Pendientes de Consenso
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Propuestas de nuevas credenciales de Super Administrador que esperan auditoría de un par
                </p>
              </div>
              <Badge variant="warning" size="sm" className="font-semibold self-start sm:self-auto">
                {pendingRequests.length} solicitud(es) por resolver
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Email Propuesto</th>
                    <th className="py-3.5 px-6">Proponente</th>
                    <th className="py-3.5 px-6">Fecha de Solicitud</th>
                    <th className="py-3.5 px-6 text-center">Estado</th>
                    <th className="py-3.5 px-6 text-right">Acción de Consenso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {pendingRequests.length > 0 ? (
                    pendingRequests.map((req) => {
                      const isProposer = isCurrentProposer(req);

                      return (
                        <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Email Propuesto */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center flex-shrink-0">
                                <Mail className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 text-sm block">
                                  {req.emailPropuesto}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400">
                                  Solicitud #{req.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Proponente */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold font-heading">
                                SA
                              </div>
                              <div>
                                <span className="font-semibold text-slate-800 block">
                                  {req.proponenteNombre}
                                </span>
                                {isProposer && (
                                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    Propuesto por ti
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Fecha */}
                          <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                            {new Date(req.fechaCreacion).toLocaleString('es-AR', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </td>

                          {/* Estado */}
                          <td className="py-4 px-6 text-center">
                            <Badge variant="warning" size="sm" className="font-semibold">
                              <Clock className="w-3 h-3 mr-1 text-amber-600" />
                              Pendiente
                            </Badge>
                          </td>

                          {/* ACCIÓN REQUERIDA ESTRICTA:
                              Si el usuario logueado NO fue el que propuso a la persona de la fila,
                              muéstrale un botón verde de "Aprobar Creación". */}
                          <td className="py-4 px-6 text-right">
                            {!isProposer ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="primary"
                                  size="sm"
                                  onClick={() => approveAdmin(req.id, req.emailPropuesto)}
                                  disabled={isSubmitting}
                                  className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs gap-1.5 shadow-xs"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Aprobar Creación</span>
                                </Button>

                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => rejectAdmin(req.id, req.emailPropuesto)}
                                  disabled={isSubmitting}
                                  className="text-slate-500 hover:text-rose-600 hover:border-rose-200 text-xs"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Rechazar</span>
                                </Button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50/90 text-amber-800 border border-amber-200 text-xs font-semibold">
                                <Lock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                                <span>Esperando aprobación de tercero</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <CheckCircle className="w-8 h-8 text-emerald-500/50" />
                          <p className="text-sm font-medium text-slate-600">
                            No hay solicitudes pendientes de consenso
                          </p>
                          <p className="text-xs text-slate-400 max-w-sm">
                            Todas las propuestas de creación de administradores han sido procesadas.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 2. TABLA: SUPER ADMINISTRADORES ACTIVOS                                   */}
      {/* ========================================================================= */}
      {activeTab === 'ACTIVE_ADMINS' && (
        <Card className="border-slate-200/90 shadow-xs">
          <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                Super Administradores Activos en la Plataforma
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Cuentas con privilegios totales de administración B2B y gobierno del SaaS Vitality
              </p>
            </div>
            <Badge variant="primary" size="sm" className="font-semibold">
              {admins.length} cuentas autorizadas
            </Badge>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Usuario / Identificador</th>
                    <th className="py-3.5 px-6">Email Oficial</th>
                    <th className="py-3.5 px-6">Rol de Sistema</th>
                    <th className="py-3.5 px-6 text-center">Estado</th>
                    <th className="py-3.5 px-6 text-right">Sesión Actual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {admins.map((adm) => {
                    const isYou =
                      (user?.id && adm.id === user.id) ||
                      (user?.usuario && adm.nombreUsuario === user.usuario) ||
                      (user?.mail && adm.mail === user.mail);

                    return (
                      <tr key={adm.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 text-primary-700 flex items-center justify-center font-bold">
                              <Shield className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 text-sm block">
                                {adm.nombreUsuario}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">
                                ID #{adm.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                          {adm.mail}
                        </td>

                        <td className="py-4 px-6">
                          <Badge variant="indigo" size="sm" className="font-bold">
                            <Sparkles className="w-3 h-3 mr-1 text-indigo-600" />
                            SuperAdmin
                          </Badge>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <Badge variant="emerald" size="sm" className="font-semibold">
                            Activo
                          </Badge>
                        </td>

                        <td className="py-4 px-6 text-right">
                          {isYou ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                              Tu Sesión
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">Consenso Habilitado</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 3. HISTORIAL DE SOLICITUDES RESUELTAS                                    */}
      {/* ========================================================================= */}
      {activeTab === 'HISTORY' && (
        <Card className="border-slate-200/90 shadow-xs">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Historial de Auditoría de Consenso
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Registro inmutable de solicitudes procesadas y aprobaciones cruzadas de administradores
            </p>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Email Propuesto</th>
                    <th className="py-3.5 px-6">Super Admin Proponente</th>
                    <th className="py-3.5 px-6">Super Admin Aprobador</th>
                    <th className="py-3.5 px-6 text-center">Resolución</th>
                    <th className="py-3.5 px-6 text-right">Fecha de Resolución</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {resolvedRequests.length > 0 ? (
                    resolvedRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {req.emailPropuesto}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {req.proponenteNombre}
                        </td>
                        <td className="py-4 px-6 text-slate-700 font-medium">
                          {req.aprobadorNombre || 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {req.estado === 'Aprobada' ? (
                            <Badge variant="emerald" size="sm" className="font-bold">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Aprobada
                            </Badge>
                          ) : (
                            <Badge variant="danger" size="sm" className="font-bold">
                              <XCircle className="w-3 h-3 mr-1" />
                              Rechazada
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-[11px] text-slate-400">
                          {req.fechaResolucion
                            ? new Date(req.fechaResolucion).toLocaleString('es-AR', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No hay solicitudes archivadas todavía.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal para Proponer Nuevo Super Admin */}
      <ProposeAdminModal
        isOpen={isProposeModalOpen}
        onClose={() => setIsProposeModalOpen(false)}
        onSubmit={proposeAdmin}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
