import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { useLoginForm } from '../hooks/useLoginForm';

export const LoginPage = () => {
  const { formData, errors, isSubmitting, handleChange, handleSubmit } = useLoginForm();
  const [showPassword, setShowPassword] = useState(false);

  // Perfiles de prueba rápida para testing del jurado y desarrollo
  const testProfiles = [
    { label: 'Super Admin', user: 'admin@vitality.com', pass: 'Admin123!', hint: 'Vitality' },
    { label: 'Institución', user: '30111222334', pass: 'Institucion123!', hint: 'Sedes' },
    { label: 'Admin Sede', user: 'admin.cons101', pass: 'AdminCons123!', hint: 'Consultorio' },
    { label: 'Asistente', user: '27111111111', pass: 'Asistente123!', hint: 'Recepción' },
    { label: 'Médico', user: '20123456789', pass: 'Medico123!', hint: 'Atención' },
    { label: 'Paciente', user: '27000000001', pass: 'Paciente123!', hint: 'Turnos' },
  ];

  const fillQuickTest = (user, pass) => {
    handleChange({ target: { name: 'usuario', value: user } });
    handleChange({ target: { name: 'contra', value: pass } });
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto">
      <Card className="border-slate-200/80 shadow-md">
        {/* Cabecera compacta y jerárquica con dimensiones optimizadas */}
        <CardHeader className="text-center p-4 pb-1 sm:p-5 sm:pb-2">
          <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 mx-auto mb-1.5 shadow-xs">
            <LogIn className="w-4 h-4 text-primary-600" strokeWidth={2} aria-hidden="true" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold font-heading text-slate-900 leading-tight">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Ingresa tus credenciales para acceder a la plataforma.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 sm:px-6 py-0">
          <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
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
              leadingIcon={<Mail className="w-4 h-4 text-primary-600" strokeWidth={2} />}
              autoComplete="username"
              className="py-1.5 text-sm"
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
              leadingIcon={<Lock className="w-4 h-4 text-primary-600" strokeWidth={2} />}
              autoComplete="current-password"
              className="py-1.5 text-sm"
              trailingIcon={
                <button
                  type="button"
                  tabIndex={0}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={2} /> : <Eye className="w-4 h-4" strokeWidth={2} />}
                </button>
              }
            />

            {/* Mensaje de error general si existe */}
            {errors.general && (
              <div className="py-0.5">
                <p className="text-xs text-rose-600 flex items-center gap-1.5 font-medium animate-in fade-in-0">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.general}</span>
                </p>
              </div>
            )}

            <div className="pt-0.5">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                className="w-full text-sm font-semibold shadow-xs py-2 gap-2"
              >
                <LogIn className="w-4 h-4" strokeWidth={2} />
                <span>Acceder a la plataforma</span>
              </Button>
            </div>
          </form>

          {/* Accesos rápidos de desarrollo en grilla compacta de 2 columnas */}
          <div className="mt-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary-600" strokeWidth={2} aria-hidden="true" />
                <span>Accesos rápidos de prueba:</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">1-clic</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {testProfiles.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => fillQuickTest(p.user, p.pass)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200/80 bg-slate-50/70 hover:bg-primary-50/60 hover:border-primary-300 text-slate-700 transition-all flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-primary-500 text-left"
                  title={`${p.label} - ${p.user}`}
                >
                  <div className="min-w-0 pr-1">
                    <span className="text-xs font-semibold text-slate-800 block leading-tight truncate">
                      {p.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block leading-none mt-0.5">
                      {p.hint}
                    </span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/90 border border-slate-200 text-slate-400 group-hover:text-primary-700 group-hover:border-primary-200 font-mono flex-shrink-0">
                    demo
                  </span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-1 justify-center border-t border-slate-100 p-3 sm:p-3.5 bg-slate-50/40 rounded-b-2xl mt-2.5">
          <p className="text-xs text-slate-600 text-center">
            ¿No tienes cuenta de paciente?{' '}
            <Link to="/register" className="text-primary-700 font-semibold hover:underline">
              Registrarse gratis
            </Link>
          </p>
          <p className="text-[11px] text-slate-400 text-center">
            ¿Necesitas asistencia técnica?{' '}
            <span className="text-primary-700 font-semibold cursor-pointer hover:underline">
              Soporte Vitality
            </span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
