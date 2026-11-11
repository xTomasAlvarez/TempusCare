import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { ShieldAlert, Users, Send, AlertCircle, Sparkles } from 'lucide-react';

/**
 * Modal para proponer la creación de un nuevo Super Administrador.
 * Implementa el protocolo de consenso multipartito (aprobación de terceros).
 */
export const ProposeAdminModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setEmailError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setEmailError('El correo electrónico es obligatorio.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailError('Ingresa un formato de correo electrónico válido.');
      return;
    }

    setEmailError('');
    const success = await onSubmit(cleanEmail);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Proponer Nuevo Super Administrador"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Banner Explicativo del Protocolo de Consenso */}
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Protocolo de Consenso Obligatorio</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Por estrictas políticas de gobernanza en <strong>Vitality</strong>, ninguna cuenta de
            Super Administrador puede crearse directamente. Al enviar esta propuesta, quedará en
            estado <strong>Pendiente</strong> y requerirá que un <strong>tercer Super Administrador</strong>{' '}
            la audite y apruebe para habilitar las credenciales.
          </p>
        </div>

        {/* Campo de Correo Electrónico Propuesto */}
        <div className="space-y-1.5">
          <Input
            id="proposed-admin-email"
            label="Correo Electrónico del Candidato"
            type="email"
            placeholder="ej. nuevo.admin@vitality.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            error={emailError}
            disabled={isSubmitting}
            required
            autoFocus
          />
          <p className="text-[11px] text-slate-500">
            Se generará una solicitud formal vinculada a tu usuario proponente.
          </p>
        </div>

        {/* Información de Credenciales Iniciales */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
          <span>
            Una vez aprobada por otro administrador, la cuenta se creará con el rol de Super Administrador
            y contraseña temporal de acceso seguro.
          </span>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="text-xs gap-1.5 bg-primary-600 hover:bg-primary-700"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Enviando Propuesta...' : 'Enviar Propuesta a Consenso'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
