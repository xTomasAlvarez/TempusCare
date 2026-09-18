import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './core/router';
import { AuthProvider } from './core/context/AuthContext';
import { ToastProvider } from './shared/components/ui/Toast';

export const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
