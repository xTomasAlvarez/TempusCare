import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './core/router';
import { AuthProvider } from './core/context/AuthContext';
import { AccessibilityProvider } from './core/context/AccessibilityContext';
import { ToastProvider } from './shared/components/ui/Toast';
import { ConfirmDeleteProvider } from './shared/context/ConfirmDeleteContext';
import { TitleAndSecurityGuard } from './shared/components/ui/TitleAndSecurityGuard';

export const App = () => {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <ToastProvider>
          <ConfirmDeleteProvider>
            <TitleAndSecurityGuard />
            <RouterProvider router={router} />
          </ConfirmDeleteProvider>
        </ToastProvider>
      </AccessibilityProvider>
    </AuthProvider>
  );
};

export default App;
