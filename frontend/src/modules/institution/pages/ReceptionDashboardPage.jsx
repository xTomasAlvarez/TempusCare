import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../core/context/AuthContext';
import { useReceptionDashboard } from '../hooks/useReceptionDashboard';
import { KanbanBoard } from '../components/KanbanBoard';
import { ReceptionFilters } from '../components/ReceptionFilters';
import { CreateAgendaModal } from '../components/CreateAgendaModal';
import { CreateWalkInPatientModal } from '../components/CreateWalkInPatientModal';
import { BookingModal } from '../../patient/components/BookingModal';
import { CoverageParameterizationForm } from '../components/CoverageParameterizationForm';
import { Toast } from '../../../shared/components/ui/Toast';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { useConfirmDelete } from '../../../shared/hooks/useConfirmDelete';
import { AlertCircle, ShieldPlus, BriefcaseMedical } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { snappySpring, tabContentVariants, pageTransitionVariants } from '../../../shared/motion';

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
  const [isSecretaryBookingModalOpen, setIsSecretaryBookingModalOpen] = useState(false);
  const [selectedPatientForBooking, setSelectedPatientForBooking] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const handleOpenAssignAppointment = (patient = null) => {
    setSelectedPatientForBooking(patient);
    setIsSecretaryBookingModalOpen(true);
  };

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
      message: '¿Estás seguro de que deseas cancelar la cita del paciente? El turno será liberado automáticamente en la agenda médica.',
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

  const [scheduleWarningModal, setScheduleWarningModal] = useState(null);
  const [cachedScheduleWarning, setCachedScheduleWarning] = useState(null);
  useEffect(() => {
    if (scheduleWarningModal) setCachedScheduleWarning(scheduleWarningModal);
  }, [scheduleWarningModal]);
  const activeWarning = scheduleWarningModal || cachedScheduleWarning;

  const handleStartAttention = async (citaId, item = null) => {
    const appointment = item || columnEspera.find((c) => c.id === citaId);

    // Validación de horario: tolerancia razonable de ±45 min respecto a horaInicio / horaFin
    if (appointment && appointment.horaInicio) {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const itemDateStr = (appointment.fecha || '').split('T')[0];
      const isToday = itemDateStr === todayStr || !appointment.fecha;

      const [hIni, mIni] = String(appointment.horaInicio).split(':').map(Number);
      const [hFin, mFin] = String(appointment.horaFin || appointment.horaInicio).split(':').map(Number);
      const nowMins = now.getHours() * 60 + now.getMinutes();
      const startMins = hIni * 60 + mIni;
      const endMins = hFin * 60 + mFin;

      const outOfWindow = !isToday || nowMins < startMins - 45 || nowMins > endMins + 45;
      if (outOfWindow) {
        setScheduleWarningModal({
          citaId,
          pacienteNombre: appointment.pacienteNombre || 'el paciente',
          horaProgramada: String(appointment.horaInicio).substring(0, 5),
          horaActual: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        });
        return;
      }
    }

    try {
      await startAttention(citaId, false);
    } catch (err) {
      if (err.message && err.message.includes('Aviso de Horario')) {
        const now = new Date();
        setScheduleWarningModal({
          citaId,
          pacienteNombre: appointment?.pacienteNombre || 'el paciente',
          horaProgramada: appointment?.horaInicio ? String(appointment.horaInicio).substring(0, 5) : '--:--',
          horaActual: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        });
      }
    }
  };

  const handleConfirmOutOfScheduleAttention = async () => {
    if (!scheduleWarningModal) return;
    const { citaId } = scheduleWarningModal;
    setScheduleWarningModal(null);
    try {
      await startAttention(citaId, true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div variants={pageTransitionVariants} initial="hidden" animate="visible" className="space-y-6 w-full">
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
              ? 'Configuración de estudios médicos y obras sociales aceptadas por los profesionales de la sede.'
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

      {/* Selector de Pestañas del Panel de Asistente con Indicador Deslizante */}
      <div className="border-b border-slate-200/80">
        <nav
          role="tablist"
          aria-label="Secciones del Asistente"
          className="flex flex-wrap gap-2 -mb-px relative"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'mesa'}
            onClick={() => setActiveTab('mesa')}
            className={cn(
              'relative flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-transform duration-75 active:scale-[0.98] cursor-pointer rounded-t-xl focus:outline-none focus:ring-2 focus:ring-primary-500',
              activeTab === 'mesa'
                ? 'text-primary-700 bg-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            )}
          >
            <BriefcaseMedical className={cn('w-4 h-4', activeTab === 'mesa' ? 'text-primary-600' : 'text-slate-400')} strokeWidth={2} />
            <span>Mesa de Recepción Diaria</span>
            {activeTab === 'mesa' && (
              <motion.div
                layoutId="reception-active-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                transition={snappySpring}
              />
            )}
          </button>

          {(user?.rol === 'Asistente' || user?.rol === 'SuperAdmin') && (
            <button
              role="tab"
              aria-selected={activeTab === 'configuracion'}
              onClick={() => setActiveTab('configuracion')}
              className={cn(
                'relative flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-transform duration-75 active:scale-[0.98] cursor-pointer rounded-t-xl focus:outline-none focus:ring-2 focus:ring-primary-500',
                activeTab === 'configuracion'
                  ? 'text-primary-700 bg-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              )}
            >
              <ShieldPlus className={cn('w-4 h-4', activeTab === 'configuracion' ? 'text-primary-600' : 'text-slate-400')} strokeWidth={2} />
              <span>Configuración Médica</span>
              {activeTab === 'configuracion' && (
                <motion.div
                  layoutId="reception-active-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                  transition={snappySpring}
                />
              )}
            </button>
          )}
        </nav>
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={activeTab}
          variants={tabContentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {activeTab === 'configuracion' ? (
            /* Sección Exclusiva de Parametrización Médica */
            <section aria-label="Parametrización médica de estudios y coberturas" className="pt-2">
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
            onOpenAssignAppointment={() => handleOpenAssignAppointment(null)}
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
              onStartAttention={handleStartAttention}
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
            onAssignAppointment={(patient) => {
              handleOpenAssignAppointment(patient);
            }}
          />

          {/* Modal Accesible de Reserva para Secretaría (RF-ASI-06) */}
          <BookingModal
            isOpen={isSecretaryBookingModalOpen}
            onClose={() => {
              setIsSecretaryBookingModalOpen(false);
              setSelectedPatientForBooking(null);
            }}
            doctor={doctors.find((d) => d.cuil === selectedDoctorCuil) || doctors[0]}
            patientCuil={selectedPatientForBooking?.cuil || selectedPatientForBooking?.dni}
            patientName={selectedPatientForBooking ? `${selectedPatientForBooking.nombre} ${selectedPatientForBooking.apellido}` : null}
            onBookingSuccess={(res) => {
              setToastMessage({
                type: 'success',
                title: '¡Turno Asignado con Éxito!',
                message: `Se ha reservado el turno médico para el paciente en la agenda de ${res.profesionalNombre || 'recepción'}.`,
              });
              refreshDashboard();
            }}
          />

          {/* Modal de Advertencia y Confirmación por Horario */}
          <Modal
            isOpen={Boolean(scheduleWarningModal)}
            onClose={() => setScheduleWarningModal(null)}
            title="Aviso de Horario de Atención"
            description="Verificación de horario programado de la cita médica"
            maxWidth="max-w-md"
          >
            {activeWarning && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed space-y-1.5">
                    <p className="text-sm">
                      Aviso de Horario: Este turno de <strong>{activeWarning.pacienteNombre}</strong> está programado para las{' '}
                      <strong>{activeWarning.horaProgramada} hs</strong> y actualmente son las{' '}
                      <strong>{activeWarning.horaActual} hs</strong>.
                    </p>
                    <p className="font-semibold text-slate-900 pt-1">
                      ¿Desea iniciar la atención fuera del horario estipulado?
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScheduleWarningModal(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={handleConfirmOutOfScheduleAttention}
                  >
                    Iniciar Atención
                  </Button>
                </div>
              </div>
            )}
          </Modal>
        </>
      )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
