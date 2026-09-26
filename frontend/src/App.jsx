import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './core/router';
import { AuthProvider } from './core/context/AuthContext';
import { ToastProvider } from './shared/components/ui/Toast';
import { ConfirmDeleteProvider } from './shared/context/ConfirmDeleteContext';

export const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmDeleteProvider>
          <RouterProvider router={router} />
        </ConfirmDeleteProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
