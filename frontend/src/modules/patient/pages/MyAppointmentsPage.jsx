import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyAppointments } from '../hooks/useMyAppointments';
import { AppointmentCard } from '../components/AppointmentCard';
import { RatingModal } from '../components/RatingModal';
import { Toast } from '../../../shared/components/ui/Toast';
import { Button } from '../../../shared/components/ui/Button';
import { Calendar, CheckCircle2, Search, Clock, AlertCircle, Sparkles } from 'lucide-react';

export const MyAppointmentsPage = () => {
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

  const handleCancelAppointment = async (citaId) => {
    const ok = window.confirm('¿Estás seguro de que deseas cancelar esta cita? El turno se liberará para otros pacientes.');
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
    <div className="space-y-6 max-w-4xl mx-auto">
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

        <Link to="/patient/search">
          <Button variant="primary" size="md" className="gap-2 w-full sm:w-auto shadow-xs">
            <Search className="w-4 h-4" aria-hidden="true" />
            <span>Nuevo Turno</span>
          </Button>
        </Link>
      </div>

      {/* Selector de Pestañas (Tabs) */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('future')}
          tabIndex={0}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            activeTab === 'future'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" aria-hidden="true" />
          <span>Próximas Citas</span>
          <span className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-full font-bold">
            {futureAppointments.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          tabIndex={0}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            activeTab === 'history'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" aria-hidden="true" />
          <span>Historial / Pasadas</span>
          <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
            {pastAppointments.length}
          </span>
        </button>
      </div>

      {/* Contenido de Citas */}
      <div className="space-y-4">
        {isLoading ? (
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
            <AlertCircle className="w-7 h-7 mx-auto mb-2 text-rose-500" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : currentList.length === 0 ? (
          /* Empty State */
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" aria-hidden="true" />
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
          currentList.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={handleCancelAppointment}
              onRate={(app) => setSelectedAppointmentForRating(app)}
              isCancelling={cancellingId === appointment.id}
            />
          ))
        )}
      </div>

      {/* Modal de Calificación de Atención */}
      <RatingModal
        isOpen={Boolean(selectedAppointmentForRating)}
        onClose={() => setSelectedAppointmentForRating(null)}
        appointment={selectedAppointmentForRating}
        onSurveySuccess={handleSurveySuccess}
      />
    </div>
  );
};
