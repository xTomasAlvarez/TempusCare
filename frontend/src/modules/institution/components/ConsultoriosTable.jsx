import React from 'react';
import { DataTable } from './DataTable';
import { CreateConsultorioModal } from './CreateConsultorioModal';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Building2, Plus, Trash2, MapPin, Phone, Mail, Stethoscope } from 'lucide-react';

/**
 * Tabla de Sedes Físicas y Consultorios Médicos.
 */
export const ConsultoriosTable = ({
  consultorios = [],
  instituciones = [],
  isLoading,
  isSubmitting,
  isModalOpen,
  setIsModalOpen,
  onCreateConsultorio,
  onDeleteConsultorio,
}) => {
  const getAccessibilityBadge = (nivel) => {
    switch (nivel?.toLowerCase()) {
      case 'total':
        return <Badge variant="success" size="sm">Accesibilidad Total</Badge>;
      case 'media':
        return <Badge variant="primary" size="sm">Accesibilidad Media</Badge>;
      case 'especializada':
        return <Badge variant="indigo" size="sm">Especializada</Badge>;
      default:
        return <Badge variant="default" size="sm">{nivel || 'Estándar'}</Badge>;
    }
  };

  const columns = [
    {
      key: 'nombre',
      label: 'Sede / Consultorio',
      className: 'min-w-[220px]',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <p className="font-bold font-heading text-slate-900 leading-snug">{row.nombre}</p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">CUIT: {row.cuit}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'direccionCompleta',
      label: 'Dirección Física',
      className: 'min-w-[200px]',
      render: (row) => (
        <div className="flex items-start gap-1.5 text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <span className="text-xs leading-relaxed">{row.direccionCompleta || 'No informada'}</span>
        </div>
      ),
    },
    {
      key: 'nivelAccesibilidad',
      label: 'Accesibilidad',
      render: (row) => getAccessibilityBadge(row.nivelAccesibilidad),
    },
    {
      key: 'contacto',
      label: 'Contacto',
      render: (row) => (
        <div className="space-y-0.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{row.telefono || 'Sin teléfono'}</span>
          </div>
          {row.email && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{row.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'profesionalesNombres',
      label: 'Médicos Asignados',
      render: (row) => {
        const profs = row.profesionalesNombres || [];
        if (profs.length === 0) {
          return <span className="text-xs text-slate-400 italic">Sin médicos asignados</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {profs.slice(0, 2).map((nombre, i) => (
              <Badge key={i} variant="default" size="sm">
                <Stethoscope className="w-2.5 h-2.5 text-teal-600 mr-1" />
                {nombre}
              </Badge>
            ))}
            {profs.length > 2 && (
              <Badge variant="default" size="sm">+{profs.length - 2}</Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'acciones',
      label: 'Acciones',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onDeleteConsultorio(row.cuit, row.nombre)}
            aria-label={`Eliminar consultorio ${row.nombre}`}
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
        title="Gestión de Sedes y Consultorios"
        description="Infraestructura física, consultorios disponibles y accesibilidad universal de la institución."
        columns={columns}
        data={consultorios}
        isLoading={isLoading}
        searchPlaceholder="Buscar por nombre, CUIT o dirección..."
        searchKeys={['nombre', 'cuit', 'direccionCompleta', 'nivelAccesibilidad']}
        actionSlot={
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="gap-1.5 text-xs font-semibold"
            aria-label="Registrar nueva sede o consultorio"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>+ Nueva Sede</span>
          </Button>
        }
      />

      <CreateConsultorioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onCreateConsultorio}
        isSubmitting={isSubmitting}
        instituciones={instituciones}
      />
    </>
  );
};
