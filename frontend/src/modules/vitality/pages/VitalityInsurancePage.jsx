import React from 'react';
import { useVitalityInsurance } from '../hooks/useVitalityInsurance';
import { InsuranceModal } from '../components/InsuranceModal';
import { DataTable } from '../../institution/components/DataTable';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import {
  ShieldPlus,
  Plus,
  Pencil,
  Trash2,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

/**
 * Pestaña de Gestión del Catálogo Global de Obras Sociales (Super Admin Vitality).
 * Permite realizar el ABM completo de entidades aseguradoras y prepagas.
 */
export const VitalityInsurancePage = () => {
  const {
    insuranceList,
    stats,
    isLoading,
    isSubmitting,
    isModalOpen,
    editingInsurance,
    openCreateModal,
    openEditModal,
    closeModal,
    saveInsurance,
    deleteInsurance,
  } = useVitalityInsurance();

  const columns = [
    {
      key: 'nombre',
      label: 'Obra Social / Prepaga',
      className: 'min-w-[240px]',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-50 to-primary-50 border border-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <ShieldPlus className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <p className="font-bold font-heading text-slate-900 leading-snug">{row.nombre}</p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">ID Sistema: #{row.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'catalogo',
      label: 'Catálogo / Alcance de Cobertura',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 max-w-md">
          <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={2} />
          <span className="line-clamp-2">{row.catalogo || 'Sin detalle de catálogo especificado.'}</span>
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado en Red',
      render: () => (
        <Badge variant="success" size="sm">
          <CheckCircle2 className="w-3 h-3 mr-1" strokeWidth={2} />
          Habilitada
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
            aria-label={`Editar obra social ${row.nombre}`}
            title="Editar Obra Social"
            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Pencil className="w-4 h-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => deleteInsurance(row.id, row.nombre)}
            aria-label={`Eliminar obra social ${row.nombre}`}
            title="Eliminar Obra Social"
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
            Catálogo Global de Obras Sociales
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestión y parametrización de coberturas médicas admitidas en los consultorios y turnos de la red.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={openCreateModal}
          className="gap-2 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>Nueva Obra Social</span>
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Obras Sociales Registradas</p>
            <p className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mt-1">{stats.totalInsurance}</p>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Disponibles en el sistema</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ShieldPlus className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado de Convenios</p>
            <p className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mt-1">Activo</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Integración multi-sede habilitada</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Obras Sociales y Prepagas Homologadas"
        description="Listado central para la selección de cobertura en recepción, citas y aranceles médicos."
        columns={columns}
        data={insuranceList}
        isLoading={isLoading}
        searchPlaceholder="Buscar por nombre de obra social o catálogo..."
        searchKeys={['nombre', 'catalogo']}
      />

      {/* Modal de Alta / Modificación */}
      <InsuranceModal
        isOpen={isModalOpen}
        onClose={closeModal}
        insurance={editingInsurance}
        onSubmit={saveInsurance}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default VitalityInsurancePage;
