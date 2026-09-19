import React, { useState } from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { useConsultorioAdmin } from '../hooks/useConsultorioAdmin';
import { DataTable } from '../components/DataTable';
import { CreateAsistenteModal } from '../components/CreateAsistenteModal';
import { AssignProfesionalModal } from '../components/AssignProfesionalModal';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import {
  Building2,
  Users,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Plus,
  Trash2,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

/**
 * Panel de Administración de Sede Física (Admin de Consultorio).
 * Rol intermedio: Gestiona exclusivamente los asistentes de recepción de su sede
 * y vincula a los profesionales médicos habilitados para atender en ella.
 */
export const ConsultorioAdminPage = () => {
  const { user } = useAuth();
  const consultorioCuit = user?.consultorioCuit || '3011122233401';

  const {
    consultorio,
    asistentes,
    profesionales,
    allProfesionales,
    isLoading,
    isSubmitting,
    createAsistente,
    deleteAsistente,
    assignProfesional,
    removeProfesional,
    registerDoctor,
  } = useConsultorioAdmin(consultorioCuit);

  const [activeTab, setActiveTab] = useState('asistentes'); // 'asistentes' | 'profesionales'
  const [isAsistenteModalOpen, setIsAsistenteModalOpen] = useState(false);
  const [isProfesionalModalOpen, setIsProfesionalModalOpen] = useState(false);

  // Columnas para la tabla de Asistentes
  const asistenteColumns = [
    {
      key: 'nombre',
      label: 'Personal de Recepción',
      className: 'min-w-[220px]',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 font-bold font-heading">
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
      label: 'Teléfono',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>{row.telefono || 'Sin teléfono'}</span>
        </div>
      ),
    },
    {
      key: 'sede',
      label: 'Sede Asignada',
      render: (row) => (
        <Badge variant="teal" size="sm">
          {row.consultorioNombre || consultorio?.nombre || 'Sede Actual'}
        </Badge>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => deleteAsistente(row.cuil, `${row.nombre} ${row.apellido}`)}
            aria-label={`Dar de baja al asistente ${row.nombre} ${row.apellido}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Columnas para la tabla de Profesionales Vinculados
  const profesionalColumns = [
    {
      key: 'nombre',
      label: 'Médico / Especialista',
      className: 'min-w-[220px]',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0 font-bold font-heading">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold font-heading text-slate-900 leading-snug">
              Dr./Dra. {row.nombre} {row.apellido}
            </p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              {row.matricula ? `Matrícula: ${row.matricula}` : `CUIL: ${row.cuil}`}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'especialidades',
      label: 'Especialidades',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.especialidades?.length > 0 ? (
            row.especialidades.map((esp, i) => (
              <span
                key={i}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
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
      key: 'telefono',
      label: 'Contacto',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>{row.telefono || 'Sin registrar'}</span>
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado en Sede',
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
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => removeProfesional(row.cuil, `${row.nombre} ${row.apellido}`)}
            className="text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Desvincular
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
            <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-teal-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
                  {consultorio?.nombre || user?.sedeNombre || 'Sede Física'}
                </h1>
                <Badge variant="teal" size="sm">
                  Administración de Sede
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Panel operativo local. Administra los asistentes de recepción y el cuerpo profesional de este consultorio.
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
              <span className="font-bold text-slate-800">{user?.usuario}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="border-b border-slate-200/80">
        <nav
          role="tablist"
          aria-label="Gestión de Sede"
          className="flex flex-wrap gap-2 -mb-px"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'asistentes'}
            onClick={() => setActiveTab('asistentes')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-semibold transition-all duration-200 rounded-t-xl focus:outline-none focus:ring-2 focus:ring-teal-500',
              activeTab === 'asistentes'
                ? 'border-teal-600 text-teal-700 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            )}
          >
            <Users className={cn('w-4 h-4', activeTab === 'asistentes' ? 'text-teal-600' : 'text-slate-400')} />
            <span>Asistentes de Recepción</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5',
                activeTab === 'asistentes' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200/70 text-slate-600'
              )}
            >
              {asistentes.length}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'profesionales'}
            onClick={() => setActiveTab('profesionales')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-semibold transition-all duration-200 rounded-t-xl focus:outline-none focus:ring-2 focus:ring-teal-500',
              activeTab === 'profesionales'
                ? 'border-teal-600 text-teal-700 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            )}
          >
            <Stethoscope className={cn('w-4 h-4', activeTab === 'profesionales' ? 'text-teal-600' : 'text-slate-400')} />
            <span>Profesionales Vinculados</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5',
                activeTab === 'profesionales' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200/70 text-slate-600'
              )}
            >
              {profesionales.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Contenido Pestaña 1: Asistentes de Recepción */}
      {activeTab === 'asistentes' && (
        <DataTable
          title="Asistentes de Recepción de la Sede"
          subtitle="Secretarios y personal operativo habilitados para operar la Mesa Diaria en este consultorio."
          data={asistentes}
          columns={asistenteColumns}
          isLoading={isLoading}
          searchPlaceholder="Buscar por nombre, apellido o CUIL..."
          filterKey="nombre"
          actionButton={
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsAsistenteModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Dar de alta Asistente
            </Button>
          }
        />
      )}

      {/* Contenido Pestaña 2: Profesionales Vinculados */}
      {activeTab === 'profesionales' && (
        <DataTable
          title="Médicos y Especialistas en Sede"
          subtitle="Cuerpo médico vinculado a este consultorio para la apertura de agendas y atención de pacientes."
          data={profesionales}
          columns={profesionalColumns}
          isLoading={isLoading}
          searchPlaceholder="Buscar por nombre, matrícula o especialidad..."
          filterKey="nombre"
          actionButton={
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsProfesionalModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Nuevo / Vincular Médico
            </Button>
          }
        />
      )}

      {/* Modal de Creación de Asistente (restringido a esta sede) */}
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

      {/* Modal para Vincular o Registrar Profesional */}
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
        sedeNombre={consultorio?.nombre || user?.sedeNombre || 'Sede Actual'}
      />
    </div>
  );
};
