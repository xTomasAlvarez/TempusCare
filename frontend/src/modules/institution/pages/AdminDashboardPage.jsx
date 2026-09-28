import React from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { useConsultoriosManager } from '../hooks/useConsultoriosManager';
import { ConsultoriosTable } from '../components/ConsultoriosTable';
import { Hospital, Building2 } from 'lucide-react';

/**
 * Panel de Administración Institucional.
 * Regla de Negocio RBAC: Restringido ÚNICAMENTE a la creación y visualización de Sedes (Consultorios).
 * Este rol no puede crear médicos ni asistentes.
 */
export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const consultoriosState = useConsultoriosManager();

  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default AdminDashboardPage;
