import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { apiClient } from '../../../core/api/apiClient';
import { useAuth } from '../../../core/context/AuthContext';
import { useToast } from '../../../shared/components/ui/Toast';

export const useRegisterForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    contrasena: '',
    obraSocialId: '',
  });

  const [obrasSociales, setObrasSociales] = useState([]);
  const [isLoadingObrasSociales, setIsLoadingObrasSociales] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setAuthData, getDashboardRoute } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Cargar catálogo de Obras Sociales para el selector opcional
  useEffect(() => {
    let isMounted = true;
    const fetchObrasSociales = async () => {
      setIsLoadingObrasSociales(true);
      try {
        const data = await apiClient.get('obrassociales');
        if (isMounted && Array.isArray(data)) {
          setObrasSociales(data);
        }
      } catch (err) {
        console.warn('No se pudo cargar el listado de obras sociales:', err);
      } finally {
        if (isMounted) setIsLoadingObrasSociales(false);
      }
    };

    fetchObrasSociales();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio';
    } else if (formData.apellido.trim().length < 2) {
      newErrors.apellido = 'El apellido debe tener al menos 2 caracteres';
    }

    const dniRegex = /^\d{7,10}$/;
    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (!dniRegex.test(formData.dni.trim().replace(/\./g, ''))) {
      newErrors.dni = 'Ingresa un DNI válido (solo números, entre 7 y 10 dígitos)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Ingresa un correo electrónico con formato válido';
    }

    if (!formData.contrasena) {
      newErrors.contrasena = 'La contraseña es obligatoria';
    } else if (formData.contrasena.length < 6) {
      newErrors.contrasena = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await authService.registerPatient({
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni.trim().replace(/\./g, ''),
        email: formData.email,
        contrasena: formData.contrasena,
        obraSocialId: formData.obraSocialId ? Number(formData.obraSocialId) : null,
      });

      // Iniciar sesión en memoria inmediatamente
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
        title: '¡Registro Exitoso!',
        description: `Bienvenido a TempusCare, ${formData.nombre}. Ya puedes reservar tus turnos.`,
        variant: 'success',
      });

      // Redirigir a returnUrl si venía de reservar un turno, o al dashboard de paciente
      const returnUrl = location.state?.from || getDashboardRoute(response.rol);
      navigate(returnUrl, { replace: true });
    } catch (err) {
      addToast({
        title: 'Error al registrar paciente',
        description: err.message || 'Verifica los datos e intenta nuevamente.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    obrasSociales,
    isLoadingObrasSociales,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
};
