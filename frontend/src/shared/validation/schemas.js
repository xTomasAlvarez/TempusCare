import { z } from 'zod';

/**
 * Expresiones regulares comunes para sanitización y validación estricta en Argentina
 */
export const REGEX = {
  DNI: /^\d{7,9}$/,
  CUIT_CUIL: /^\d{11}$/,
  TELEFONO: /^[0-9+\s-]{6,20}$/,
  SOLO_LETRAS: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/,
  HORA_HH_MM: /^([01]\d|2[0-3]):[0-5]\d$/,
};

/**
 * 1. Esquema de Registro de Pacientes (B2C)
 */
export const patientRegistrationSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(50, 'El nombre no puede superar los 50 caracteres')
      .regex(REGEX.SOLO_LETRAS, 'El nombre solo debe contener letras'),
    apellido: z
      .string()
      .trim()
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(50, 'El apellido no puede superar los 50 caracteres')
      .regex(REGEX.SOLO_LETRAS, 'El apellido solo debe contener letras'),
    dni: z
      .string()
      .trim()
      .transform((val) => val.replace(/\D/g, ''))
      .refine((val) => REGEX.DNI.test(val), {
        message: 'El DNI debe contener solo números (entre 7 y 9 dígitos)',
      }),
    email: z
      .string()
      .trim()
      .email('Ingresa un correo electrónico con formato válido')
      .max(100, 'El correo no puede superar los 100 caracteres'),
    contrasena: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .regex(/[a-zA-Z]/, 'La contraseña debe contener al menos una letra')
      .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
    confirmarContrasena: z
      .string()
      .min(1, 'Debes confirmar tu contraseña'),
    obraSocialId: z
      .union([z.string(), z.number()])
      .optional()
      .nullable()
      .transform((val) => (val ? Number(val) : null)),
  })
  .refine((data) => data.contrasena === data.confirmarContrasena, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarContrasena'],
  });

/**
 * 2. Esquema de Inicio de Sesión
 */
export const loginSchema = z.object({
  usuario: z
    .string()
    .trim()
    .min(3, 'Ingresa tu usuario, CUIL o correo electrónico'),
  contra: z
    .string()
    .min(1, 'Ingresa tu contraseña'),
});

/**
 * 3. Esquema de Paciente Presencial (Walk-in en Recepción)
 */
export const walkInPatientSchema = z.object({
  dni: z
    .string()
    .trim()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => REGEX.DNI.test(val), {
      message: 'El DNI debe tener entre 7 y 9 dígitos numéricos',
    }),
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede superar los 50 caracteres')
    .regex(REGEX.SOLO_LETRAS, 'El nombre solo debe contener letras'),
  apellido: z
    .string()
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede superar los 50 caracteres')
    .regex(REGEX.SOLO_LETRAS, 'El apellido solo debe contener letras'),
  telefono: z
    .string()
    .trim()
    .min(6, 'El teléfono es obligatorio para contactar al paciente')
    .regex(REGEX.TELEFONO, 'Ingresa un formato de teléfono válido'),
  email: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Ingresa un correo electrónico válido o déjalo vacío',
    }),
  obraSocialId: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((val) => (val ? Number(val) : null)),
  numeroAfiliado: z
    .string()
    .trim()
    .max(50, 'El número de afiliado es demasiado largo')
    .optional()
    .nullable(),
});

/**
 * 4. Esquema de Alta de Médico / Profesional Sanitario
 */
export const profesionalSchema = z.object({
  cuil: z
    .string()
    .trim()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => REGEX.CUIT_CUIL.test(val), {
      message: 'El CUIL debe contener exactamente 11 dígitos numéricos sin guiones',
    }),
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede superar los 50 caracteres')
    .regex(REGEX.SOLO_LETRAS, 'El nombre solo debe contener letras'),
  apellido: z
    .string()
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede superar los 50 caracteres')
    .regex(REGEX.SOLO_LETRAS, 'El apellido solo debe contener letras'),
  matricula: z
    .string()
    .trim()
    .min(3, 'La matrícula profesional debe tener al menos 3 caracteres')
    .max(30, 'La matrícula no puede superar los 30 caracteres'),
  telefono: z
    .string()
    .trim()
    .min(6, 'El teléfono de contacto es obligatorio')
    .regex(REGEX.TELEFONO, 'Ingresa un formato de teléfono válido'),
  genero: z
    .enum(['M', 'F', 'Otro'], {
      errorMap: () => ({ message: 'Selecciona una opción de género válida' }),
    }),
  fecNac: z
    .string()
    .min(1, 'La fecha de nacimiento es obligatoria'),
});

/**
 * 5. Esquema de Alta de Asistente / Secretario Operativo
 */
