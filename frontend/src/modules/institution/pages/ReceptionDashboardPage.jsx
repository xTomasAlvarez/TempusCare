import React, { useState } from 'react';
import { useReceptionDashboard } from '../hooks/useReceptionDashboard';
import { KanbanBoard } from '../components/KanbanBoard';
import { ReceptionFilters } from '../components/ReceptionFilters';
import { CreateAgendaModal } from '../components/CreateAgendaModal';
import { CreateWalkInPatientModal } from '../components/CreateWalkInPatientModal';
import { Toast } from '../../../shared/components/ui/Toast';
import { AlertCircle } from 'lucide-react';

export const ReceptionDashboardPage = () => {
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
    const ok = window.confirm('¿Confirmas la cancelación de la cita? El turno se liberará automáticamente (RN-01).');
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-slate-900">
          Mesa de Recepción Diaria
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-sans">
          Gestión operativa de sala de espera, llamado a consultorio y administración de agendas en tiempo real.
        </p>
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

      {/* Error si ocurre */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
