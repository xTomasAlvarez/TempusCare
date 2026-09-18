import React from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../shared/components/ui/Card';
import { Calendar, Search, FileText, HeartPulse } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';

export const PatientDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-slate-900">
            ¡Hola, {user?.usuario || 'Paciente'}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Bienvenido a tu portal de salud. Gestiona tus turnos, consultas médicas y estudios.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="md" className="gap-2">
            <Search className="w-4 h-4" aria-hidden="true" />
            <span>Buscar Médico o Estudio</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:border-teal-200">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5" aria-hidden="true" />
            </div>
            <CardTitle>Mis Turnos</CardTitle>
            <CardDescription>Próximas citas médicas agendadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-6 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
              No tienes turnos próximos programados.
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-teal-200">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <FileText className="w-5 h-5" aria-hidden="true" />
            </div>
            <CardTitle>Historia Clínica</CardTitle>
            <CardDescription>Evolución y estudios realizados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              CUIL registrado: <span className="font-semibold text-slate-700">{user?.cuil || 'Sin asignar'}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-teal-200">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2">
              <HeartPulse className="w-5 h-5" aria-hidden="true" />
            </div>
            <CardTitle>Cobertura</CardTitle>
            <CardDescription>Obras sociales y prepagas activas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Consulta en tiempo real la aceptación de tu obra social por médico y estudio.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
