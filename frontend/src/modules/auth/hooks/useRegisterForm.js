import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { apiClient } from '../../../core/api/apiClient';
import { useAuth } from '../../../core/context/AuthContext';
import { useToast } from '../../../shared/components/ui/Toast';
import { patientRegistrationSchema } from '../../../shared/validation/schemas';
import { validateWithSchema, parseBackendError } from '../../../shared/validation/validateForm';

export const useRegisterForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    contrasena: '',
    confirmarContrasena: '',
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
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      // Validación cruzada inmediata de coincidencia de contraseñas
      if (name === 'confirmarContrasena') {
        if (value && next.contrasena && value !== next.contrasena) {
          setErrors((errs) => ({ ...errs, confirmarContrasena: 'Las contraseñas no coinciden' }));
        } else {
          setErrors((errs) => ({ ...errs, confirmarContrasena: '' }));
        }
      } else if (name === 'contrasena') {
        if (next.confirmarContrasena && value && value !== next.confirmarContrasena) {
          setErrors((errs) => ({ ...errs, confirmarContrasena: 'Las contraseñas no coinciden' }));
        } else if (next.confirmarContrasena && value === next.confirmarContrasena) {
          setErrors((errs) => ({ ...errs, confirmarContrasena: '' }));
        }
      }

      return next;
    });

    if (errors[name] && name !== 'confirmarContrasena') {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const { isValid, errors: validationErrors } = validateWithSchema(
      patientRegistrationSchema,
      formData
    );
    setErrors(validationErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificación estricta de confirmación de contraseña antes de habilitar el envío
    if (!formData.confirmarContrasena) {
      setErrors((prev) => ({
        ...prev,
        confirmarContrasena: 'Debes confirmar tu contraseña',
      }));
      return;
    }

    if (formData.contrasena !== formData.confirmarContrasena) {
      setErrors((prev) => ({
        ...prev,
        confirmarContrasena: 'Las contraseñas no coinciden',
      }));
      return;
    }

    const { isValid, errors: validationErrors, data: sanitizedData } = validateWithSchema(
      patientRegistrationSchema,
      formData
    );

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.registerPatient({
        nombre: sanitizedData.nombre,
        apellido: sanitizedData.apellido,
        dni: sanitizedData.dni,
        email: sanitizedData.email,
        contrasena: sanitizedData.contrasena,
        obraSocialId: sanitizedData.obraSocialId,
      });

      // Iniciar sesión en memoria inmediatamente
      setAuthData(
        {
          id: response.id,
          usuario: response.usuario,
          mail: response.mail,
          rol: response.rol,
          cuil: response.cuil,
          nombreCompleto: response.nombreCompleto || `${sanitizedData.nombre} ${sanitizedData.apellido}`.trim(),
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
      const parsed = parseBackendError(err, 'No se pudo completar el registro del paciente.');
      if (parsed.isDuplicate) {
        setErrors((prev) => ({ ...prev, dni: parsed.message, general: parsed.message }));
      } else if (parsed.fieldErrors && Object.keys(parsed.fieldErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...parsed.fieldErrors, general: parsed.message }));
      } else {
        setErrors((prev) => ({ ...prev, general: parsed.message }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPasswordMismatch = Boolean(
    formData.confirmarContrasena && formData.contrasena !== formData.confirmarContrasena
  );

  return {
    formData,
    errors,
    obrasSociales,
    isLoadingObrasSociales,
    isSubmitting,
    isPasswordMismatch,
    handleChange,
    handleSubmit,
  };
};
