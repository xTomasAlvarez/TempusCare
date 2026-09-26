import React from 'react';
import { useVitalityInstitutions } from '../hooks/useVitalityInstitutions';
import { CreateInstitutionModal } from '../components/CreateInstitutionModal';
import { EditInstitutionModal } from '../components/EditInstitutionModal';
import { DataTable } from '../../institution/components/DataTable';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import {
  Hospital,
  Plus,
  Pencil,
  Trash2,
  Mail,
  Layers,
  Users,
  ShieldCheck,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

/**
 * Vista de Gestión de Clientes B2B para el Super Administrador de Vitality.
 * Presenta el listado de todas las clínicas e instituciones médicas contratantes con sus planes de suscripción,
 * y permite el alta, edición y baja de cada institución.
 */
export const VitalityClientsPage = () => {
  const {
    institutions,
    stats,
    isLoading,
    isSubmitting,
    isModalOpen,
    setIsModalOpen,
    isEditModalOpen,
    editingInstitution,
    openEditModal,
    closeEditModal,
    createInstitution,
    updateInstitution,
    deleteInstitution,
  } = useVitalityInstitutions();

  const getPlanBadge = (plan) => {
    switch (plan?.toLowerCase()) {
      case 'enterprise':
        return (
          <Badge variant="indigo" size="sm" className="font-bold">
            <Sparkles className="w-3 h-3 mr-1 text-indigo-600" strokeWidth={2} />
            Enterprise
          </Badge>
        );
      case 'profesional':
        return (
          <Badge variant="primary" size="sm" className="font-bold">
            Profesional
          </Badge>
        );
      default:
        return (
          <Badge variant="default" size="sm">
            Starter
          </Badge>
        );
    }
  };

  const columns = [
    {
      key: 'nombre',
      label: 'Institución / Razón Social',
      className: 'min-w-[220px]',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-50 to-slate-50 border border-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0">
            <Hospital className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <p className="font-bold font-heading text-slate-900 leading-snug">{row.nombre}</p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">CUIT: {row.cuit}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email Administrador',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={2} />
          <span>{row.email}</span>
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan Contratado',
      render: (row) => getPlanBadge(row.plan),
    },
    {
      key: 'consultoriosNombres',
      label: 'Sedes Activas',
      render: (row) => {
        const count = row.consultoriosNombres?.length || 0;
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
            <Layers className="w-3.5 h-3.5 text-primary-600" strokeWidth={2} />
            <span>{count} {count === 1 ? 'sede' : 'sedes'}</span>
          </div>
        );
      },
    },
    {
      key: 'asistentesNombres',
      label: 'Personal Asignado',
      render: (row) => {
        const count = row.asistentesNombres?.length || 0;
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Users className="w-3.5 h-3.5 text-indigo-600" strokeWidth={2} />
            <span>{count} {count === 1 ? 'asistente' : 'asistentes'}</span>
          </div>
        );
      },
    },
    {
      key: 'estado',
      label: 'Estado Contrato',
      render: () => (
        <Badge variant="success" size="sm">
          <ShieldCheck className="w-3 h-3 mr-1" strokeWidth={2} />
          Activa
        </Badge>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openEditModal(row)}
            aria-label={`Editar institución ${row.nombre}`}
            title="Editar Institución"
            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Pencil className="w-4 h-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => deleteInstitution(row.id, row.nombre)}
            aria-label={`Desvincular institución ${row.nombre}`}
            title="Dar de baja Institución"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
            Gestión de Clientes B2B
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Supervisión, planes y configuración de instituciones médicas que operan en Tempus Care.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="gap-2 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>Nueva Institución</span>
        </Button>
      </div>

      {/* Tarjetas de Métricas de Alto Nivel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Clientes B2B</p>
            <p className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mt-1">{stats.totalClients}</p>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> 100% Retención
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
            <Hospital className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sedes Desplegadas</p>
            <p className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mt-1">{stats.totalConsultorios}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">En producción</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Personal Operativo</p>
            <p className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mt-1">{stats.totalAsistentes}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Recepcionistas activas</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Data Table de Clientes B2B */}
      <DataTable
        title="Instituciones Médicas Registradas"
        description="Contratos activos, email de contacto y configuración de sedes contratadas en la plataforma."
        columns={columns}
        data={institutions}
        isLoading={isLoading}
        searchPlaceholder="Buscar por razón social, CUIT o email..."
        searchKeys={['nombre', 'cuit', 'email', 'plan']}
      />

      {/* Modal de Alta de Institución */}
      <CreateInstitutionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createInstitution}
        isSubmitting={isSubmitting}
      />

      {/* Modal de Edición de Institución */}
      <EditInstitutionModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        institution={editingInstitution}
        onSubmit={updateInstitution}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default VitalityClientsPage;
