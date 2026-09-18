import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../../../core/context/AuthContext';
import { useToast } from '../../../shared/components/ui/Toast';

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
    const newErrors = {};
    if (!formData.usuario.trim()) {
      newErrors.usuario = 'Ingresa tu nombre de usuario o correo';
    }
    if (!formData.contra) {
      newErrors.contra = 'Ingresa tu contraseña';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await authService.login(formData);

      // Almacenar en memoria en el contexto de autenticación
      setAuthData(
        {
          id: response.id,
          usuario: response.usuario,
          mail: response.mail,
          rol: response.rol,
          cuil: response.cuil,
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
      addToast({
        title: 'Error al iniciar sesión',
        description: err.message || 'Verifica tus credenciales e intenta nuevamente.',
        variant: 'error',
      });
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
