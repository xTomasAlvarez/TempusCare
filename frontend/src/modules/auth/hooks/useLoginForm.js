import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../../../core/context/AuthContext';
import { useToast } from '../../../shared/components/ui/Toast';
import { loginSchema } from '../../../shared/validation/schemas';
import { validateWithSchema, parseBackendError } from '../../../shared/validation/validateForm';

export const useLoginForm = () => {
  const [formData, setFormData] = useState({ usuario: '', contra: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setAuthData, getDashboardRoute } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const { isValid, errors: validationErrors } = validateWithSchema(loginSchema, formData);
    setErrors(validationErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors, data: sanitizedData } = validateWithSchema(
      loginSchema,
      formData
    );
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.login(sanitizedData);

      // Almacenar en memoria en el contexto de autenticación
      setAuthData(
        {
          id: response.id,
          usuario: response.usuario,
          mail: response.mail,
          rol: response.rol,
          cuil: response.cuil,
          consultorioCuit: response.consultorioCuit,
          sedeNombre: response.sedeNombre,
          institucionId: response.institucionId,
          nombreCompleto: response.nombreCompleto || response.usuario,
        },
        response.token
      );

      addToast({
        title: '¡Bienvenido!',
        description: `Sesión iniciada como ${response.rol}`,
        variant: 'success',
      });

      // Redirigir al dashboard según el rol del usuario
      const targetRoute = getDashboardRoute(response.rol);
      navigate(targetRoute, { replace: true });
    } catch (err) {
      const parsed = parseBackendError(err, 'Verifica tus credenciales e intenta nuevamente.');
      setErrors((prev) => ({
        ...prev,
        ...(parsed.fieldErrors || {}),
        general: parsed.message,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
};
