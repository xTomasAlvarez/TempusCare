import React, { useState } from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { useConsultoriosManager } from '../hooks/useConsultoriosManager';
import { useAsistentesManager } from '../hooks/useAsistentesManager';
import { ConsultoriosTable } from '../components/ConsultoriosTable';
import { AsistentesTable } from '../components/AsistentesTable';
import { CoverageParameterizationForm } from '../components/CoverageParameterizationForm';
import { Badge } from '../../../shared/components/ui/Badge';
import { Building2, Users, Shield, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

/**
 * Página Principal de Administración Institucional y Catálogos B2B.
 * Permite gestionar Sedes (Consultorios), Personal (Asistentes) y la Parametrización de Cobertura (RN-02).
 */
export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('sedes'); // 'sedes' | 'personal' | 'coberturas'

  // Gestores de Sedes y Personal
  const consultoriosState = useConsultoriosManager();
  const asistentesState = useAsistentesManager();

  const tabs = [
    {
      id: 'sedes',
      label: 'Sedes y Consultorios',
      icon: Building2,
      count: consultoriosState.consultorios.length,
    },
    {
      id: 'personal',
      label: 'Personal y Secretarías',
      icon: Users,
      count: asistentesState.asistentes.length,
    },
    {
      id: 'coberturas',
      label: 'Parametrización de Cobertura (RN-02)',
      icon: Shield,
      badge: 'Crítico',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado General del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
              Administración Institucional
            </h1>
            <Badge variant="indigo" size="sm">B2B</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestión de infraestructura física, asistentes de recepción y parametrización de cobertura médica (RN-02).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-600 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Operando como <strong>{user?.usuario}</strong></span>
          </div>
        </div>
      </div>

      {/* Navegación por Pestañas (Tabs Accesibles) */}
      <div className="border-b border-slate-200/80">
        <nav
          role="tablist"
          aria-label="Secciones de administración institucional"
          className="flex flex-wrap gap-2 -mb-px"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-semibold transition-all duration-200 rounded-t-xl focus:outline-none focus:ring-2 focus:ring-teal-500',
                  isActive
                    ? 'border-teal-600 text-teal-700 bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-teal-600' : 'text-slate-400')} />
                <span>{tab.label}</span>

                {tab.count !== undefined && (
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5',
                      isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-200/70 text-slate-600'
                    )}
                  >
                    {tab.count}
                  </span>
                )}

                {tab.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-rose-50 border border-rose-200 text-rose-700 px-1.5 py-0.2 rounded-sm ml-1">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido de la Pestaña Activa */}
      <div role="tabpanel" className="animate-in fade-in-50 duration-200">
        {activeTab === 'sedes' && (
          <ConsultoriosTable
            consultorios={consultoriosState.consultorios}
            instituciones={consultoriosState.instituciones}
            isLoading={consultoriosState.isLoading}
            isSubmitting={consultoriosState.isSubmitting}
            isModalOpen={consultoriosState.isModalOpen}
            setIsModalOpen={consultoriosState.setIsModalOpen}
            onCreateConsultorio={consultoriosState.createConsultorio}
            onDeleteConsultorio={consultoriosState.deleteConsultorio}
          />
        )}

        {activeTab === 'personal' && (
          <AsistentesTable
            asistentes={asistentesState.asistentes}
            instituciones={asistentesState.instituciones}
            isLoading={asistentesState.isLoading}
            isSubmitting={asistentesState.isSubmitting}
            isModalOpen={asistentesState.isModalOpen}
            setIsModalOpen={asistentesState.setIsModalOpen}
            onCreateAsistente={asistentesState.createAsistente}
            onDeleteAsistente={asistentesState.deleteAsistente}
          />
        )}

        {activeTab === 'coberturas' && (
          <CoverageParameterizationForm />
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
