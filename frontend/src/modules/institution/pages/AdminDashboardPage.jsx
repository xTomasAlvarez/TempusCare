import React from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../shared/components/ui/Card';
import { Building2, UserPlus, Shield, Activity } from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-slate-900">
          Panel de Administración — {user?.usuario}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gestión de sedes, personal operativo (asistentes), alta de profesionales y supervisión general.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-2">
              <Building2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <CardTitle>Sedes / Consultorios</CardTitle>
            <CardDescription>Infraestructura y accesibilidad</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Administra los consultorios asociados y sus niveles de accesibilidad física y arquitectónica.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
              <UserPlus className="w-5 h-5" aria-hidden="true" />
            </div>
            <CardTitle>Equipo y Profesionales</CardTitle>
            <CardDescription>Altas y asignación de personal</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Registra y vincula asistentes y médicos a cada sede física según su especialidad.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <Shield className="w-5 h-5" aria-hidden="true" />
            </div>
            <CardTitle>Catálogos & Parámetros</CardTitle>
            <CardDescription>Obras sociales, estudios y especialidades</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Rol actual: <span className="font-semibold text-slate-800">{user?.rol}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
