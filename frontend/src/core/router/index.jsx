import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../../modules/public/pages/HomePage';
import { LoginPage } from '../../modules/auth/pages/LoginPage';
import { RegisterPage } from '../../modules/auth/pages/RegisterPage';
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
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
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
