import React from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../shared/components/ui/Card';
import { Calendar, PhoneCall, CheckCircle, Clock } from 'lucide-react';

export const ReceptionDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-slate-900">
          Mesa de Recepción — {user?.usuario}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Administración de agendas de profesionales, confirmación y registro de turnos presenciales o telefónicos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5" aria-hidden="true" />
            </div>
            <CardTitle>Demanda del Día</CardTitle>
            <CardDescription>Ocupación de turnos y salas de espera</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-6 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
              Selecciona una agenda o médico para ver la grilla de turnos.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
              <PhoneCall className="w-5 h-5" aria-hidden="true" />
            </div>
            <CardTitle>Turnos Externos</CardTitle>
            <CardDescription>Carga rápida por ventanilla o llamada</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Registra citas directas para pacientes que asisten presencialmente o coordinan por vía telefónica.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5" aria-hidden="true" />
            </div>
            <CardTitle>Asignación de Estudios</CardTitle>
            <CardDescription>Parametrización de coberturas y prácticas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Configura los estudios habilitados por especialista y las obras sociales aceptadas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
