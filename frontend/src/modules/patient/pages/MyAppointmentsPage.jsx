import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMyAppointments } from '../hooks/useMyAppointments';
import { AppointmentCard } from '../components/AppointmentCard';
import { RatingModal } from '../components/RatingModal';
import { Toast } from '../../../shared/components/ui/Toast';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { useAuth } from '../../../core/context/AuthContext';
import { patientService } from '../services/patientService';
import { useConfirmDelete } from '../../../shared/hooks/useConfirmDelete';
import {
  snappySpring,
  staggerContainerVariants,
  staggerItemVariants,
  tabContentVariants,
  pageTransitionVariants,
} from '../../../shared/motion';
import {
  CalendarHeart,
  CheckCircle2,
  Stethoscope,
  Clock,
  AlertCircle,
  Sparkles,
  CalendarDays,
  FileHeart,
  Heart,
  Pill,
  ShieldAlert,
  Phone,
  Activity,
} from 'lucide-react';

export const MyAppointmentsPage = () => {
  const { user } = useAuth();
  const { confirmDelete } = useConfirmDelete();
  const {
    appointments,
    futureAppointments,
    pastAppointments,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    cancellingId,
    cancelAppointment,
    selectedAppointmentForRating,
    setSelectedAppointmentForRating,
    refreshAppointments,
  } = useMyAppointments();

  const [toastMessage, setToastMessage] = useState(null);
  const [clinicalHistory, setClinicalHistory] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    if (activeTab === 'timeline' && user?.cuil && !clinicalHistory) {
      setIsLoadingHistory(true);
      setHistoryError(null);
      patientService
        .getPatientClinicalHistory(user.cuil)
        .then((data) => setClinicalHistory(data))
        .catch((err) => {
          setHistoryError(err.message || 'No se pudo cargar la historia clínica.');
        })
        .finally(() => setIsLoadingHistory(false));
    }
  }, [activeTab, user?.cuil, clinicalHistory]);

  const handleCancelAppointment = async (citaId) => {
    const cita = appointments.find((a) => a.id === citaId);
    const doctorName = cita?.profesionalNombre || 'su médico';
    const ok = await confirmDelete({
      title: '¿Cancelar turno definitivamente?',
      message: '¿Estás seguro de que deseas cancelar esta cita? El turno se liberará automáticamente en el sistema para otros pacientes (RN-01).',
      itemName: `Cita con ${doctorName}`,
      confirmText: 'Sí, eliminar definitivamente',
      cancelText: 'Cancelar',
    });
    if (!ok) return;

    const success = await cancelAppointment(citaId);
    if (success) {
      setToastMessage({
        type: 'info',
        title: 'Cita Cancelada',
        message: 'Tu cita fue cancelada exitosamente y el horario quedó disponible nuevamente.',
      });
    } else {
      setToastMessage({
        type: 'error',
        title: 'Error al cancelar',
        message: 'No se pudo cancelar la cita. Inténtalo nuevamente.',
      });
    }
  };

  const handleSurveySuccess = () => {
    setToastMessage({
      type: 'success',
      title: '¡Gracias por tu opinión!',
      message: 'Tu calificación sobre la atención médica fue registrada con éxito.',
    });
    refreshAppointments();
  };

  const currentList = activeTab === 'future' ? futureAppointments : pastAppointments;

  return (
    <motion.div variants={pageTransitionVariants} initial="hidden" animate="visible" className="space-y-6 w-full">
      {/* Toast Notificación */}
      {toastMessage && (
        <Toast
          type={toastMessage.type}
          title={toastMessage.title}
          message={toastMessage.message}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-slate-900">
            Mis Citas y Turnos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Administra tus consultas agendadas, cancela si es necesario o califica la atención recibida.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/patient/calendar">
            <Button variant="outline" size="md" className="gap-2 w-full sm:w-auto shadow-2xs text-xs font-semibold">
              <CalendarDays className="w-4 h-4 text-primary-600" strokeWidth={2} aria-hidden="true" />
              <span>Ver Calendario</span>
            </Button>
          </Link>

          <Link to="/patient/search">
            <Button variant="primary" size="md" className="gap-2 w-full sm:w-auto shadow-xs text-xs font-semibold">
              <Stethoscope className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              <span>Nuevo Turno</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Selector de Pestañas (Tabs) con Indicador Deslizante de Alto Rendimiento */}
      <div className="flex border-b border-slate-200 relative">
        <button
          type="button"
          onClick={() => setActiveTab('future')}
          tabIndex={0}
          className={`relative pb-3 px-4 text-sm font-semibold transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 active:scale-[0.98] duration-75 cursor-pointer ${
            activeTab === 'future'
              ? 'text-primary-700'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          <span>Próximas Citas</span>
          <span className="bg-primary-50 text-primary-700 text-xs px-2 py-0.5 rounded-full font-bold">
            {futureAppointments.length}
          </span>
          {activeTab === 'future' && (
            <motion.div
              layoutId="appointments-tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
              transition={snappySpring}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          tabIndex={0}
          className={`relative pb-3 px-4 text-sm font-semibold transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 active:scale-[0.98] duration-75 cursor-pointer ${
            activeTab === 'history'
              ? 'text-primary-700'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <CalendarHeart className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          <span>Historial / Pasadas</span>
          <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
            {pastAppointments.length}
          </span>
          {activeTab === 'history' && (
            <motion.div
              layoutId="appointments-tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
              transition={snappySpring}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          tabIndex={0}
          className={`relative pb-3 px-4 text-sm font-semibold transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 active:scale-[0.98] duration-75 cursor-pointer ${
            activeTab === 'timeline'
              ? 'text-primary-700'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileHeart className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          <span>Línea de Tiempo Médica</span>
          {clinicalHistory?.observaciones?.length > 0 && (
            <span className="bg-primary-50 text-primary-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {clinicalHistory.observaciones.length}
            </span>
          )}
          {activeTab === 'timeline' && (
            <motion.div
              layoutId="appointments-tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
              transition={snappySpring}
            />
          )}
        </button>
      </div>

      {/* Contenido de Citas o Línea de Tiempo con Transición Snappy */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={activeTab}
          variants={tabContentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-4"
        >
        {activeTab === 'timeline' ? (
          isLoadingHistory ? (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 animate-pulse shadow-xs">
                <div className="h-5 bg-slate-200 rounded-md w-1/3" />
                <div className="h-4 bg-slate-100 rounded-md w-1/2" />
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse shadow-xs">
                <div className="h-20 bg-slate-100 rounded-xl" />
                <div className="h-20 bg-slate-100 rounded-xl" />
              </div>
            </div>
          ) : historyError ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700">
              <AlertCircle className="w-7 h-7 mx-auto mb-2 text-rose-500" strokeWidth={2} />
              <p className="text-sm font-medium">{historyError}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tarjeta de Antecedentes Clínicos del Paciente */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center">
                      <FileHeart className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-heading text-slate-900 leading-snug">
                        Mi Historia Clínica Unificada
                      </h3>
                      <p className="text-xs text-slate-400">
                        {clinicalHistory?.id ? `Ficha Médica N° ${clinicalHistory.id}` : 'Registro médico centralizado (RN-04)'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    <Badge variant="success" size="sm" className="font-semibold" title="Datos clínicos cifrados en reposo mediante AES-256 conforme a la Ley Nacional 25.326">
                      Cifrado AES-256 • Ley 25.326
                    </Badge>
                    {clinicalHistory?.grupSang && (
                      <Badge variant="primary" size="md" className="font-bold">
                        Grupo {clinicalHistory.grupSang}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Grilla de Alertas y Antecedentes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clinicalHistory?.alergias ? (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                      <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <div>
                        <span className="font-bold">Alergias:</span> {clinicalHistory.alergias}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
                      <ShieldAlert className="w-4 h-4 text-slate-400" />
                      <span>Sin alergias registradas</span>
                    </div>
                  )}

                  {clinicalHistory?.enfermedadesCronicas ? (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                      <Heart className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Enfermedades Crónicas:</span> {clinicalHistory.enfermedadesCronicas}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
                      <Heart className="w-4 h-4 text-slate-400" />
                      <span>Sin patologías crónicas</span>
                    </div>
                  )}

                  {clinicalHistory?.medicamentos ? (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary-50 border border-primary-200 text-primary-900 text-xs">
                      <Pill className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <div>
                        <span className="font-bold">Medicación Habitual:</span> {clinicalHistory.medicamentos}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
                      <Pill className="w-4 h-4 text-slate-400" />
                      <span>Sin medicación habitual</span>
                    </div>
                  )}

                  {clinicalHistory?.nombreContacto && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">
                        Emergencia: <strong>{clinicalHistory.nombreContacto} {clinicalHistory.apellidoContacto}</strong> ({clinicalHistory.telefonoContacto})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Línea de Tiempo Médica */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-heading">
                      Mi Línea de Tiempo Médica
                    </h4>
                    <p className="text-xs text-slate-400">
                      Consultas, diagnósticos y pautas indicadas por los profesionales que te atendieron
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full">
                    {clinicalHistory?.observaciones?.length || 0} Evoluciones
                  </span>
                </div>

                {(!clinicalHistory?.observaciones || clinicalHistory.observaciones.length === 0) ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    <FileHeart className="w-10 h-10 text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
                    <p className="font-semibold text-slate-700 text-sm">Aún no tienes evoluciones médicas registradas</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      A medida que asistas a tus consultas médicas y los profesionales completen tu atención, podrás consultar aquí tus diagnósticos y pautas de tratamiento.
                    </p>
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {clinicalHistory.observaciones.map((obs, idx) => (
                      <div key={obs.id || idx} className="relative group">
                        <div className="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-primary-600 shadow-xs" />
                        <div className="bg-slate-50 group-hover:bg-primary-50/20 p-4 rounded-xl border border-slate-200/80 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                            <span className="text-sm font-bold text-slate-900 font-heading">
                              {obs.motivo || 'Evolución Médica'}
                            </span>
                            <Badge variant="primary" size="sm" className="self-start sm:self-auto">
                              Consulta N° {obs.citaId || obs.id}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {obs.detalle}
                          </p>
                          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-200/60 text-xs text-slate-500">
                            <Stethoscope className="w-3.5 h-3.5 text-primary-600" />
                            <span>Profesional Tratante: <strong>{obs.profesionalNombre || 'Médico de la Red'}</strong></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        ) : isLoading ? (
          /* Skeletons */
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 animate-pulse shadow-xs"
              >
                <div className="h-5 bg-slate-200 rounded-md w-1/4" />
                <div className="h-6 bg-slate-200 rounded-md w-1/2" />
                <div className="h-4 bg-slate-100 rounded-md w-1/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700">
            <AlertCircle className="w-7 h-7 mx-auto mb-2 text-rose-500" strokeWidth={2} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : currentList.length === 0 ? (
          /* Empty State */
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto">
              <CalendarHeart className="w-7 h-7" strokeWidth={2} aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold font-heading text-slate-800">
              {activeTab === 'future'
                ? 'No tienes citas próximas programadas'
                : 'No tienes citas pasadas en el historial'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === 'future'
                ? 'Explora nuestros médicos especialistas y agenda una consulta médica o estudio en minutos.'
                : 'Las citas que completes o canceles se mostrarán aquí para tu registro clínico.'}
            </p>
            {activeTab === 'future' && (
              <div className="pt-2">
                <Link to="/patient/search">
                  <Button variant="primary" size="sm">
                    Buscar Médico Ahora
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {currentList.map((appointment) => (
              <motion.div key={appointment.id} variants={staggerItemVariants}>
                <AppointmentCard
                  appointment={appointment}
                  onCancel={handleCancelAppointment}
                  onRate={(app) => setSelectedAppointmentForRating(app)}
                  isCancelling={cancellingId === appointment.id}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
        </motion.div>
      </AnimatePresence>

      {/* Modal de Calificación de Atención */}
      <RatingModal
        isOpen={Boolean(selectedAppointmentForRating)}
        onClose={() => setSelectedAppointmentForRating(null)}
        appointment={selectedAppointmentForRating}
        onSurveySuccess={handleSurveySuccess}
      />
    </motion.div>
  );
};