export const asistenteSchema = z.object({
  cuil: z
    .string()
    .trim()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => REGEX.CUIT_CUIL.test(val), {
      message: 'El CUIL debe contener exactamente 11 dígitos numéricos',
    }),
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre es obligatorio (al menos 2 caracteres)')
    .regex(REGEX.SOLO_LETRAS, 'El nombre solo debe contener letras'),
  apellido: z
    .string()
    .trim()
    .min(2, 'El apellido es obligatorio (al menos 2 caracteres)')
    .regex(REGEX.SOLO_LETRAS, 'El apellido solo debe contener letras'),
  telefono: z
    .string()
    .trim()
    .min(6, 'El teléfono es obligatorio')
    .regex(REGEX.TELEFONO, 'Ingresa un número de teléfono válido'),
  genero: z.enum(['M', 'F', 'Otro']),
  fecNac: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  institucionId: z.union([z.string(), z.number()]).optional().nullable(),
  consultorioCuit: z.string().optional().nullable(),
  adminConsultorioCuil: z.string().optional().nullable(),
  calle: z.string().trim().optional(),
  nro: z.string().trim().optional(),
  localidad: z.string().trim().optional(),
});

/**
 * 6. Esquema de Alta de Institución Médica Cliente B2B (Vitality)
 */
export const institutionSchema = z.object({
  cuit: z
    .string()
    .trim()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => REGEX.CUIT_CUIL.test(val), {
      message: 'El CUIT institucional debe contener exactamente 11 dígitos numéricos',
    }),
  nombre: z
    .string()
    .trim()
    .min(3, 'La razón social debe tener al menos 3 caracteres')
    .max(100, 'La razón social no puede exceder 100 caracteres'),
  email: z
    .string()
    .trim()
    .email('Ingresa un correo electrónico con formato válido'),
  plan: z
    .enum(['Starter', 'Profesional', 'Enterprise'], {
      errorMap: () => ({ message: 'Selecciona un plan de suscripción válido' }),
    }),
});

/**
 * 7. Esquema de Creación de Sede Física / Consultorio
 */
export const consultorioSchema = z.object({
  cuit: z
    .string()
    .trim()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => REGEX.CUIT_CUIL.test(val), {
      message: 'El CUIT de la sede debe tener exactamente 11 dígitos numéricos',
    }),
  nombre: z
    .string()
    .trim()
    .min(3, 'El nombre de la sede debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  email: z
    .string()
    .trim()
    .email('Ingresa un correo institucional válido'),
  telefono: z
    .string()
    .trim()
    .min(6, 'El teléfono de contacto es obligatorio')
    .regex(REGEX.TELEFONO, 'Formato de teléfono inválido'),
  nivelAccesibilidad: z.enum(['Total', 'Media', 'Básica', 'Especializada']),
  calle: z
    .string()
    .trim()
    .min(2, 'La calle es obligatoria'),
  nro: z
    .string()
    .trim()
    .min(1, 'El número es obligatorio'),
  depto: z.string().trim().optional(),
  localidad: z.string().trim().min(2, 'La localidad es obligatoria'),
  provincia: z.string().trim().optional(),
  codPostal: z.string().trim().optional(),
  institucionId: z.union([z.string(), z.number()]).optional().nullable(),
  adminConsultorio: z
    .object({
      cuil: z
        .string()
        .trim()
        .transform((val) => val.replace(/\D/g, ''))
        .refine((val) => !val || REGEX.CUIT_CUIL.test(val), {
          message: 'El CUIL del responsable debe tener 11 dígitos numéricos',
        })
        .optional()
        .nullable(),
      nombre: z.string().trim().optional(),
      apellido: z.string().trim().optional(),
      telefono: z.string().trim().optional(),
      mail: z
        .string()
        .trim()
        .optional()
        .nullable()
        .refine((val) => !val || z.string().email().safeParse(val).success, {
          message: 'El email del administrador debe ser válido',
        }),
    })
    .optional()
    .nullable(),
});

/**
 * 8. Esquema Crítico de Parametrización de Cobertura y Estudios (RN-02)
 */
export const coverageParameterizationSchema = z.object({
  profesionalCuil: z
    .string()
    .trim()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => REGEX.CUIT_CUIL.test(val), {
      message: 'Debes seleccionar un profesional médico con CUIL válido de 11 dígitos',
    }),
  estudioId: z
    .union([z.string(), z.number()])
    .refine((val) => Boolean(val && Number(val) > 0), {
      message: 'Debes seleccionar un estudio médico válido del catálogo',
    })
    .transform((val) => Number(val)),
  duracionTurno: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 5 && val <= 240, {
      message: 'La duración del turno debe ser de entre 5 y 240 minutos',
    })
    .refine((val) => val % 5 === 0, {
      message: 'La duración del turno debe ser múltiplo de 5 minutos',
    }),
  precioParticular: z
    .union([z.string(), z.number()])
    .transform((val) => (val === '' || val === null || val === undefined ? 0 : Number(val)))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: 'El precio particular no puede ser negativo',
    })
    .refine((val) => val <= 10000000, {
      message: 'El arancel excede el límite operativo permitido',
    }),
  obrasSocialesAceptadasIds: z
    .array(z.number())
    .transform((arr) => Array.from(new Set(arr))), // Deduplicación estricta para evitar errores en EF Core
});

