import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../core/context/AuthContext';
import { useConsultoriosManager } from '../hooks/useConsultoriosManager';
import { ConsultoriosTable } from '../components/ConsultoriosTable';
import { Hospital, Building2, UserCheck, Star, Eye } from 'lucide-react';
import {
  staggerContainerVariants,
  staggerItemVariants,
  pageTransitionVariants,
} from '../../../shared/motion';

/**
 * Panel de Administración Institucional.
 * Regla de Negocio RBAC: Restringido ÚNICAMENTE a la creación y visualización de Sedes (Consultorios).
 * Este rol no puede crear médicos ni asistentes.
 */
export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const consultoriosState = useConsultoriosManager(user?.institucionId);
  const metricas = consultoriosState.metricas;

  return (
    <motion.div variants={pageTransitionVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Encabezado General del Dashboard Institucional */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 shadow-xs">
              <Building2 className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
                Gestión Institucional de Sedes
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visualización y creación de consultorios y sedes físicas de la institución.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-600 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Administrador Institucional: <strong>{user?.nombreCompleto || (user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : 'Administrador Institución')}</strong></span>
          </div>
        </div>
      </div>

      {/* Tarjetas Métricas Institucionales en Cascada */}
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {/* Pacientes Atendidos */}
        <motion.div
          variants={staggerItemVariants}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4 transition-transform duration-75 active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <UserCheck className="w-6 h-6" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pacientes Atendidos
            </p>
            <p className="text-2xl font-bold font-heading text-slate-900 mt-0.5">
              {metricas?.pacientesAtendidos ?? 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Consultas finalizadas en la institución
            </p>
          </div>
        </motion.div>

        {/* Calificación Promedio */}
        <motion.div
          variants={staggerItemVariants}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4 transition-transform duration-75 active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
            <Star className="w-6 h-6 fill-amber-400 text-amber-500" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Calificación Promedio
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold font-heading text-slate-900">
                {metricas?.calificacionPromedio > 0 ? Number(metricas.calificacionPromedio).toFixed(1) : 'S/V'}
              </span>
              {metricas?.calificacionPromedio > 0 && (
                <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {metricas?.calificacionPromedio > 0 ? 'Satisfacción institucional' : 'Sin valoraciones aún'}
            </p>
          </div>
        </motion.div>

        {/* Visitas al Perfil */}
        <motion.div
          variants={staggerItemVariants}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4 transition-transform duration-75 active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Eye className="w-6 h-6" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Visitas al Perfil
            </p>
            <p className="text-2xl font-bold font-heading text-slate-900 mt-0.5">
              {(metricas?.visitasPerfil ?? 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Vistas acumuladas en la plataforma
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Tabla y Modales de Sedes / Consultorios (Alta y Edición) */}
      <ConsultoriosTable
        consultorios={consultoriosState.consultorios}
        instituciones={consultoriosState.instituciones}
        isLoading={consultoriosState.isLoading}
        isSubmitting={consultoriosState.isSubmitting}
        isModalOpen={consultoriosState.isModalOpen}
        setIsModalOpen={consultoriosState.setIsModalOpen}
        onCreateConsultorio={consultoriosState.createConsultorio}
        onDeleteConsultorio={consultoriosState.deleteConsultorio}
        onEditConsultorio={consultoriosState.openEditModal}
        isEditModalOpen={consultoriosState.isEditModalOpen}
        onCloseEditModal={consultoriosState.closeEditModal}
        editingConsultorio={consultoriosState.editingConsultorio}
        onUpdateConsultorio={consultoriosState.updateConsultorio}
      />
    </motion.div>
  );
};

export default AdminDashboardPage;
