import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserRoundPlus, Stethoscope, ShieldCheck, ArrowRight } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';

export const AuthRequiredModal = ({
  isOpen,
  onClose,
  doctor,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const doctorName = doctor ? `Dr. ${doctor.nombre} ${doctor.apellido}` : 'el profesional';
  const specialty = doctor?.especialidades?.[0] || 'Atención médica';

  const handleGoToLogin = () => {
    onClose();
    navigate('/login', {
      state: {
        from: '/',
        selectedDoctorCuil: doctor?.cuil,
      },
    });
  };

  const handleGoToRegister = () => {
    onClose();
    navigate('/register', {
      state: {
        from: '/',
        selectedDoctorCuil: doctor?.cuil,
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Por favor, inicia sesión o regístrate para reservar tu turno"
      description="Identifícate como paciente para acceder a la agenda médica en tiempo real"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5 pt-1">
        {/* Tarjeta del Médico Seleccionado */}
        {doctor && (
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-primary-50/60 border border-primary-100/80">
            <div className="w-11 h-11 rounded-xl bg-primary-600 text-white flex items-center justify-center font-heading font-bold text-base shrink-0 shadow-xs">
              {doctor.nombre?.[0] || 'D'}{doctor.apellido?.[0] || 'M'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold font-heading text-slate-900 truncate">
                {doctorName}
              </p>
              <p className="text-xs text-primary-800 flex items-center gap-1 mt-0.5">
                <Stethoscope className="w-3.5 h-3.5" strokeWidth={2} />
                <span className="truncate">{specialty}</span>
              </p>
            </div>
          </div>
        )}

        {/* Explicación amigable */}
        <div className="flex items-start gap-3 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
          <ShieldCheck className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" strokeWidth={2} />
          <p className="leading-relaxed">
            Tu reserva quedará vinculada de forma segura a tu historia clínica unificada según la Ley 25.326 de Protección de Datos Médicos.
          </p>
        </div>

        {/* Acciones Principales con botones de redirección */}
        <div className="space-y-2.5 pt-2">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleGoToLogin}
            className="w-full justify-center gap-2 shadow-xs py-2.5 text-sm font-semibold"
          >
            <LogIn className="w-4 h-4" strokeWidth={2} />
            <span>Iniciar Sesión</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleGoToRegister}
            className="w-full justify-center gap-2 border-slate-200 hover:bg-slate-50 py-2.5 text-sm font-semibold text-slate-700"
          >
            <UserRoundPlus className="w-4 h-4 text-primary-600" strokeWidth={2} />
            <span>Registrarse como Paciente</span>
          </Button>
        </div>

        {/* Cierre alternativo */}
        <div className="text-center pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors py-1 focus:outline-none focus:underline"
          >
            Continuar explorando médicos sin ingresar
          </button>
        </div>
      </div>
    </Modal>
  );
};
