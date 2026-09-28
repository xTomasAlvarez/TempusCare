import React, { useState } from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { useConsultorioAdmin } from '../hooks/useConsultorioAdmin';
import { DataTable } from '../components/DataTable';
import { CreateAsistenteModal } from '../components/CreateAsistenteModal';
import { EditAsistenteModal } from '../components/EditAsistenteModal';
import { AssignProfesionalModal } from '../components/AssignProfesionalModal';
import { EditProfesionalModal } from '../components/EditProfesionalModal';
import { CreateProfesionalModal } from '../components/CreateProfesionalModal';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import {
  Hospital,
  Users,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Pencil,
  UserRoundPlus,
  Link2,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

/**
 * Panel de Administración de Sede (Administrador de Sede).
 * ABM completo de Médicos y Asistentes restringido a este rol y sede.
 */
export const ConsultorioAdminPage = () => {
  const { user } = useAuth();
  const consultorioCuit = user?.consultorioCuit || '30111222331';

  const {
    consultorio,
    asistentes,
    profesionales,
    allProfesionales,
    especialidades,
    isLoading,
    isSubmitting,
    createAsistente,
    updateAsistente,
    deleteAsistente,
    assignProfesional,
    removeProfesional,
    registerDoctor,
    updateDoctor,
    deleteDoctor,
    editingAsistente,
    isEditAsistenteModalOpen,
    openEditAsistenteModal,
    closeEditAsistenteModal,
    editingProfesional,
    isEditProfesionalModalOpen,
    openEditProfesionalModal,
    closeEditProfesionalModal,
  } = useConsultorioAdmin(consultorioCuit);

  const [activeTab, setActiveTab] = useState('medicos'); // 'medicos' | 'asistentes'
  const [isAsistenteModalOpen, setIsAsistenteModalOpen] = useState(false);
  const [isProfesionalModalOpen, setIsProfesionalModalOpen] = useState(false);
  const [isCreateProfesionalModalOpen, setIsCreateProfesionalModalOpen] = useState(false);

  // Columnas para la tabla de Médicos
  const medicoColumns = [
    {
      key: 'nombre',
      label: 'Médico',
      className: 'min-w-[220px]',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0 font-bold font-heading">
            <Stethoscope className="w-4 h-4" strokeWidth={2} />
          </div>
          <div>
            <p className="font-bold font-heading text-slate-900 leading-snug">
              Dr./Dra. {row.nombre} {row.apellido}
            </p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              CUIL: {row.cuil}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>{row.email || 'Sin registrar'}</span>
        </div>
      ),
    },
    {
      key: 'especialidades',
      label: 'Especialidad',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.especialidades?.length > 0 ? (
            row.especialidades.map((esp, i) => (
              <span
                key={i}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 border border-primary-200/50"
              >
                {esp}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">Sin especialidad</span>
          )}
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: () => (
        <Badge variant="emerald" size="sm">
          Activo
        </Badge>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => openEditProfesionalModal(row)}
            className="text-slate-600 hover:text-primary-700 hover:bg-primary-50"
            title="Editar médico"
          >
            <Pencil className="w-3.5 h-3.5 mr-1" />
            Editar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => deleteDoctor(row.cuil, `Dr./Dra. ${row.nombre} ${row.apellido}`)}
            className="text-rose-600 hover:bg-rose-50"
            title="Eliminar médico"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  // Columnas para la tabla de Asistentes
  const asistenteColumns = [
    {
      key: 'nombre',
      label: 'Asistente',
      className: 'min-w-[220px]',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0 font-bold font-heading">
            {row.nombre?.[0]}{row.apellido?.[0]}
          </div>
          <div>
            <p className="font-bold font-heading text-slate-900 leading-snug">
              {row.nombre} {row.apellido}
            </p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">DNI/CUIL: {row.cuil}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>{row.email || 'Sin registrar'}</span>
        </div>
      ),
    },
    {
      key: 'sede',
      label: 'Sede Asignada',
      render: (row) => (
        <Badge variant="primary" size="sm">
          {row.consultorioNombre || consultorio?.nombre || 'Sede Actual'}
        </Badge>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => openEditAsistenteModal(row)}
            className="text-slate-600 hover:text-primary-700 hover:bg-primary-50"
            title="Editar asistente"
          >
            <Pencil className="w-3.5 h-3.5 mr-1" />
            Editar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => deleteAsistente(row.cuil, `${row.nombre} ${row.apellido}`)}
            className="text-rose-600 hover:bg-rose-50"
            title="Eliminar asistente"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tarjeta Superior de Identidad de la Sede Física */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary-600/20">
              <Hospital className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
                  {consultorio?.nombre || user?.sedeNombre || 'Sede Física'}
                </h1>
                <Badge variant="primary" size="sm">
                  Administrador de Sede
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Panel operativo local. Administra el cuerpo de médicos y los asistentes de recepción de esta sede.
              </p>

              {/* Metadatos de la Sede */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600">
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  CUIT: {consultorioCuit}
                </span>
                {consultorio?.direccionCompleta && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {consultorio.direccionCompleta}
                  </span>
                )}
                {consultorio?.telefono && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {consultorio.telefono}
                  </span>
                )}
                {consultorio?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {consultorio.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
              <span className="block text-[10px] text-slate-400 uppercase font-bold font-heading">Administrador a cargo</span>
              <span className="font-bold text-slate-800">{user?.nombreCompleto || (user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : 'Administrador de Sede')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas: Gestión de Médicos y Gestión de Asistentes */}
      <div className="border-b border-slate-200/80">
        <nav
          role="tablist"
          aria-label="Gestión de Sede"
          className="flex flex-wrap gap-2 -mb-px"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'medicos'}
            onClick={() => setActiveTab('medicos')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-semibold transition-all duration-200 rounded-t-xl focus:outline-none focus:ring-2 focus:ring-primary-500',
              activeTab === 'medicos'
                ? 'border-primary-600 text-primary-700 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            )}
          >
            <Stethoscope className={cn('w-4 h-4', activeTab === 'medicos' ? 'text-primary-600' : 'text-slate-400')} strokeWidth={2} />
            <span>Gestión de Médicos</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5',
                activeTab === 'medicos' ? 'bg-primary-100 text-primary-800' : 'bg-slate-200/70 text-slate-600'
              )}
            >
              {profesionales.length}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'asistentes'}
            onClick={() => setActiveTab('asistentes')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-semibold transition-all duration-200 rounded-t-xl focus:outline-none focus:ring-2 focus:ring-primary-500',
              activeTab === 'asistentes'
                ? 'border-primary-600 text-primary-700 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            )}
          >
            <Users className={cn('w-4 h-4', activeTab === 'asistentes' ? 'text-primary-600' : 'text-slate-400')} strokeWidth={2} />
            <span>Gestión de Asistentes</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5',
                activeTab === 'asistentes' ? 'bg-primary-100 text-primary-800' : 'bg-slate-200/70 text-slate-600'
              )}
            >
              {asistentes.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Contenido Pestaña 1: Gestión de Médicos */}
      {activeTab === 'medicos' && (
        <DataTable
          title="Gestión de Médicos"
          subtitle="Listado y administración de médicos registrados para la atención en esta sede."
          data={profesionales}
          columns={medicoColumns}
          isLoading={isLoading}
          searchPlaceholder="Buscar por nombre, apellido, especialidad o CUIL..."
          filterKey="nombre"
          actionButton={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsProfesionalModalOpen(true)}
              >
                <Link2 className="w-4 h-4 mr-1.5" strokeWidth={2} />
                Vincular Existente
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsCreateProfesionalModalOpen(true)}
              >
                <UserRoundPlus className="w-4 h-4 mr-1.5" strokeWidth={2} />
                Nuevo Médico
              </Button>
            </div>
          }
        />
      )}

      {/* Contenido Pestaña 2: Gestión de Asistentes */}
      {activeTab === 'asistentes' && (
        <DataTable
          title="Gestión de Asistentes"
          subtitle="Listado y administración de asistentes de recepción para esta sede."
          data={asistentes}
          columns={asistenteColumns}
          isLoading={isLoading}
          searchPlaceholder="Buscar por nombre, apellido o DNI/CUIL..."
          filterKey="nombre"
          actionButton={
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsAsistenteModalOpen(true)}
            >
              <UserRoundPlus className="w-4 h-4 mr-1.5" strokeWidth={2} />
              Nuevo Asistente
            </Button>
          }
        />
      )}

      {/* Modal de Creación de Médico */}
      <CreateProfesionalModal
        isOpen={isCreateProfesionalModalOpen}
        onClose={() => setIsCreateProfesionalModalOpen(false)}
        onSubmit={async (dto) => {
          const success = await registerDoctor(dto);
          if (success) setIsCreateProfesionalModalOpen(false);
          return success;
        }}
        isSubmitting={isSubmitting}
        especialidades={especialidades}
        sedeNombre={consultorio?.nombre || user?.sedeNombre}
      />

      {/* Modal de Edición de Médico */}
      <EditProfesionalModal
        isOpen={isEditProfesionalModalOpen}
        onClose={closeEditProfesionalModal}
        profesional={editingProfesional}
        especialidades={especialidades}
        onSubmit={updateDoctor}
        isSubmitting={isSubmitting}
        sedeNombre={consultorio?.nombre || user?.sedeNombre}
      />

      {/* Modal de Creación de Asistente */}
      <CreateAsistenteModal
        isOpen={isAsistenteModalOpen}
        onClose={() => setIsAsistenteModalOpen(false)}
        onSubmit={async (dto) => {
          const success = await createAsistente(dto);
          if (success) setIsAsistenteModalOpen(false);
          return success;
        }}
        isSubmitting={isSubmitting}
        defaultConsultorioCuit={consultorioCuit}
        adminConsultorioCuil={user?.cuil}
        sedeNombre={consultorio?.nombre || user?.sedeNombre}
      />

      {/* Modal de Edición de Asistente */}
      <EditAsistenteModal
        isOpen={isEditAsistenteModalOpen}
        onClose={closeEditAsistenteModal}
        asistente={editingAsistente}
        onSubmit={updateAsistente}
        isSubmitting={isSubmitting}
        sedeNombre={consultorio?.nombre || user?.sedeNombre}
      />

      {/* Modal de Vinculación de Profesional Existente */}
      <AssignProfesionalModal
        isOpen={isProfesionalModalOpen}
        onClose={() => setIsProfesionalModalOpen(false)}
        onSubmit={async (cuil) => {
          const success = await assignProfesional(cuil);
          if (success) setIsProfesionalModalOpen(false);
          return success;
        }}
        onRegisterDoctor={async (dto) => {
          const success = await registerDoctor(dto);
          if (success) setIsProfesionalModalOpen(false);
          return success;
        }}
        isSubmitting={isSubmitting}
        availableProfesionales={allProfesionales}
        alreadyAssignedCuils={profesionales.map((p) => p.cuil)}
        especialidades={especialidades}
        sedeNombre={consultorio?.nombre || user?.sedeNombre || 'Sede Actual'}
      />
    </div>
  );
};
