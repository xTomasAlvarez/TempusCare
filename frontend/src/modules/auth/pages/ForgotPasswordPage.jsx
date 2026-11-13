import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, KeyRound, ArrowLeft, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { authService } from '../services/authService';
import { pageTransitionVariants } from '../../../shared/motion';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Por favor, ingresa tu correo electrónico, CUIL o usuario registrado.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await authService.forgotPassword(email.trim());
      setSuccessInfo(res);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al procesar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extraer o armar la URL de reseteo garantizando el puerto y host actual del navegador
  const token = successInfo?.resetToken || (() => {
    if (!successInfo?.resetUrl) return null;
    try {
      const u = new URL(successInfo.resetUrl);
      return u.searchParams.get('token');
    } catch {
      return null;
    }
  })();

  const localPath = token
    ? `/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email.trim())}`
    : null;

  const finalResetUrl = localPath
    ? `${window.location.origin}${localPath}`
    : successInfo?.resetUrl;

  const handleGoToReset = () => {
    if (localPath && localPath.startsWith('/')) {
      navigate(localPath);
    } else if (finalResetUrl) {
      window.location.href = finalResetUrl;
    }
  };

  return (
    <motion.div variants={pageTransitionVariants} initial="hidden" animate="visible" className="w-full max-w-md mx-auto my-auto">
      <Card className="border-slate-200/80 shadow-md overflow-hidden" title="Formulario de recuperación de contraseña">
        <CardHeader className="text-center px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 mx-auto mb-2 shadow-xs" title="Ícono de seguridad y recuperación de clave">
            <KeyRound className="w-5 h-5 text-primary-600" strokeWidth={2} aria-hidden="true" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold font-heading text-slate-900 leading-tight" title="Recuperar Contraseña">
            Recuperar Contraseña
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-500 mt-1">
            Ingresa tu correo electrónico, CUIL o usuario registrado para restablecer tu contraseña.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 sm:px-6 py-2">
          {successInfo ? (
            <div className="space-y-4 py-2">
              {finalResetUrl ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 space-y-3.5 shadow-2xs text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    </div>
                    <span className="font-bold font-heading text-sm sm:text-base text-emerald-900 leading-snug">
                      Solicitud de recuperación verificada
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Tu cuenta fue validada correctamente. Haz clic a continuación para definir tu nueva contraseña:
                    </p>
                  </div>

                  <div className="pt-1">
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={handleGoToReset}
                      title="Ir al formulario para definir una nueva contraseña"
                      className="w-full text-xs sm:text-sm font-semibold gap-2 shadow-xs py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Ir a restablecer contraseña</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-2">
                  <p>{successInfo.message || 'Si el usuario o correo electrónico está registrado, podrás continuar con la recuperación.'}</p>
                  <p className="text-[11px] text-slate-500">
                    Verifica haber ingresado un correo, CUIL o usuario registrado válido.
                  </p>
                </div>
              )}

              <div className="pt-1 flex flex-col gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  title="Intentar nuevamente con otro correo o usuario"
                  onClick={() => {
                    setSuccessInfo(null);
                    setEmail('');
                  }}
                  className="w-full text-xs text-slate-600 hover:text-slate-900"
                >
                  Solicitar con otro correo
                </Button>

                <Link to="/login" title="Regresar a la pantalla de inicio de sesión">
                  <Button variant="outline" size="sm" title="Volver a Iniciar Sesión" className="w-full text-xs">
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    Volver a Iniciar Sesión
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
              <Input
                id="email"
                name="email"
                type="text"
                label="Correo Electrónico, CUIL o Usuario"
                placeholder="ej: usuario@correo.com o CUIL"
                title="Ingresa tu correo electrónico, CUIL o nombre de usuario registrado"
                maxLength={120}
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                leadingIcon={<Mail className="w-4 h-4 text-primary-600" strokeWidth={2} />}
                autoComplete="username"
                className="py-2 text-sm"
              />

              {error && (
                <div className="py-0.5">
                  <p className="text-xs text-rose-600 flex items-center gap-1.5 font-medium animate-in fade-in-0">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  title="Validar cuenta y continuar al restablecimiento de contraseña"
                  className="w-full text-sm font-semibold shadow-xs py-2 gap-2"
                >
                  <KeyRound className="w-4 h-4" strokeWidth={2} />
                  <span>Continuar</span>
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        {!successInfo && (
          <CardFooter className="flex justify-center p-4 pt-1 sm:p-5 sm:pt-2 border-t border-slate-100 mt-2">
            <Link
              to="/login"
              title="Volver a la página de inicio de sesión"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Iniciar Sesión</span>
            </Link>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default ForgotPasswordPage;
