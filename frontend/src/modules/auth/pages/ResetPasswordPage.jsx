import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck, Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { PasswordRequirements, checkPasswordConditions } from '../../../shared/components/ui/PasswordRequirements';
import { authService } from '../services/authService';
import { pageTransitionVariants } from '../../../shared/motion';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const urlToken = searchParams.get('token');
    if (urlEmail) setEmail(urlEmail);
    if (urlToken) setToken(urlToken);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() && !token.trim()) {
      setError('Por favor, ingresa tu correo electrónico, CUIL o usuario.');
      return;
    }
    const conditions = checkPasswordConditions(newPassword);
    if (!conditions.minLength) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!conditions.hasUpper) {
      setError('La nueva contraseña debe contener al menos una letra mayúscula (A-Z).');
      return;
    }
    if (!conditions.hasLower) {
      setError('La nueva contraseña debe contener al menos una letra minúscula (a-z).');
      return;
    }
    if (!conditions.hasNumber) {
      setError('La nueva contraseña debe contener al menos un número (0-9).');
      return;
    }
    if (!conditions.hasSpecial) {
      setError('La nueva contraseña debe contener al menos un carácter especial o símbolo (!@#$%^&*.,_-).');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setIsSubmitting(true);
      let effectiveToken = token.trim();
      if (!effectiveToken && email.trim()) {
        const forgotRes = await authService.forgotPassword(email.trim());
        effectiveToken = forgotRes?.resetToken || '';
        if (!effectiveToken && forgotRes?.resetUrl) {
          try {
            effectiveToken = new URL(forgotRes.resetUrl).searchParams.get('token') || '';
          } catch {
            effectiveToken = '';
          }
        }
      }

      if (!effectiveToken) {
        setError('No se pudo verificar la cuenta indicada. Verifica tu correo, CUIL o usuario.');
        return;
      }

      await authService.resetPassword({
        email: email ? email.trim() : '',
        token: effectiveToken,
        nuevaContrasena: newPassword
      });
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div variants={pageTransitionVariants} initial="hidden" animate="visible" className="w-full max-w-md mx-auto my-auto">
      <Card className="border-slate-200/80 shadow-md overflow-hidden" title="Formulario para establecer nueva contraseña">
        <CardHeader className="text-center px-4 pt-4 pb-1.5 sm:px-5 sm:pt-5 sm:pb-2">
          <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 mx-auto mb-1.5 shadow-xs" title="Seguridad de cuenta">
            <ShieldCheck className="w-4 h-4 text-primary-600" strokeWidth={2} aria-hidden="true" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold font-heading text-slate-900 leading-tight" title="Nueva Contraseña">
            Nueva Contraseña
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Ingresa tu nueva clave de acceso para actualizar tu cuenta de forma segura.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 sm:px-6 py-1">
          {isSuccess ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>¡Contraseña Actualizada con Éxito!</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Tu clave ha sido reestablecida correctamente. Ya podés iniciar sesión con tus nuevas credenciales.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  title="Ir a la pantalla de inicio de sesión"
                  className="w-full text-xs font-semibold"
                  onClick={() => navigate('/login')}
                >
                  Iniciar Sesión Ahora
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
              <Input
                id="email"
                name="email"
                type="text"
                label="Correo Electrónico o Usuario"
                placeholder="ej: usuario@correo.com"
                title="Correo electrónico, CUIL o usuario asociado a la cuenta"
                maxLength={120}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leadingIcon={<Mail className="w-4 h-4 text-primary-600" strokeWidth={2} />}
                className="py-1.5 text-sm"
              />

              <Input
                id="newPassword"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                label="Nueva Contraseña"
                placeholder="Mínimo 8 caracteres"
                title="Ingresa tu nueva contraseña cumpliendo los requisitos de seguridad"
                maxLength={128}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leadingIcon={<Lock className="w-4 h-4 text-primary-600" strokeWidth={2} />}
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

              {/* Indicador visual de condiciones mínimas de contraseña */}
              <PasswordRequirements password={newPassword} />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                label="Confirmar Nueva Contraseña"
                placeholder="Repite la contraseña"
                title="Repite exactamente la nueva contraseña para confirmar"
                maxLength={128}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leadingIcon={<Lock className="w-4 h-4 text-primary-600" strokeWidth={2} />}
                className="py-1.5 text-sm"
              />

              {error && (
                <div className="py-0.5">
                  <p className="text-xs text-rose-600 flex items-center gap-1.5 font-medium animate-in fade-in-0">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </p>
                </div>
              )}

              <div className="pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  title="Guardar y actualizar la nueva contraseña"
                  className="w-full text-sm font-semibold shadow-xs py-2 gap-2"
                >
                  <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                  <span>Reestablecer Contraseña</span>
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-1 justify-center border-t border-slate-100 p-3 sm:p-3.5 bg-slate-50/40 rounded-b-2xl mt-2">
          <Link to="/login" title="Volver a la pantalla de inicio de sesión" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-primary-700 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a Iniciar Sesión
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ResetPasswordPage;
