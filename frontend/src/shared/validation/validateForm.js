/**
 * Helper universal de validación de esquemas Zod para formularios controlados.
 * Transforma los issues de Zod en un diccionario accesible { [campo]: mensajeError }.
 */
export const validateWithSchema = (schema, data) => {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      isValid: true,
      errors: {},
      data: result.data,
      firstError: null,
    };
  }

  const errors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] || 'general';
    // Mantiene el primer mensaje de error para cada campo
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }

  const firstErrorKey = Object.keys(errors)[0];
  const firstError = firstErrorKey ? errors[firstErrorKey] : 'Error en los datos ingresados';

  return {
    isValid: false,
    errors,
    data: null,
    firstError,
  };
};

/**
 * Normalizador y extractor de excepciones del backend para atrapar duplicados,
 * errores de validación de EF Core / SQLite y respuestas ProblemDetails de ASP.NET.
 */
export const parseBackendError = (err, fallbackMessage = 'Ocurrió un error al procesar la solicitud.') => {
  if (!err) return { message: fallbackMessage, isDuplicate: false, fieldErrors: {} };

  const rawMessage = (
    err.response?.data?.detail ||
    err.response?.data?.message ||
    err.data?.detail ||
    err.data?.message ||
    err.data?.title ||
    err.message ||
    ''
  ).toString();

  const isDuplicate =
    err.status === 409 ||
    rawMessage.toLowerCase().includes('unique') ||
    rawMessage.toLowerCase().includes('duplicad') ||
    rawMessage.toLowerCase().includes('ya existe') ||
    rawMessage.toLowerCase().includes('already exists') ||
    rawMessage.toLowerCase().includes('conflict');

  // Procesar errores específicos de campos devueltos por ASP.NET ValidationProblemDetails
  const fieldErrors = {};
  const validationErrors = err.data?.errors || err.response?.data?.errors;
  if (validationErrors && typeof validationErrors === 'object') {
    Object.keys(validationErrors).forEach((key) => {
      const normalizedKey = key.charAt(0).toLowerCase() + key.slice(1);
      const messages = validationErrors[key];
      fieldErrors[normalizedKey] = Array.isArray(messages) ? messages[0] : String(messages);
    });
  }

  let userFriendlyMessage = rawMessage || fallbackMessage;
  if (isDuplicate) {
    const lower = rawMessage.toLowerCase();
    if (lower.includes('cobertura') || lower.includes('profesionalestudio') || lower.includes('obrasocial')) {
      userFriendlyMessage = 'La relación entre el estudio y alguna de las obras sociales ya está configurada o entra en conflicto.';
    } else if (lower.includes('dni') || lower.includes('paciente')) {
      userFriendlyMessage = 'El paciente con ese DNI ya se encuentra registrado en el sistema.';
    } else if (lower.includes('agenda')) {
      userFriendlyMessage = 'Ya existe una agenda horaria superpuesta para este profesional en la fecha y horario seleccionados.';
    } else if (lower.includes('cuil') || lower.includes('profesional') || lower.includes('medico')) {
      userFriendlyMessage = 'El profesional con ese CUIL ya se encuentra registrado o asignado.';
    } else if (lower.includes('cuit') || lower.includes('consultorio') || lower.includes('sede')) {
      userFriendlyMessage = 'Ya existe un consultorio o sede registrada con ese CUIT.';
    } else {
      userFriendlyMessage = 'El registro ya existe en el sistema o entra en conflicto con un dato existente.';
    }
  }

  return {
    message: userFriendlyMessage,
    isDuplicate,
    fieldErrors,
    status: err.status || null,
  };
};

/**
 * Validador Asíncrono de Duplicados en Parametrización de Cobertura (RN-02)
 * Comprueba antes del envío si el estudio ya está asignado al profesional y si se trata
 * de una edición legítima o de un intento de inserción redundante.
 */
export const validateStudyCoverageAssignment = (
  firstArg = {},
  selectedEstudioId = null,
  selectedObrasSocialesIds = [],
  doctorStudies = []
) => {
  let studies = doctorStudies;
  let estudioId = selectedEstudioId;
  let osIds = selectedObrasSocialesIds;

  // Si se invocó con options object { doctorStudies, selectedEstudioId, selectedObrasSocialesIds }
  if (typeof firstArg === 'object' && firstArg !== null && !Array.isArray(firstArg)) {
    if (firstArg.doctorStudies !== undefined || firstArg.selectedEstudioId !== undefined) {
      studies = firstArg.doctorStudies || [];
      estudioId = firstArg.selectedEstudioId;
      osIds = firstArg.selectedObrasSocialesIds || [];
    }
  } else if (typeof firstArg === 'string' || typeof firstArg === 'number') {
    // Si se invocó como (cuil, estudioId, osIds, studies)
    estudioId = selectedEstudioId;
    osIds = selectedObrasSocialesIds || [];
    studies = doctorStudies || [];
  }

  const estudioIdNum = Number(estudioId);
  const existingMapping = studies.find((pe) => pe.estudioId === estudioIdNum);

  // Deduplicación en memoria de IDs de obras sociales para evitar choque de índices en EF Core
  const uniqueObrasSocialesIds = Array.from(new Set((osIds || []).map(Number)));

  return {
    isAlreadyAssigned: Boolean(existingMapping),
    isUpdate: Boolean(existingMapping),
    existingMapping,
    sanitizedObrasSocialesIds: uniqueObrasSocialesIds,
    deduplicatedObrasSociales: uniqueObrasSocialesIds,
    hasDuplicatesInSelection: uniqueObrasSocialesIds.length !== (osIds || []).length,
    warning: existingMapping
      ? 'El estudio ya se encuentra asignado a este profesional. Los datos serán actualizados.'
      : null,
  };
};
