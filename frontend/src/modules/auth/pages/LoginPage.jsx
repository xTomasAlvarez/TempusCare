import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { useLoginForm } from '../hooks/useLoginForm';
import { pageTransitionVariants } from '../../../shared/motion';

export const LoginPage = () => {
  const { formData, errors, isSubmitting, handleChange, handleSubmit } = useLoginForm();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div variants={pageTransitionVariants} initial="hidden" animate="visible" className="w-full max-w-md mx-auto my-auto">
      <Card className="border-slate-200/80 shadow-md overflow-hidden" title="Formulario de inicio de sesión">
        {/* Cabecera compacta y jerárquica con dimensiones optimizadas */}
        <CardHeader className="text-center px-4 pt-4 pb-1 sm:px-5 sm:pt-5 sm:pb-2">
          <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 mx-auto mb-1.5 shadow-xs" title="Acceso seguro a TempusCare">
            <LogIn className="w-4 h-4 text-primary-600" strokeWidth={2} aria-hidden="true" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold font-heading text-slate-900 leading-tight" title="Iniciar Sesión">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Ingresa tus credenciales para acceder a la plataforma.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 py-0">
          <form onSubmit={handleSubmit} noValidate className="space-y-2.5 min-w-0 w-full">
            <Input
              id="usuario"
              name="usuario"
              type="text"
              label="Usuario o CUIL / CUIT"
              placeholder="Ej. 20123456789 o correo"
              title="Ingresa tu CUIL, CUIT, correo electrónico o nombre de usuario"
              maxLength={120}
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
              title="Ingresa tu contraseña de acceso"
              maxLength={128}
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
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={2} /> : <Eye className="w-4 h-4" strokeWidth={2} />}
                </button>
              }
            />

            <div className="flex justify-end -mt-1 mb-1">
              <Link
                to="/forgot-password"
                title="Recuperar o restablecer tu contraseña olvidada"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Mensaje de error general si existe */}
            {errors.general && (
              <div className="py-0.5" role="alert" aria-live="assertive">
                <p className="text-xs text-rose-600 flex items-center gap-1.5 font-medium animate-in fade-in-0">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.general}</span>
                </p>
              </div>
            )}

            <div className="pt-1 pb-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                title="Iniciar sesión y acceder a la plataforma"
                className="w-full text-sm font-semibold shadow-xs py-2 gap-2"
              >
                <LogIn className="w-4 h-4" strokeWidth={2} />
                <span>Acceder a la plataforma</span>
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-1 justify-center border-t border-slate-100 p-3 sm:p-3.5 bg-slate-50/40 rounded-b-2xl mt-2.5">
          <p className="text-xs text-slate-600 text-center">
            ¿No tienes cuenta de paciente?{' '}
            <Link to="/register" title="Crear una nueva cuenta gratuita de paciente" className="text-primary-700 font-semibold hover:underline">
              Registrarse gratis
            </Link>
          </p>
          <p className="text-[11px] text-slate-400 text-center">
            ¿Necesitas asistencia técnica?{' '}
            <span title="Centro de asistencia técnica de Vitality Software" className="text-primary-700 font-semibold cursor-pointer hover:underline">
              Soporte Vitality
            </span>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default LoginPage;
