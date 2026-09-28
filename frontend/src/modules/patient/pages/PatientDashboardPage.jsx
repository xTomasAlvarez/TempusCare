import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePatientDashboard } from '../hooks/usePatientDashboard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../shared/components/ui/Card';
import { CalendarHeart, Stethoscope, HeartPulse, ArrowRight, Clock, ShieldPlus, CalendarDays, UserCog } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { EditPatientProfileModal } from '../components/EditPatientProfileModal';

/**
 * Dashboard Principal del Paciente.
 * Componente puramente visual que delega el estado y las llamadas de red al hook usePatientDashboard.
 */
export const PatientDashboardPage = () => {
  const { user, paciente, nextAppointment, isLoading, refreshDashboard } = usePatientDashboard();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const patientName = paciente?.nombre || user?.nombre || (user?.nombreCompleto ? user.nombreCompleto.split(' ')[0] : null) || 'Paciente';

  return (
    <div className="space-y-6">
      {/* Saludo y Acciones Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-slate-900">
            ¡Hola, {patientName}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Bienvenido a tu portal de salud. Gestiona tus turnos, consultas médicas y estudios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsEditProfileOpen(true)}
            className="gap-2 shadow-2xs border-slate-200 hover:border-primary-300 hover:bg-primary-50/50"
          >
            <UserCog className="w-4 h-4 text-primary-600" strokeWidth={2} aria-hidden="true" />
            <span>Editar Perfil</span>
          </Button>

          <Link to="/patient/search">
            <Button variant="primary" size="md" className="gap-2 shadow-xs">
              <Stethoscope className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              <span>Buscar Médico o Estudio</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Skeleton Loader mientras se consulta la próxima cita */}
      {isLoading && (
        <div className="bg-slate-100/80 rounded-2xl p-5 sm:p-6 border border-slate-200/80 animate-pulse flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2.5">
            <div className="h-4 w-32 bg-slate-200 rounded-full" />
            <div className="h-6 w-56 bg-slate-300 rounded-lg" />
            <div className="h-4 w-40 bg-slate-200 rounded-md" />
          </div>
          <div className="h-9 w-28 bg-slate-200 rounded-xl" />
        </div>
      )}

      {/* Banner de Próxima Cita Si Existe */}
      {!isLoading && nextAppointment && (
        <div className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-xs text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Próximo Turno Confirmado
              </span>
              <span className="text-xs text-primary-100">
                {nextAppointment.tipo === 3 || nextAppointment.tipo === 'Estudio' ? 'Estudio' : 'Consulta'}
              </span>
            </div>
            <h2 className="text-xl font-bold font-heading">
              Dr. {nextAppointment.profesionalNombre}
            </h2>
            <p className="text-xs sm:text-sm text-primary-100 flex items-center gap-3 pt-1">
              <span className="flex items-center gap-1">
                <CalendarHeart className="w-3.5 h-3.5" strokeWidth={2} />
                {new Date(nextAppointment.fecha).toLocaleDateString('es-AR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                {typeof nextAppointment.horaInicio === 'string'
                  ? nextAppointment.horaInicio.substring(0, 5)
                  : nextAppointment.horaInicio}{' '}
                hs
              </span>
            </p>
          </div>

          <Link to="/patient/appointments">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white text-white hover:text-primary-900 border-white/30 self-start sm:self-center gap-1.5"
            >
              <span>Ver Cita</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Button>
          </Link>
        </div>
      )}

      {/* Tarjetas de Módulos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mis Turnos */}
        <Card className="hover:border-primary-200 transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-2">
              <CalendarHeart className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
            </div>
            <CardTitle>Mis Turnos</CardTitle>
            <CardDescription>Citas agendadas e historial de atención</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-500">
              Visualiza tus consultas pendientes, cancela turnos con liberación inmediata o califica a tu profesional.
            </p>
            <div className="space-y-2">
              <Link to="/patient/appointments" className="inline-block w-full">
                <Button variant="outline" size="sm" className="w-full justify-between">
                  <span>Gestionar Mis Citas</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                </Button>
              </Link>
              <Link to="/patient/calendar" className="inline-block w-full">
                <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-primary-700 bg-primary-50/50 hover:bg-primary-50 border border-primary-200/50">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-primary-600" />
                    <span>Ver en Calendario</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Búsqueda de Profesionales */}
        <Card className="hover:border-primary-200 transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-2">
              <Stethoscope className="w-5 h-5 text-primary-600" strokeWidth={2} aria-hidden="true" />
            </div>
            <CardTitle>Búsqueda y Mapa</CardTitle>
            <CardDescription>Especialistas médicos en consultorios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-500">
              Filtra por especialidad, obra social o ubicación en mapa interactivo y reserva en tiempo real.
            </p>
            <Link to="/patient/search" className="inline-block w-full">
              <Button variant="primary" size="sm" className="w-full justify-between">
                <span>Buscar Médicos</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Cobertura y Perfil */}
        <Card className="hover:border-primary-200 transition-all duration-300 hover:shadow-md">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-2">
                <ShieldPlus className="w-5 h-5 text-primary-600" strokeWidth={2} aria-hidden="true" />
              </div>
              <CardTitle>Mi Cobertura</CardTitle>
              <CardDescription>Identificación y obras sociales</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditProfileOpen(true)}
              className="text-xs text-primary-700 hover:bg-primary-50 border-primary-200 gap-1.5 shrink-0"
            >
              <UserCog className="w-3.5 h-3.5 text-primary-600" />
              <span>Editar</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Obras Sociales Asociadas */}
            <div className="py-1 border-b border-slate-100">
              <span className="text-xs text-slate-500 block mb-1.5 font-medium">Obra Social / Prepaga:</span>
              {(paciente?.obrasSociales?.length > 0 || user?.obrasSociales?.length > 0) ? (
                <div className="flex flex-wrap gap-1.5">
                  {(paciente?.obrasSociales || user?.obrasSociales || []).map((os, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200/80 text-xs font-semibold shadow-xs"
                    >
                      <ShieldPlus className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                      <span>{os}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                  Atención Particular (Sin Obra Social)
                </span>
              )}
            </div>

            <div className="text-xs text-slate-600 flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Titular:</span>
              <span className="font-semibold text-slate-800">
                {paciente?.nombre && paciente?.apellido
                  ? `${paciente.nombre} ${paciente.apellido}`
                  : user?.nombreCompleto || user?.nombre || 'Paciente Registrado'}
              </span>
            </div>

            <div className="text-xs text-slate-600 flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">CUIL / DNI:</span>
              <span className="font-semibold text-slate-800 font-mono">
                {paciente?.cuil || user?.cuil || 'Sin registrar'}
              </span>
            </div>

            <div className="text-xs text-slate-600 flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Correo:</span>
              <span className="font-medium text-slate-800">{user?.mail || 'paciente@tempuscare.com'}</span>
            </div>

            <p className="text-[11px] text-slate-400 pt-1">
              Las autorizaciones se validan automáticamente con cada especialista según las reglas de cobertura (RN-02).
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edición de Perfil de Paciente */}
      <EditPatientProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        paciente={paciente}
        onSuccess={() => {
          refreshDashboard();
        }}
      />
    </div>
  );
};
