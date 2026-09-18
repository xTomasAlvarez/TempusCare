import React from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../shared/components/ui/Card';
import { Stethoscope, Users, CalendarCheck, Clock } from 'lucide-react';

export const ProfessionalDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-slate-900">
          Portal Médico — Dr./Dra. {user?.usuario}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gestión de agenda, turnos del día y ficha clínica de pacientes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
              <CalendarCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <CardTitle>Agenda Activa</CardTitle>
            <CardDescription>Turnos programados para hoy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-6 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
              No hay turnos pendientes para la jornada actual.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <Users className="w-5 h-5" aria-hidden="true" />
            </div>
            <CardTitle>Pacientes Atendidos</CardTitle>
            <CardDescription>Evolución clínica y diagnósticos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Registra observaciones, tratamientos e indicaciones vinculadas a la historia clínica unificada.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
              <Clock className="w-5 h-5" aria-hidden="true" />
            </div>
            <CardTitle>Disponibilidad</CardTitle>
            <CardDescription>Horarios y sedes asignadas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              CUIL profesional: <span className="font-semibold text-slate-700">{user?.cuil || 'Sin asignar'}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
