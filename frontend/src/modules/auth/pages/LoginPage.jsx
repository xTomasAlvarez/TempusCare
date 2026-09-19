import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles } from 'lucide-react';
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
    { label: 'Institución', user: '30111222334', pass: 'Institucion123!', hint: 'Sedes B2B' },
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
    <div className="w-full max-w-[435px] mx-auto -translate-y-6 sm:-translate-y-7">
      <Card className="border-slate-200/80 shadow-md">
        {/* Cabecera espaciosa y jerárquica con dimensiones optimizadas */}
        <CardHeader className="text-center px-7 pt-6 pb-2.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mx-auto mb-2 shadow-xs">
            <LogIn className="w-5 h-5" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl font-bold font-heading text-slate-900">Iniciar Sesión</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-500 mt-1">
            Ingresa tus credenciales para acceder a la plataforma.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-7 py-0">
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
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
              className="py-2.5 text-sm"
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
              className="py-2.5 text-sm"
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

            <div className="pt-1.5">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                className="w-full text-sm font-semibold shadow-xs py-2.5"
              >
                Acceder a la plataforma
              </Button>
            </div>
          </form>

          {/* Accesos rápidos de desarrollo en grilla amplia de 2 columnas */}
          <div className="mt-4 pt-3.5 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
                <span>Accesos rápidos de prueba:</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">1-clic</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {testProfiles.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => fillQuickTest(p.user, p.pass)}
                  className="px-3 py-2 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-teal-50/60 hover:border-teal-300 text-slate-700 transition-all flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-teal-500 text-left"
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
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/90 border border-slate-200 text-slate-400 group-hover:text-teal-700 group-hover:border-teal-200 font-mono flex-shrink-0">
                    demo
                  </span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2 justify-center border-t border-slate-100 py-3 px-7 bg-slate-50/40 rounded-b-2xl mt-4">
          <p className="text-xs text-slate-600 text-center">
            ¿No tienes cuenta de paciente?{' '}
            <Link to="/register" className="text-teal-700 font-semibold hover:underline">
              Registrarse gratis
            </Link>
          </p>
          <p className="text-[11px] text-slate-400 text-center">
            ¿Necesitas asistencia técnica?{' '}
            <span className="text-teal-700 font-semibold cursor-pointer hover:underline">
              Soporte Vitality
            </span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
