import React from 'react';
import { DataTable } from './DataTable';
import { CreateAsistenteModal } from './CreateAsistenteModal';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Plus, Trash2, Phone, Building, ShieldCheck } from 'lucide-react';

/**
 * Tabla de Personal Operativo (Asistentes y Secretarios).
 * Soporta modo readOnly para la Institución (solo lectura), mientras que el Consultorio
 * administra y da de alta a sus asistentes directamente en ConsultorioAdminPage.
 */
export const AsistentesTable = ({
  asistentes = [],
  instituciones = [],
  isLoading,
  isSubmitting,
  isModalOpen,
  setIsModalOpen,
  onCreateAsistente,
  onDeleteAsistente,
  readOnly = false,
}) => {
  const baseColumns = [
    {
      key: 'nombre',
      label: 'Personal / Asistente',
      className: 'min-w-[200px]',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0 font-bold font-heading">
            {row.nombre?.[0]}{row.apellido?.[0]}
          </div>
          <div>
            <p className="font-bold font-heading text-slate-900 leading-snug">
              {row.nombre} {row.apellido}
            </p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">CUIL: {row.cuil}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'telefono',
      label: 'Contacto',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>{row.telefono || 'Sin teléfono'}</span>
        </div>
      ),
    },
    {
      key: 'institucionNombre',
      label: 'Sede / Consultorio',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
          <Building className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
          <span>{row.consultorioNombre || row.institucionNombre || 'Sede Central'}</span>
        </div>
      ),
    },
    {
      key: 'direccionCompleta',
      label: 'Domicilio',
      render: (row) => (
        <span className="text-xs text-slate-500">
          {row.direccionCompleta || 'No informado'}
        </span>
      ),
    },
    {
      key: 'rol',
      label: 'Rol',
      render: () => (
        <Badge variant="indigo" size="sm">
          Secretaría / Asistente
        </Badge>
      ),
    },
  ];

  const columns = readOnly
    ? baseColumns
    : [
        ...baseColumns,
        {
          key: 'acciones',
          label: 'Acciones',
          className: 'text-right',
          render: (row) => (
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => onDeleteAsistente?.(row.cuil, `${row.nombre} ${row.apellido}`)}
                aria-label={`Dar de baja al asistente ${row.nombre} ${row.apellido}`}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ),
        },
      ];

  return (
    <>
      <DataTable
        title="Personal de Recepción y Asistentes"
        description={
          readOnly
            ? 'Nómina informativa de asistentes asignados a las sedes físicas. La creación y vinculación operativa es gestionada exclusivamente por el Administrador de cada Consultorio.'
            : 'Asistentes y secretarios encargados de la mesa de recepción y agendas de atención.'
        }
        columns={columns}
        data={asistentes}
        isLoading={isLoading}
        searchPlaceholder="Buscar por nombre, CUIL o teléfono..."
        searchKeys={['nombre', 'apellido', 'cuil', 'telefono', 'institucionNombre', 'consultorioNombre']}
        actionSlot={
          readOnly ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 text-slate-600 text-xs font-medium border border-slate-200 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
              <span>Alta delegada a Administradores de Consultorio</span>
            </div>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsModalOpen?.(true)}
              className="gap-1.5 text-xs font-semibold"
              aria-label="Dar de alta nuevo asistente"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>+ Nuevo Asistente</span>
            </Button>
          )
        }
      />

      {!readOnly && (
        <CreateAsistenteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen?.(false)}
          onSubmit={onCreateAsistente}
          isSubmitting={isSubmitting}
          instituciones={instituciones}
        />
      )}
    </>
  );
};
