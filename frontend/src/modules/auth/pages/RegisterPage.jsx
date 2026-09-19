import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Shield, IdCard, Building } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { useRegisterForm } from '../hooks/useRegisterForm';

export const RegisterPage = () => {
  const {
    formData,
    errors,
    obrasSociales,
    isLoadingObrasSociales,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useRegisterForm();

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-[480px] mx-auto py-2">
      <Card className="border-slate-200/80 shadow-md">
        {/* Cabecera con Jerarquía Visual */}
        <CardHeader className="text-center px-6 sm:px-8 pt-6 pb-2">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mx-auto mb-2 shadow-xs">
            <UserPlus className="w-5 h-5" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl font-bold font-heading text-slate-900">
            Registro de Paciente
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-500 mt-1">
            Crea tu cuenta gratuita para reservar turnos y consultar tu historial médico.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 sm:px-8 py-2">
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            {/* Fila Nombre y Apellido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="nombre"
                name="nombre"
                type="text"
                label="Nombre"
                placeholder="Ej. Juan"
                required
                value={formData.nombre}
                onChange={handleChange}
                error={errors.nombre}
                leadingIcon={<User className="w-4 h-4" />}
                autoComplete="given-name"
                className="py-2 text-sm"
              />

              <Input
                id="apellido"
                name="apellido"
                type="text"
                label="Apellido"
                placeholder="Ej. Pérez"
                required
                value={formData.apellido}
                onChange={handleChange}
                error={errors.apellido}
                leadingIcon={<User className="w-4 h-4" />}
                autoComplete="family-name"
                className="py-2 text-sm"
              />
            </div>

            {/* DNI */}
            <Input
              id="dni"
              name="dni"
              type="text"
              label="DNI / Documento"
              placeholder="Ej. 35123456"
              required
              value={formData.dni}
              onChange={handleChange}
              error={errors.dni}
              leadingIcon={<IdCard className="w-4 h-4" />}
              autoComplete="off"
              className="py-2 text-sm"
              helperText="Sin puntos ni espacios. Se utilizará como tu identificador de paciente."
            />

            {/* Email */}
            <Input
              id="email"
              name="email"
              type="email"
              label="Correo Electrónico"
              placeholder="juan.perez@ejemplo.com"
              required
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              leadingIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              className="py-2 text-sm"
            />

            {/* Contraseña */}
            <Input
              id="contrasena"
              name="contrasena"
              type={showPassword ? 'text' : 'password'}
              label="Contraseña"
              placeholder="Mínimo 6 caracteres"
              required
              value={formData.contrasena}
              onChange={handleChange}
              error={errors.contrasena}
              leadingIcon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
              className="py-2 text-sm"
              trailingIcon={
                <button
                  type="button"
                  tabIndex={0}
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none focus:text-teal-600 transition-colors p-1"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              }
            />

            {/* Selector de Obra Social (Opcional) */}
            <div className="w-full">
              <label
                htmlFor="obraSocialId"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Obra Social o Cobertura <span className="text-slate-400 text-[10px] font-normal lowercase">(opcional)</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Shield className="w-4 h-4" aria-hidden="true" />
                </div>
                <select
                  id="obraSocialId"
                  name="obraSocialId"
                  value={formData.obraSocialId}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
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

            {/* Botón de Envío */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                className="w-full text-sm font-semibold shadow-xs py-2.5"
              >
                Registrarme como Paciente
              </Button>
            </div>
          </form>
        </CardContent>

        {/* Footer con Enlace a Login */}
        <CardFooter className="justify-center border-t border-slate-100 py-3 px-6 sm:px-8 bg-slate-50/40 rounded-b-2xl mt-3">
          <p className="text-xs text-slate-500 text-center">
            ¿Ya tienes una cuenta registrada?{' '}
            <Link
              to="/login"
              className="text-teal-700 font-semibold hover:underline focus:outline-none focus:ring-1 focus:ring-teal-500 rounded"
            >
              Iniciar Sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
