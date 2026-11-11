import React from 'react';
import { createBrowserRouter, Navigate, useRouteError, Link } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../../modules/public/pages/HomePage';
import { LoginPage } from '../../modules/auth/pages/LoginPage';
import { RegisterPage } from '../../modules/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '../../modules/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../../modules/auth/pages/ResetPasswordPage';
import { PatientDashboardPage } from '../../modules/patient/pages/PatientDashboardPage';
import { SearchProfessionalsPage } from '../../modules/patient/pages/SearchProfessionalsPage';
import { MyAppointmentsPage } from '../../modules/patient/pages/MyAppointmentsPage';
import { MisTurnosCalendario } from '../../modules/patient/pages/MisTurnosCalendario';
import { ProfessionalDashboardPage } from '../../modules/professional/pages/ProfessionalDashboardPage';
import { ReceptionDashboardPage } from '../../modules/institution/pages/ReceptionDashboardPage';
import { AdminDashboardPage } from '../../modules/institution/pages/AdminDashboardPage';
import { ConsultorioAdminPage } from '../../modules/institution/pages/ConsultorioAdminPage';
import { CoverageParameterizationPage } from '../../modules/institution/pages/CoverageParameterizationPage';
import { VitalityLayout } from '../../modules/vitality/layouts/VitalityLayout';
import { VitalityClientsPage } from '../../modules/vitality/pages/VitalityClientsPage';
import { VitalitySpecialtiesPage } from '../../modules/vitality/pages/VitalitySpecialtiesPage';
import { VitalityInsurancePage } from '../../modules/vitality/pages/VitalityInsurancePage';
import { VitalityMetricsPage } from '../../modules/vitality/pages/VitalityMetricsPage';
import { VitalitySystemPage } from '../../modules/vitality/pages/VitalitySystemPage';
import { VitalityAdminsPage } from '../../modules/vitality/pages/VitalityAdminsPage';
import { useAuth } from '../context/AuthContext';

const RouteErrorFallback = () => {
  const error = useRouteError();
  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg p-6 text-center space-y-4">
        <h1 className="text-xl font-bold font-heading text-slate-900" title="Aviso del sistema">
          Se produjo un inconveniente al cargar la vista
        </h1>
        <p className="text-xs text-slate-600">
          {error?.message || 'Por favor, recarga la página o regresa al inicio.'}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            title="Recargar la vista actual"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold cursor-pointer"
          >
            Recargar página
          </button>
          <Link
            to="/"
            title="Volver a la página principal"
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente Guard para rutas protegidas en memoria con aislamiento estricto de roles
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, getDashboardRoute } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    // Si el rol no tiene permiso para esta ruta, redirige estrictamente al panel de su rol
    const targetRoute = getDashboardRoute ? getDashboardRoute(user?.rol) : '/';
    return <Navigate to={targetRoute} replace />;
  }

  return children;
};

/**
 * Enrutamiento estático instanciado a nivel de módulo (Cumplimiento estricto de Design.md)
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <RouteErrorFallback />,
  },
  {
    element: <AuthLayout />,
    errorElement: <RouteErrorFallback />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: '/reset-password',
        element: <ResetPasswordPage />,
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorFallback />,
    children: [
      {
        path: '/patient/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['Paciente']}>
            <PatientDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/patient/search',
        element: (
          <ProtectedRoute allowedRoles={['Paciente']}>
            <SearchProfessionalsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/patient/appointments',
        element: (
          <ProtectedRoute allowedRoles={['Paciente']}>
            <MyAppointmentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/patient/calendar',
        element: (
          <ProtectedRoute allowedRoles={['Paciente']}>
            <MisTurnosCalendario />
          </ProtectedRoute>
        ),
      },
      {
        path: '/patient/mis-turnos-calendario',
        element: (
          <ProtectedRoute allowedRoles={['Paciente']}>
            <MisTurnosCalendario />
          </ProtectedRoute>
        ),
      },
      {
        path: '/professional/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['Profesional']}>
            <ProfessionalDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/institution/reception',
        element: (
          <ProtectedRoute allowedRoles={['Asistente']}>
            <ReceptionDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/institution/admin',
        element: (
          <ProtectedRoute allowedRoles={['AdminInstitucion', 'Institucion']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/institution/sede-admin',
        element: (
          <ProtectedRoute allowedRoles={['AdminConsultorio']}>
            <ConsultorioAdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/institution/configuracion-medica',
        element: (
          <ProtectedRoute allowedRoles={['Asistente']}>
            <CoverageParameterizationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/institution/parametrizacion',
        element: (
          <ProtectedRoute allowedRoles={['Asistente']}>
            <CoverageParameterizationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/institution/coberturas',
        element: (
          <ProtectedRoute allowedRoles={['Asistente']}>
            <CoverageParameterizationPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    element: (
      <ProtectedRoute allowedRoles={['SuperAdmin']}>
        <VitalityLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorFallback />,
    children: [
      {
        path: '/vitality/clients',
        element: <VitalityClientsPage />,
      },
      {
        path: '/vitality/specialties',
        element: <VitalitySpecialtiesPage />,
      },
      {
        path: '/vitality/insurance',
        element: <VitalityInsurancePage />,
      },
      {
        path: '/vitality/metrics',
        element: <VitalityMetricsPage />,
      },
      {
        path: '/vitality/system',
        element: <VitalitySystemPage />,
      },
      {
        path: '/vitality/admins',
        element: <VitalityAdminsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
