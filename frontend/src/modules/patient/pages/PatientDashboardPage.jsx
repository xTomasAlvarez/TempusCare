import React from 'react';
import { Link } from 'react-router-dom';
import { usePatientDashboard } from '../hooks/usePatientDashboard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../shared/components/ui/Card';
import { Calendar, Search, HeartPulse, ArrowRight, Clock } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';

/**
 * Dashboard Principal del Paciente.
 * Componente puramente visual que delega el estado y las llamadas de red al hook usePatientDashboard.
 */
export const PatientDashboardPage = () => {
  const { user, nextAppointment, isLoading } = usePatientDashboard();

  return (
    <div className="space-y-6">
      {/* Saludo y Acciones Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-slate-900">
            ¡Hola, {user?.usuario || 'Paciente'}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Bienvenido a tu portal de salud. Gestiona tus turnos, consultas médicas y estudios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/patient/search">
            <Button variant="primary" size="md" className="gap-2 shadow-xs">
              <Search className="w-4 h-4" aria-hidden="true" />
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
        <div className="bg-gradient-to-r from-teal-700 to-emerald-800 rounded-2xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-xs text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Próximo Turno Confirmado
              </span>
              <span className="text-xs text-teal-100">
                {nextAppointment.tipo === 3 || nextAppointment.tipo === 'Estudio' ? 'Estudio' : 'Consulta'}
              </span>
            </div>
            <h2 className="text-xl font-bold font-heading">
              Dr. {nextAppointment.profesionalNombre}
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 flex items-center gap-3 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(nextAppointment.fecha).toLocaleDateString('es-AR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
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
              className="bg-white/10 hover:bg-white text-white hover:text-teal-900 border-white/30 self-start sm:self-center gap-1.5"
            >
              <span>Ver Cita</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Tarjetas de Módulos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mis Turnos */}
        <Card className="hover:border-teal-200 transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5" aria-hidden="true" />
            </div>
            <CardTitle>Mis Turnos</CardTitle>
            <CardDescription>Citas agendadas e historial de atención</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-500">
              Visualiza tus consultas pendientes, cancela turnos con liberación inmediata o califica a tu profesional.
            </p>
            <Link to="/patient/appointments" className="inline-block w-full">
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span>Gestionar Mis Citas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Búsqueda de Profesionales */}
        <Card className="hover:border-teal-200 transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <Search className="w-5 h-5" aria-hidden="true" />
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
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Cobertura y Perfil */}
        <Card className="hover:border-teal-200 transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2">
              <HeartPulse className="w-5 h-5" aria-hidden="true" />
            </div>
            <CardTitle>Mi Cobertura</CardTitle>
            <CardDescription>Identificación y obras sociales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs text-slate-600 flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">CUIL Registrado:</span>
              <span className="font-semibold text-slate-800 font-mono">{user?.cuil || '27000000001'}</span>
            </div>
            <div className="text-xs text-slate-600 flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Correo:</span>
              <span className="font-medium text-slate-800">{user?.mail || 'paciente@tempuscare.com'}</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Las autorizaciones se validan automáticamente con cada especialista.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
