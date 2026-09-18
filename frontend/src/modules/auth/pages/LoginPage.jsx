import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, UserCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { useLoginForm } from '../hooks/useLoginForm';

export const LoginPage = () => {
  const { formData, errors, isSubmitting, handleChange, handleSubmit } = useLoginForm();
  const [showPassword, setShowPassword] = useState(false);

  // Perfiles de prueba rápida para testing del jurado/desarrollo
  const testProfiles = [
    { label: 'Paciente', user: '27000000001', pass: 'Paciente123!' },
    { label: 'Médico', user: '20123456789', pass: 'Medico123!' },
    { label: 'Asistente', user: '27111111111', pass: 'Asistente123!' },
    { label: 'Institución', user: '30111222334', pass: 'Institucion123!' },
  ];

  const fillQuickTest = (user, pass) => {
    handleChange({ target: { name: 'usuario', value: user } });
    handleChange({ target: { name: 'contra', value: pass } });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-slate-200/80 shadow-md">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mx-auto mb-3 shadow-xs">
            <LogIn className="w-6 h-6" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a tu portal de salud o administración.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              id="usuario"
              name="usuario"
              type="text"
              label="Usuario o CUIL / CUIT"
              placeholder="Ej. 20123456789 o correo"
              required
              value={formData.usuario}
              onChange={handleChange}
              error={errors.usuario}
              leadingIcon={<Mail className="w-4 h-4" />}
              autoComplete="username"
            />

            <Input
              id="contra"
              name="contra"
              type={showPassword ? 'text' : 'password'}
              label="Contraseña"
              placeholder="••••••••"
              required
              value={formData.contra}
              onChange={handleChange}
              error={errors.contra}
              leadingIcon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
              trailingIcon={
                <button
                  type="button"
                  tabIndex={0}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full"
              >
                Acceder a la plataforma
              </Button>
            </div>
          </form>

          {/* Accesos rápidos de desarrollo para agilizar las pruebas */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
              <span>Accesos rápidos de demostración:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {testProfiles.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => fillQuickTest(p.user, p.pass)}
                  className="text-left px-2.5 py-1.5 rounded-lg border border-slate-200/70 bg-slate-50/70 hover:bg-teal-50/50 hover:border-teal-200 text-xs font-medium text-slate-700 transition-colors flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <span>{p.label}</span>
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-center border-t border-slate-100 py-4 bg-slate-50/50 rounded-b-2xl">
          <p className="text-xs text-slate-500 text-center">
            ¿Necesitas ayuda o perdiste el acceso?{' '}
            <span className="text-teal-700 font-semibold cursor-pointer hover:underline">
              Soporte de Acceso
            </span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
