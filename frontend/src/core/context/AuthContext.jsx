import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Estado en memoria puro para máxima seguridad (PROHIBIDO persistir JWT sensible en localStorage)
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeConsultorio, setActiveConsultorio] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const setAuthData = useCallback((userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
  }, []);

  const clearAuthData = useCallback(() => {
    setUser(null);
    setToken(null);
    setActiveConsultorio(null);
  }, []);

  /**
   * Determina la ruta del panel principal según el rol asignado
   */
  const getDashboardRoute = useCallback((rol) => {
    switch (rol) {
      case 'Paciente':
        return '/patient/dashboard';
      case 'Profesional':
        return '/professional/dashboard';
      case 'Asistente':
        return '/institution/reception';
      case 'AdminConsultorio':
      case 'AdminInstitucion':
      case 'SuperAdmin':
      case 'Institucion':
        return '/institution/admin';
      default:
        return '/patient/dashboard';
    }
  }, []);

  const value = {
    user,
    token,
    activeConsultorio,
    setActiveConsultorio,
    isAuthenticated: Boolean(user && token),
    isLoading,
    setIsLoading,
    setAuthData,
    clearAuthData,
    getDashboardRoute,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
