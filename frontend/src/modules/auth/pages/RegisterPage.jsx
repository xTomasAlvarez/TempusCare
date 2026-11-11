import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserRound, Mail, Lock, Eye, EyeOff, UserRoundPlus, ShieldPlus, IdCard, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { PasswordRequirements } from '../../../shared/components/ui/PasswordRequirements';
import { useRegisterForm } from '../hooks/useRegisterForm';
import { pageTransitionVariants } from '../../../shared/motion';

export const RegisterPage = () => {
  const {
    formData,
    errors,
    obrasSociales,
    isLoadingObrasSociales,
    isSubmitting,
    isPasswordMismatch,
    handleChange,
    handleSubmit,
  } = useRegisterForm();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [consentimientoLey25326, setConsentimientoLey25326] = useState(true);

  return (
    <motion.div variants={pageTransitionVariants} initial="hidden" animate="visible" className="w-full max-w-xl mx-auto my-auto">
      <Card className="border-slate-200/80 shadow-md" title="Formulario de registro de nuevo paciente">
        {/* Cabecera Compacta con Jerarquía Visual */}
        <CardHeader className="text-center p-4 pb-1.5 sm:p-5 sm:pb-2">
          <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 mx-auto mb-1 shadow-xs" title="Registro de nuevo paciente">
            <UserRoundPlus className="w-4 h-4 text-primary-600" strokeWidth={2} aria-hidden="true" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold font-heading text-slate-900 leading-tight" title="Registro de Paciente">
            Registro de Paciente
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Crea tu cuenta gratuita para reservar turnos y consultar tu historial médico.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 sm:px-6 py-0">
          <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
            {/* Fila Nombre y Apellido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input
                id="nombre"
                name="nombre"
                type="text"
                label="Nombre"
                placeholder="Ej. Juan"
                title="Ingresa tu nombre de pila"
                maxLength={80}
                required
                value={formData.nombre}
                onChange={handleChange}
                error={errors.nombre}
                leadingIcon={<UserRound className="w-4 h-4 text-primary-600" strokeWidth={2} />}
                autoComplete="given-name"
                className="py-1.5 text-sm"
              />

              <Input
                id="apellido"
                name="apellido"
                type="text"
                label="Apellido"
                placeholder="Ej. Pérez"
                title="Ingresa tu apellido"
                maxLength={80}
                required
                value={formData.apellido}
                onChange={handleChange}
                error={errors.apellido}
                leadingIcon={<UserRound className="w-4 h-4 text-primary-600" strokeWidth={2} />}
                autoComplete="family-name"
                className="py-1.5 text-sm"
              />
            </div>

            {/* Fila CUIL y Correo Electrónico */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input
                id="dni"
                name="dni"
                type="text"
                label="CUIL (11 dígitos)"
                placeholder="Ej. 20351234567"
                title="Ingresa tu CUIL de 11 dígitos sin puntos ni guiones"
                maxLength={11}
                inputMode="numeric"
                required
                value={formData.dni}
                onChange={handleChange}
                error={errors.dni}
                leadingIcon={<IdCard className="w-4 h-4 text-primary-600" strokeWidth={2} />}
                autoComplete="off"
                className="py-1.5 text-sm"
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Correo Electrónico"
                placeholder="juan.perez@ejemplo.com"
                title="Ingresa tu correo electrónico válido"
                maxLength={120}
                required
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                leadingIcon={<Mail className="w-4 h-4 text-primary-600" strokeWidth={2} />}
                autoComplete="email"
                className="py-1.5 text-sm"
              />
            </div>

            {/* Fila Contraseña y Confirmar Contraseña */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input
                id="contrasena"
                name="contrasena"
                type={showPassword ? 'text' : 'password'}
                label="Contraseña"
                placeholder="Mínimo 8 caracteres"
                title="Crea una contraseña segura de al menos 8 caracteres"
                maxLength={128}
                required
                value={formData.contrasena}
                onChange={handleChange}
                error={errors.contrasena}
                leadingIcon={<Lock className="w-4 h-4 text-primary-600" strokeWidth={2} />}
                autoComplete="new-password"
                className="py-1.5 text-sm"
                trailingIcon={
                  <button
                    type="button"
                    tabIndex={0}
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none focus:text-primary-600 transition-colors p-1"
                    title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                    )}
                  </button>
                }
              />

              <Input
                id="confirmarContrasena"
                name="confirmarContrasena"
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirmar Contraseña"
                placeholder="Repite tu contraseña"
                title="Repite exactamente tu contraseña para confirmar"
                maxLength={128}
                required
                value={formData.confirmarContrasena}
                onChange={handleChange}
                error={errors.confirmarContrasena}
                leadingIcon={<Lock className="w-4 h-4 text-primary-600" strokeWidth={2} />}
                autoComplete="new-password"
                className="py-1.5 text-sm"
                trailingIcon={
                  <button
                    type="button"
                    tabIndex={0}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none focus:text-primary-600 transition-colors p-1"
                    title={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
                    aria-label={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Ver confirmación de contraseña'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                    )}
                  </button>
                }
              />
            </div>

            {/* Indicador visual de condiciones mínimas de contraseña */}
            <PasswordRequirements password={formData.contrasena} />

            {/* Selector de Obra Social (Opcional) */}
            <div className="w-full">
              <label
                htmlFor="obraSocialId"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                title="Selecciona tu obra social o cobertura médica (opcional)"
              >
                Obra Social o Cobertura <span className="text-slate-400 text-[10px] font-normal lowercase">(opcional)</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <ShieldPlus className="w-4 h-4 text-primary-600" strokeWidth={2} aria-hidden="true" />
                </div>
                <select
                  id="obraSocialId"
                  name="obraSocialId"
                  value={formData.obraSocialId}
                  onChange={handleChange}
                  title="Seleccionar obra social o cobertura médica"
                  className="block w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-4 py-1.5 text-sm text-slate-900 transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
                >
                  <option value="">Particular / Sin Obra Social seleccionada</option>
                  {obrasSociales.map((os) => (
                    <option key={os.id} value={os.id}>
                      {os.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Consentimiento Informado de Confidencialidad Médica (Ley 25.326 - RNF-SEG-06) */}
            <label
              htmlFor="consentimientoLey25326"
              title="Consentimiento informado requerido por la Ley Nacional 25.326 de Protección de Datos Personales"
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer select-none"
            >
              <input
                id="consentimientoLey25326"
                type="checkbox"
                checked={consentimientoLey25326}
                onChange={(e) => setConsentimientoLey25326(e.target.checked)}
                required
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-600 leading-snug">
                Otorgo mi <strong>consentimiento informado (Ley 25.326)</strong> para el resguardo confidencial y cifrado (AES-256) de mi Historia Clínica Unificada, accesible únicamente por profesionales autorizados.
              </span>
            </label>

            {/* Mensaje de error general si existe */}
            {errors.general && (
              <div className="py-0.5 flex items-center">
                <p role="alert" aria-live="assertive" className="text-xs text-rose-600 flex items-center gap-1.5 font-medium animate-in fade-in-0">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.general}</span>
                </p>
              </div>
            )}

            {/* Botón de Envío */}
            <div className="pt-0.5">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                disabled={isSubmitting || isPasswordMismatch || !consentimientoLey25326}
                title="Completar el registro de cuenta como paciente"
                className="w-full text-sm font-semibold shadow-xs py-2 gap-2"
              >
                <UserRoundPlus className="w-4 h-4" strokeWidth={2} />
                <span>Registrarme como Paciente</span>
              </Button>
            </div>
          </form>
        </CardContent>

        {/* Footer con Enlace a Login */}
        <CardFooter className="justify-center border-t border-slate-100 p-3 sm:p-3.5 bg-slate-50/40 rounded-b-2xl mt-2.5">
          <p className="text-xs text-slate-500 text-center">
            ¿Ya tienes una cuenta registrada?{' '}
            <Link
              to="/login"
              title="Ir a la página de inicio de sesión"
              className="text-primary-700 font-semibold hover:underline focus:outline-none focus:ring-1 focus:ring-primary-500 rounded"
            >
              Iniciar Sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RegisterPage;