/**
 * 9. Esquema de Creación de Agenda Horaria
 */
export const agendaSchema = z
  .object({
    profesionalCuil: z
      .string()
      .trim()
      .transform((val) => val.replace(/\D/g, ''))
      .refine((val) => REGEX.CUIT_CUIL.test(val), {
        message: 'Debes seleccionar un profesional médico con CUIL de 11 dígitos',
      }),
    cuitConsultorio: z
      .string()
      .trim()
      .transform((val) => val.replace(/\D/g, ''))
      .refine((val) => REGEX.CUIT_CUIL.test(val), {
        message: 'Debes seleccionar un consultorio con CUIT de 11 dígitos',
      }),
    fecha: z
      .string()
      .min(1, 'Debes seleccionar una fecha de atención válida')
      .refine((val) => {
        const selected = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selected >= today;
      }, {
        message: 'La fecha de la agenda no puede ser anterior a hoy',
      }),
    horaEntrada: z
      .string()
      .regex(REGEX.HORA_HH_MM, 'Formato de hora de inicio inválido (HH:MM)'),
    horaSalida: z
      .string()
      .regex(REGEX.HORA_HH_MM, 'Formato de hora de fin inválido (HH:MM)'),
    duracionTurnoMinutos: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .refine((val) => [15, 20, 30, 45, 60, 90].includes(val), {
        message: 'Selecciona una duración válida de slot (15, 20, 30, 45, 60 o 90 minutos)',
      }),
  })
  .refine(
    (data) => {
      const [hEntrada, mEntrada] = data.horaEntrada.split(':').map(Number);
      const [hSalida, mSalida] = data.horaSalida.split(':').map(Number);
      const minsTotales = hSalida * 60 + mSalida - (hEntrada * 60 + mEntrada);
      return minsTotales >= data.duracionTurnoMinutos;
    },
    {
      message: 'La hora de fin debe ser posterior a la de inicio por al menos la duración de un turno',
      path: ['horaSalida'],
    }
  );

/**
 * 11. Esquema de Modificación de Institución Médica Cliente B2B (Vitality)
 */
export const updateInstitutionSchema = z.object({
  id: z.coerce.number().int().positive('ID de institución inválido'),
  nombre: z
    .string()
    .trim()
    .min(3, 'La razón social debe tener al menos 3 caracteres')
    .max(100, 'La razón social no puede exceder 100 caracteres'),
  cuit: z
    .string()
    .trim()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => REGEX.CUIT_CUIL.test(val), {
      message: 'El CUIT institucional debe contener exactamente 11 dígitos numéricos',
    }),
  email: z
    .string()
    .trim()
    .email('Ingresa un correo electrónico con formato válido'),
  plan: z.enum(['Starter', 'Profesional', 'Enterprise'], {
    errorMap: () => ({ message: 'Selecciona un plan de suscripción válido' }),
  }),
});

/**
 * 12. Esquema de ABM de Especialidades Médicas
 */
export const specialtySchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, 'El nombre de la especialidad debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z
    .string()
    .trim()
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(250, 'La descripción no puede exceder 250 caracteres'),
});

/**
 * 13. Esquema de ABM de Estudios Médicos con Duración Obligatoria
 */
export const studySchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, 'El nombre del estudio debe tener al menos 3 caracteres')
    .max(120, 'El nombre no puede exceder 120 caracteres'),
  descripcion: z
    .string()
    .trim()
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(300, 'La descripción no puede exceder 300 caracteres'),
  duracion: z
    .coerce
    .number({ invalid_type_error: 'La duración en minutos es obligatoria' })
    .int('La duración debe ser un número entero')
    .min(5, 'La duración mínima es de 5 minutos')
    .max(240, 'La duración máxima es de 240 minutos'),
  preparacion: z
    .string()
    .trim()
    .max(300, 'La indicación de preparación no puede exceder 300 caracteres')
    .optional()
    .default(''),
  especialidadId: z
    .coerce
    .number({ invalid_type_error: 'Debes asociar una especialidad' })
    .int()
    .positive('Debes asociar una especialidad médica válida'),
});

/**
 * 14. Esquema de ABM Global de Obras Sociales y Prepagas
 */
export const insuranceSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre de la obra social debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  catalogo: z
    .string()
    .trim()
    .min(3, 'El detalle de cobertura o catálogo debe tener al menos 3 caracteres')
    .max(250, 'El catálogo no puede exceder 250 caracteres'),
});

