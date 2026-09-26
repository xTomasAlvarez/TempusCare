import {
  patientRegistrationSchema,
  walkInPatientSchema,
  profesionalSchema,
  asistenteSchema,
  institutionSchema,
  consultorioSchema,
  coverageParameterizationSchema,
  agendaSchema,
} from '../src/shared/validation/schemas.js';
import {
  validateWithSchema,
  parseBackendError,
  validateStudyCoverageAssignment,
} from '../src/shared/validation/validateForm.js';

console.log('--- START VALIDATION LAYER TESTS ---');

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failed++;
  }
}

// 1. Patient Registration Schema
const badPatient = validateWithSchema(patientRegistrationSchema, {
  nombre: 'Juan123',
  apellido: 'Perez',
  dni: '1234a',
  email: 'not-an-email',
  contrasena: '123',
});
assert(!badPatient.isValid, 'Patient registration rejects invalid name, dni, email, short password');
assert(badPatient.errors.nombre, 'Detects invalid characters in nombre');
assert(badPatient.errors.dni, 'Detects non-numeric DNI');
assert(badPatient.errors.email, 'Detects invalid email');
assert(badPatient.errors.contrasena, 'Detects weak password');

const goodPatient = validateWithSchema(patientRegistrationSchema, {
  nombre: 'Juan Carlos',
  apellido: 'Pérez Gómez',
  dni: '38123456',
  email: 'juancarlos@test.com',
  contrasena: 'Password123',
});
assert(goodPatient.isValid, 'Patient registration accepts valid data');

// 2. Walk-in Patient Schema
const badWalkIn = validateWithSchema(walkInPatientSchema, {
  dni: '999',
  nombre: '',
  apellido: '',
  telefono: 'abc',
});
assert(!badWalkIn.isValid, 'Walk-in rejects short DNI and empty names');

const goodWalkIn = validateWithSchema(walkInPatientSchema, {
  dni: '40998877',
  nombre: 'Marta',
  apellido: 'Diaz',
  telefono: '3815998877',
});
assert(goodWalkIn.isValid, 'Walk-in accepts valid walk-in patient');

// 3. Profesional Schema
const badProf = validateWithSchema(profesionalSchema, {
  cuil: '2012345678', // 10 digits
  nombre: 'Dr1',
  apellido: 'House',
  matricula: '1',
  telefono: '12',
  genero: 'X',
  fecNac: '',
});
assert(!badProf.isValid, 'Profesional rejects non-11 CUIL, short matricula, invalid gender');

const goodProf = validateWithSchema(profesionalSchema, {
  cuil: '20-30123456-7',
  nombre: 'Gregory',
  apellido: 'House',
  matricula: 'MP-8831',
  telefono: '381-4556677',
  genero: 'M',
  fecNac: '1975-06-11',
});
assert(goodProf.isValid, 'Profesional sanitizes and accepts valid CUIL with hyphens');
assert(goodProf.data.cuil === '20301234567', 'CUIL is stripped of formatting hyphens');

// 4. Institution & Consultorio Schema
const badInst = validateWithSchema(institutionSchema, {
  cuit: '123',
  nombre: 'A',
  email: 'bad',
  plan: 'UnknownPlan',
});
assert(!badInst.isValid, 'Institution rejects invalid CUIT, short name, invalid plan');

const goodInst = validateWithSchema(institutionSchema, {
  cuit: '30-71122334-9',
  nombre: 'Sanatorio Mitre S.A.',
  email: 'info@mitre.com',
  plan: 'Enterprise',
});
assert(goodInst.isValid, 'Institution accepts valid CUIT, valid email, enterprise plan');
assert(goodInst.data.cuit === '30711223349', 'Sanitizes CUIT correctly');

// 5. Critical Form: Coverage Parameterization (RN-02)
const badCoverage = validateWithSchema(coverageParameterizationSchema, {
  profesionalCuil: '123',
  estudioId: 0,
  duracionTurno: 13, // not multiple of 5
  precioParticular: -500,
  obrasSocialesAceptadasIds: [1, 2, 2, 3, 1],
});
assert(!badCoverage.isValid, 'Coverage rejects invalid study, non-multiple duration, negative price');

const goodCoverage = validateWithSchema(coverageParameterizationSchema, {
  profesionalCuil: '20301234567',
  estudioId: '5',
  duracionTurno: 30,
  precioParticular: 15000,
  obrasSocialesAceptadasIds: [1, 2, 2, 3, 1],
});
assert(goodCoverage.isValid, 'Coverage accepts valid parameters');
assert(goodCoverage.data.obrasSocialesAceptadasIds.length === 3, 'Coverage deduplicates insurance IDs array');

// 6. Pre-flight and Deduplication Check
const preflight = validateStudyCoverageAssignment(
  '20301234567',
  5,
  [1, 2, 2, 3],
  [{ estudioId: 5, estudioNombre: 'Ecografía' }]
);
assert(preflight.isUpdate === true, 'Pre-flight detects already assigned study for the doctor');
assert(preflight.deduplicatedObrasSociales.length === 3, 'Pre-flight deduplicates IDs');

// 7. Agenda Schema
const pastDateAgenda = validateWithSchema(agendaSchema, {
  profesionalCuil: '20301234567',
  cuitConsultorio: '30711223349',
  fecha: '2020-01-01',
  horaEntrada: '09:00',
  horaSalida: '08:00',
  duracionTurnoMinutos: 30,
});
assert(!pastDateAgenda.isValid, 'Agenda rejects past dates and horaSalida earlier than horaEntrada');

const goodAgenda = validateWithSchema(agendaSchema, {
  profesionalCuil: '20301234567',
  cuitConsultorio: '30711223349',
  fecha: '2026-10-15',
  horaEntrada: '08:00',
  horaSalida: '12:00',
  duracionTurnoMinutos: 30,
});
assert(goodAgenda.isValid, 'Agenda accepts valid future agenda');

// 8. Backend Error Parser
const conflictErr = {
  response: {
    status: 409,
    data: { message: 'El usuario ya existe con este DNI.' },
  },
};
const parsedConflict = parseBackendError(conflictErr);
assert(parsedConflict.isDuplicate === true, 'Parser detects 409 conflict');
assert(parsedConflict.message.includes('DNI'), 'Parser extracts conflict message');

const sqliteUniqueErr = {
  message: 'SQLite Error: UNIQUE constraint failed: Coberturas.ProfesionalEstudioId, Coberturas.ObraSocialId',
};
const parsedSqlite = parseBackendError(sqliteUniqueErr);
assert(parsedSqlite.isDuplicate === true, 'Parser detects SQLite UNIQUE constraint');
assert(
  parsedSqlite.message.includes('obras sociales') || parsedSqlite.message.includes('configurada'),
  'Parser returns user-friendly duplication message for cobertura'
);

console.log(`\nTests finished: ${passed} passed, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);
