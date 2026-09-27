import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { useReceptionDashboard } from '../hooks/useReceptionDashboard';
import { KanbanBoard } from '../components/KanbanBoard';
import { ReceptionFilters } from '../components/ReceptionFilters';
import { CreateAgendaModal } from '../components/CreateAgendaModal';
import { CreateWalkInPatientModal } from '../components/CreateWalkInPatientModal';
import { CoverageParameterizationForm } from '../components/CoverageParameterizationForm';
import { Toast } from '../../../shared/components/ui/Toast';
import { Button } from '../../../shared/components/ui/Button';
import { useConfirmDelete } from '../../../shared/hooks/useConfirmDelete';
import { AlertCircle, ShieldPlus, BriefcaseMedical } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

export const ReceptionDashboardPage = () => {
  const { user } = useAuth();
  const { confirmDelete } = useConfirmDelete();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') === 'configuracion' ? 'configuracion' : 'mesa';
  const setActiveTab = (tab) => {
    setSearchParams(tab === 'configuracion' ? { tab: 'configuracion' } : {});
  };

  const {
    doctors,
    consultorios,
    selectedDoctorCuil,
    setSelectedDoctorCuil,
    selectedDate,
    setSelectedDate,
    columnDisponibles,
    columnEspera,
    columnAtendiendose,
    columnFinalizados,
    isLoading,
    isActionLoading,
    error,
    markAsArrived,
    startAttention,
    finishAttention,
    cancelCita,
    refreshDashboard,
  } = useReceptionDashboard();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleAgendaCreated = () => {
    setToastMessage({
      type: 'success',
      title: '¡Agenda Generada con Éxito!',
      message: 'Se generaron los turnos dinámicos en el sistema.',
    });
    refreshDashboard();
  };

  const handleCancelAppointment = async (citaId) => {
    const ok = await confirmDelete({
      title: '¿Confirmar cancelación de cita médica?',
      message: '¿Estás seguro de que deseas cancelar la cita del paciente? El turno será liberado automáticamente en la agenda médica (RN-01).',
      confirmText: 'Sí, eliminar definitivamente',
      cancelText: 'Cancelar',
    });
    if (!ok) return;

    const success = await cancelCita(citaId);
    if (success) {
      setToastMessage({
        type: 'info',
        title: 'Cita Cancelada',
        message: 'La cita fue cancelada y el turno volvió a estar Disponible.',
      });
    }
  };

  const handleFinishAttention = async (citaId) => {
    const success = await finishAttention(citaId);
    if (success) {
      setToastMessage({
        type: 'success',
        title: 'Atención Finalizada',
        message: 'La consulta médica fue registrada como Atendida en el sistema.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notificación Accesible */}
      {toastMessage && (
        <Toast
          type={toastMessage.type}
          title={toastMessage.title}
          message={toastMessage.message}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-slate-900">
            {activeTab === 'configuracion' ? 'Configuración Médica y Coberturas' : 'Mesa de Recepción Diaria'}
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-sans">
            {activeTab === 'configuracion'
              ? 'Parametrización de estudios médicos y obras sociales aceptadas por los profesionales de la sede (RN-02).'
              : 'Gestión operativa de sala de espera, llamado a consultorio y administración de agendas en tiempo real.'}
          </p>
        </div>

        {/* Acceso Rápido / Toggle de Sección de Asistente */}
        {(user?.rol === 'Asistente' || user?.rol === 'SuperAdmin') && (
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'configuracion' ? 'outline' : 'primary'}
              size="sm"
              onClick={() => setActiveTab(activeTab === 'configuracion' ? 'mesa' : 'configuracion')}
              className="gap-2 text-xs sm:text-sm font-semibold shadow-xs"
            >
              {activeTab === 'configuracion' ? (
                <>
                  <BriefcaseMedical className="w-4 h-4" />
                  <span>Volver a Mesa Diaria</span>
                </>
              ) : (
                <>
                  <ShieldPlus className="w-4 h-4" />
                  <span>Configuración Médica</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Selector de Pestañas del Panel de Asistente */}
      <div className="border-b border-slate-200/80">
        <nav
          role="tablist"
          aria-label="Secciones del Asistente"
          className="flex flex-wrap gap-2 -mb-px"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'mesa'}
            onClick={() => setActiveTab('mesa')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-semibold transition-all duration-200 rounded-t-xl focus:outline-none focus:ring-2 focus:ring-primary-500',
              activeTab === 'mesa'
                ? 'border-primary-600 text-primary-700 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            )}
          >
            <BriefcaseMedical className={cn('w-4 h-4', activeTab === 'mesa' ? 'text-primary-600' : 'text-slate-400')} strokeWidth={2} />
            <span>Mesa de Recepción Diaria</span>
          </button>

          {(user?.rol === 'Asistente' || user?.rol === 'SuperAdmin') && (
            <button
              role="tab"
              aria-selected={activeTab === 'configuracion'}
              onClick={() => setActiveTab('configuracion')}
              className={cn(
                'flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-semibold transition-all duration-200 rounded-t-xl focus:outline-none focus:ring-2 focus:ring-primary-500',
                activeTab === 'configuracion'
                  ? 'border-primary-600 text-primary-700 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              )}
            >
              <ShieldPlus className={cn('w-4 h-4', activeTab === 'configuracion' ? 'text-primary-600' : 'text-slate-400')} strokeWidth={2} />
              <span>Configuración Médica</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5 bg-primary-100 text-primary-800">
                RN-02
              </span>
            </button>
          )}
        </nav>
      </div>

      {activeTab === 'configuracion' ? (
        /* Sección Exclusiva de Parametrización Médica */
        <section aria-label="Parametrización médica de estudios y coberturas" className="pt-2 animate-in fade-in-0 duration-200">
          <CoverageParameterizationForm />
        </section>
      ) : (
        /* Sección de Mesa Diaria */
        <>
          {/* Toolbar Unificado de Controles */}
          <ReceptionFilters
            doctors={doctors}
            selectedDoctorCuil={selectedDoctorCuil}
            onDoctorChange={setSelectedDoctorCuil}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onOpenCreateAgenda={() => setIsCreateModalOpen(true)}
            onOpenCreateWalkInPatient={() => setIsWalkInModalOpen(true)}
            onRefresh={refreshDashboard}
            isLoading={isLoading}
          />

          {/* Error si ocurre con espacio fijo reservado */}
          <div className="min-h-[20px] flex items-center">
            {error && (
              <div className="text-xs text-rose-600 flex items-center gap-1.5 font-medium animate-in fade-in-0">
                <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Tablero Kanban con Espacio Vertical Ampliado */}
          <section aria-label="Tablero Kanban de turnos diarios" className="pt-2">
            <KanbanBoard
              columnDisponibles={columnDisponibles}
              columnEspera={columnEspera}
              columnAtendiendose={columnAtendiendose}
              columnFinalizados={columnFinalizados}
              isLoading={isLoading}
              isActionLoading={isActionLoading}
              onMarkArrived={markAsArrived}
              onStartAttention={startAttention}
              onFinishAttention={handleFinishAttention}
              onCancel={handleCancelAppointment}
            />
          </section>

          {/* Modal de Creación de Agenda */}
          <CreateAgendaModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            doctors={doctors}
            consultorios={consultorios}
            onAgendaCreated={handleAgendaCreated}
          />

          {/* Modal de Registro de Paciente Presencial (Walk-in) */}
          <CreateWalkInPatientModal
            isOpen={isWalkInModalOpen}
            onClose={() => setIsWalkInModalOpen(false)}
            onPatientCreated={(patient) => {
              setToastMessage({
                type: 'success',
                title: 'Paciente Presencial Registrado',
                message: `El paciente ${patient.nombre} ${patient.apellido} (DNI ${patient.dni}) fue registrado y está listo para recibir turnos.`,
              });
            }}
          />
        </>
      )}
    </div>
  );
};
