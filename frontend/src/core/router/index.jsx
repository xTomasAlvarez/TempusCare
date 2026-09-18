import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../../modules/auth/pages/LoginPage';
import { PatientDashboardPage } from '../../modules/patient/pages/PatientDashboardPage';
import { SearchProfessionalsPage } from '../../modules/patient/pages/SearchProfessionalsPage';
import { MyAppointmentsPage } from '../../modules/patient/pages/MyAppointmentsPage';
import { ProfessionalDashboardPage } from '../../modules/professional/pages/ProfessionalDashboardPage';
import { ReceptionDashboardPage } from '../../modules/institution/pages/ReceptionDashboardPage';
import { AdminDashboardPage } from '../../modules/institution/pages/AdminDashboardPage';
import { ConsultorioAdminPage } from '../../modules/institution/pages/ConsultorioAdminPage';
import { VitalityLayout } from '../../modules/vitality/layouts/VitalityLayout';
import { VitalityClientsPage } from '../../modules/vitality/pages/VitalityClientsPage';
import { useAuth } from '../context/AuthContext';

/**
 * Componente Guard para rutas protegidas en memoria
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    // Si el rol no coincide con la ruta específica, redirige a su panel correspondiente
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * Redirección de la raíz según autenticación y rol
 */
const RootRedirect = () => {
  const { user, isAuthenticated, getDashboardRoute } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardRoute(user?.rol)} replace />;
};

/**
 * Enrutamiento estático instanciado a nivel de módulo (Cumplimiento estricto de Design.md)
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
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
          <ProtectedRoute allowedRoles={['Asistente', 'AdminConsultorio', 'AdminInstitucion', 'SuperAdmin', 'Institucion']}>
            <ReceptionDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/institution/admin',
        element: (
          <ProtectedRoute allowedRoles={['AdminInstitucion', 'SuperAdmin', 'Institucion']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/institution/sede-admin',
        element: (
          <ProtectedRoute allowedRoles={['AdminConsultorio', 'AdminInstitucion', 'SuperAdmin', 'Institucion']}>
            <ConsultorioAdminPage />
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
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
