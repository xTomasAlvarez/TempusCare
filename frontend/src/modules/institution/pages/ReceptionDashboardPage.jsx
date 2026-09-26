import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { useReceptionDashboard } from '../hooks/useReceptionDashboard';
import { KanbanBoard } from '../components/KanbanBoard';
import { ReceptionFilters } from '../components/ReceptionFilters';
import { CreateAgendaModal } from '../components/CreateAgendaModal';
import { CreateWalkInPatientModal } from '../components/CreateWalkInPatientModal';
import { Toast } from '../../../shared/components/ui/Toast';
import { Button } from '../../../shared/components/ui/Button';
import { useConfirmDelete } from '../../../shared/hooks/useConfirmDelete';
import { AlertCircle, ShieldPlus } from 'lucide-react';

export const ReceptionDashboardPage = () => {
  const { user } = useAuth();
  const { confirmDelete } = useConfirmDelete();
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

      {/* Encabezado Principal Limpio */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-slate-900">
            Mesa de Recepción Diaria
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-sans">
            Gestión operativa de sala de espera, llamado a consultorio y administración de agendas en tiempo real.
          </p>
        </div>

        {/* Acceso Exclusivo de Asistente a Configuración de Estudios */}
        {(user?.rol === 'Asistente' || user?.rol === 'SuperAdmin') && (
          <div>
            <Link to="/institution/coberturas">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs font-semibold"
              >
                <ShieldPlus className="w-4 h-4 text-primary-600" />
                <span>Estudios y Coberturas</span>
              </Button>
            </Link>
          </div>
        )}
      </div>

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
    </div>
  );
};
