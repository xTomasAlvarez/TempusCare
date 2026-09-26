using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Infrastructure.Data;

public static class DbInitializer
{
    public static void Initialize(TempusCareDbContext db)
    {
        // 0. Tabla SolicitudesSuperAdmin para flujo de consenso de Super Admins
        db.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS ""SolicitudesSuperAdmin"" (
                ""Id"" INTEGER NOT NULL CONSTRAINT ""PK_SolicitudesSuperAdmin"" PRIMARY KEY AUTOINCREMENT,
                ""EmailPropuesto"" TEXT NOT NULL,
                ""ProponenteId"" INTEGER NOT NULL,
                ""AprobadorId"" INTEGER NULL,
                ""Estado"" TEXT NOT NULL,
                ""FechaCreacion"" TEXT NOT NULL,
                ""FechaResolucion"" TEXT NULL
            );
        ");

        // 1. Usuarios Base (SuperAdmin, Instituciones, Paciente, Asistente)
        var uAdmin1 = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == "admin@vitality.com");
        if (uAdmin1 == null)
        {
            uAdmin1 = new Usuario
            {
                NombreUsuario = "admin@vitality.com",
                Contrasena = "Admin123!",
                Mail = "admin@vitality.com",
                Rol = RolUsuario.SuperAdmin
            };
            db.Usuarios.Add(uAdmin1);
            db.SaveChanges();
        }

        var uAdmin2 = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == "admin2@vitality.com");
        if (uAdmin2 == null)
        {
            uAdmin2 = new Usuario
            {
                NombreUsuario = "admin2@vitality.com",
                Contrasena = "Admin123!",
                Mail = "admin2@vitality.com",
                Rol = RolUsuario.SuperAdmin
            };
            db.Usuarios.Add(uAdmin2);
            db.SaveChanges();
        }

        // Sembrado inicial de solicitud pendiente para verificar el flujo de consenso
        if (!db.SolicitudesSuperAdmin.Any())
        {
            db.SolicitudesSuperAdmin.Add(new SolicitudSuperAdmin
            {
                EmailPropuesto = "seguridad@vitality.com",
                ProponenteId = uAdmin1.Id,
                Estado = "Pendiente",
                FechaCreacion = DateTime.UtcNow.AddHours(-3)
            });
            db.SaveChanges();
        }

        var uInst1 = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == "30111222334");
        if (uInst1 == null)
        {
            uInst1 = new Usuario { NombreUsuario = "30111222334", Contrasena = "Institucion123!", Mail = "contacto@sanatoriotucuman.com", Rol = RolUsuario.Institucion };
            db.Usuarios.Add(uInst1);
            db.SaveChanges();
        }

        var uInst2 = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == "30555666778");
        if (uInst2 == null)
        {
            uInst2 = new Usuario { NombreUsuario = "30555666778", Contrasena = "Institucion123!", Mail = "info@clinicamayo.com", Rol = RolUsuario.Institucion };
            db.Usuarios.Add(uInst2);
            db.SaveChanges();
        }

        var uPac = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == "27000000001");
        if (uPac == null)
        {
            uPac = new Usuario { NombreUsuario = "27000000001", Contrasena = "Paciente123!", Mail = "paciente@tempuscare.com", Rol = RolUsuario.Paciente };
            db.Usuarios.Add(uPac);
            db.SaveChanges();
        }

        var uAsis = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == "27111111111");
        if (uAsis == null)
        {
            uAsis = new Usuario { NombreUsuario = "27111111111", Contrasena = "Asistente123!", Mail = "asistente@tempuscare.com", Rol = RolUsuario.Asistente };
            db.Usuarios.Add(uAsis);
            db.SaveChanges();
        }

        // 2. Instituciones
        var inst1 = db.Instituciones.FirstOrDefault(i => i.Cuit == "30111222334");
        if (inst1 == null)
        {
            inst1 = new Institucion { UsuarioId = uInst1.Id, Nombre = "Sanatorio Tucumán", Cuit = "30111222334", Email = "contacto@sanatoriotucuman.com", Plan = "Enterprise" };
            db.Instituciones.Add(inst1);
            db.SaveChanges();
        }

        var inst2 = db.Instituciones.FirstOrDefault(i => i.Cuit == "30555666778");
        if (inst2 == null)
        {
            inst2 = new Institucion { UsuarioId = uInst2.Id, Nombre = "Clínica Mayo", Cuit = "30555666778", Email = "info@clinicamayo.com", Plan = "Profesional" };
            db.Instituciones.Add(inst2);
            db.SaveChanges();
        }

        // 3. Paciente
        var pac = db.Pacientes.FirstOrDefault(p => p.Cuil == "27000000001");
        if (pac == null)
        {
            pac = new Paciente { Cuil = "27000000001", UsuarioId = uPac.Id, Nombre = "Ana", Apellido = "García", FechaNacimiento = new DateTime(1995, 5, 20), Telefono = "3815001122", Genero = "F" };
            db.Pacientes.Add(pac);
            db.SaveChanges();
        }

        // 4. Asistente
        var asis = db.Asistentes.FirstOrDefault(a => a.Cuil == "27111111111");
        if (asis == null)
        {
            asis = new Asistente { Cuil = "27111111111", UsuarioId = uAsis.Id, Nombre = "Lucía", Apellido = "Fernández", Telefono = "3817005566", Genero = "F", FechaNacimiento = new DateTime(1992, 3, 10), InstitucionId = inst1.Id };
            db.Asistentes.Add(asis);
            db.SaveChanges();
        }

        // 5. Obras Sociales
        var obrasSocialesData = new[]
        {
            new { Nombre = "Subsidio de Salud", Catalogo = "Cobertura provincial Tucumán" },
            new { Nombre = "OSDE", Catalogo = "Prepaga nacional" },
            new { Nombre = "Swiss Medical", Catalogo = "Prepaga nacional" },
            new { Nombre = "PAMI", Catalogo = "Jubilados y pensionados" }
        };

        foreach (var os in obrasSocialesData)
        {
            if (!db.ObrasSociales.Any(o => o.Nombre == os.Nombre))
            {
                db.ObrasSociales.Add(new ObraSocial { Nombre = os.Nombre, Catalogo = os.Catalogo });
            }
        }
        db.SaveChanges();

        // Asignar Obra Social OSDE al paciente de prueba Ana García (RN-02 / Cobertura)
        var osde = db.ObrasSociales.FirstOrDefault(o => o.Nombre == "OSDE");
        if (osde != null && !db.PacienteObrasSociales.Any(pos => pos.PacienteCuil == "27000000001" && pos.ObraSocialId == osde.Id))
        {
            db.PacienteObrasSociales.Add(new PacienteObraSocial { PacienteCuil = "27000000001", ObraSocialId = osde.Id });
            db.SaveChanges();
        }

        // 6. Consultorios y Sedes Físicas en San Miguel de Tucumán
        var consultoriosData = new[]
        {
            new
            {
                Cuit = "30111222331",
                Nombre = "Consultorio 101 - Cardiología",
                Email = "cardio101@sanatoriotucuman.com",
                Telefono = "3814123456",
                NivelAccesibilidad = "Total",
                InstitucionId = inst1.Id,
                Calle = "San Martín",
                Nro = "750",
                Localidad = "San Miguel de Tucumán",
                Provincia = "Tucumán",
                CodPostal = "4000",
                Latitud = -26.830215,
                Longitud = -65.203842
            },
            new
            {
                Cuit = "30111222332",
                Nombre = "Consultorio 102 - Pediatría",
                Email = "pediatria102@sanatoriotucuman.com",
                Telefono = "3814654321",
                NivelAccesibilidad = "Media",
                InstitucionId = inst1.Id,
                Calle = "Santiago del Estero",
                Nro = "650",
                Localidad = "San Miguel de Tucumán",
                Provincia = "Tucumán",
                CodPostal = "4000",
                Latitud = -26.820542,
                Longitud = -65.202418
            },
            new
            {
                Cuit = "30555666771",
                Nombre = "Consultorio 201 - Traumatología",
                Email = "trauma201@clinicamayo.com",
                Telefono = "3814987654",
                NivelAccesibilidad = "Total",
                InstitucionId = inst2.Id,
                Calle = "9 de Julio",
                Nro = "156",
                Localidad = "San Miguel de Tucumán",
                Provincia = "Tucumán",
                CodPostal = "4000",
                Latitud = -26.832248,
                Longitud = -65.204561
            },
            new
            {
                Cuit = "30555666772",
                Nombre = "Consultorio 202 - Diagnóstico por Imágenes",
                Email = "imagenes202@clinicamayo.com",
                Telefono = "3814876543",
                NivelAccesibilidad = "Total",
                InstitucionId = inst2.Id,
                Calle = "25 de Mayo",
                Nro = "420",
                Localidad = "San Miguel de Tucumán",
                Provincia = "Tucumán",
                CodPostal = "4000",
                Latitud = -26.826034,
                Longitud = -65.204015
            }
        };

        foreach (var cd in consultoriosData)
        {
            var cons = db.Consultorios.Include(c => c.Direccion).FirstOrDefault(c => c.Cuit == cd.Cuit);
            if (cons == null)
            {
                var dir = new Direccion
                {
                    Calle = cd.Calle,
                    Nro = cd.Nro,
                    Localidad = cd.Localidad,
                    Provincia = cd.Provincia,
                    CodPostal = cd.CodPostal
                };
                db.Direcciones.Add(dir);
                db.SaveChanges();

                cons = new Consultorio
                {
                    Cuit = cd.Cuit,
                    Nombre = cd.Nombre,
                    Email = cd.Email,
                    Telefono = cd.Telefono,
                    NivelAccesibilidad = cd.NivelAccesibilidad,
                    InstitucionId = cd.InstitucionId,
                    DireccionId = dir.Id,
                    Latitud = cd.Latitud,
                    Longitud = cd.Longitud
                };
                db.Consultorios.Add(cons);
                db.SaveChanges();
            }
            else
            {
                cons.Latitud = cd.Latitud;
                cons.Longitud = cd.Longitud;
                cons.Nombre = cd.Nombre;
                cons.InstitucionId = cd.InstitucionId;
                if (cons.Direccion != null)
                {
                    cons.Direccion.Calle = cd.Calle;
                    cons.Direccion.Nro = cd.Nro;
                    cons.Direccion.Localidad = cd.Localidad;
                    cons.Direccion.Provincia = cd.Provincia;
                }
                db.SaveChanges();
            }
        }

        // 7. Especialidades Médicas Registradas
        var especialidadesData = new[]
        {
            new { Nombre = "Pediatría", Descripcion = "Atención médica integral a niños y adolescentes" },
            new { Nombre = "Cardiología", Descripcion = "Prevención, diagnóstico y tratamiento cardiovascular" },
            new { Nombre = "Dermatología", Descripcion = "Salud, prevención y cuidado clínico de la piel" },
            new { Nombre = "Traumatología", Descripcion = "Sistema osteoarticular, lesiones y rehabilitación" },
            new { Nombre = "Diagnóstico por Imágenes", Descripcion = "Ecografías, Doppler, resonancias y estudios avanzados" }
        };

        foreach (var esp in especialidadesData)
        {
            if (!db.Especialidades.Any(e => e.Nombre == esp.Nombre))
            {
                db.Especialidades.Add(new Especialidad { Nombre = esp.Nombre, Descripcion = esp.Descripcion });
            }
        }
        db.SaveChanges();

        // 8. Estudios Específicos por Especialidad
        var espPed = db.Especialidades.First(e => e.Nombre == "Pediatría");
        var espCard = db.Especialidades.First(e => e.Nombre == "Cardiología");
        var espDerm = db.Especialidades.First(e => e.Nombre == "Dermatología");
        var espTraum = db.Especialidades.First(e => e.Nombre == "Traumatología");
        var espImag = db.Especialidades.First(e => e.Nombre == "Diagnóstico por Imágenes");

        var estudiosData = new[]
        {
            // Diagnóstico por Imágenes
            new { Nombre = "Doppler fetal", Descripcion = "Evaluación del flujo sanguíneo feto-placentario", Duracion = 40, Preparacion = "Tener vejiga semillena, traer ecografías previas", EspecialidadId = espImag.Id },
            new { Nombre = "Ecografía ginecológica", Descripcion = "Evaluación morfológica del aparato genital femenino", Duracion = 30, Preparacion = "Vejiga vacía", EspecialidadId = espImag.Id },
            new { Nombre = "Ecografía de tiroides", Descripcion = "Estudio ecográfico de glándula tiroidea y ganglios cervicales", Duracion = 25, Preparacion = "Cuello descubierto, sin cadenas ni alhajas", EspecialidadId = espImag.Id },
            new { Nombre = "Ecografía Abdominal", Descripcion = "Ultrasonido de hígado, vesícula, páncreas y bazo", Duracion = 30, Preparacion = "Ayuno de 6 horas", EspecialidadId = espImag.Id },
            new { Nombre = "Resonancia Magnética", Descripcion = "Resonancia de alta resolución multiparamétrica", Duracion = 60, Preparacion = "Sin objetos metálicos ni marcapasos", EspecialidadId = espImag.Id },
            new { Nombre = "Doppler Mamario", Descripcion = "Ecografía mamaria bilateral con mapeo de flujo color", Duracion = 30, Preparacion = "Sin desodorante, talco ni cremas", EspecialidadId = espImag.Id },

            // Cardiología
            new { Nombre = "Electrocardiograma", Descripcion = "Registro gráfico de la actividad eléctrica cardíaca", Duracion = 20, Preparacion = "Reposo previo de 5 minutos, torso accesible", EspecialidadId = espCard.Id },
            new { Nombre = "Ergometría Graduada", Descripcion = "Prueba de esfuerzo progresivo en cinta o bicicleta", Duracion = 45, Preparacion = "Ropa deportiva cómoda y calzado deportivo", EspecialidadId = espCard.Id },
            new { Nombre = "Ecocardiograma Doppler", Descripcion = "Ultrasonido transtorácico con análisis Doppler color", Duracion = 30, Preparacion = "Traer electrocardiogramas y estudios previos", EspecialidadId = espCard.Id },
            new { Nombre = "Holter 24 hs", Descripcion = "Monitoreo continuo de ritmo cardíaco por 24 horas", Duracion = 20, Preparacion = "Ropa holgada, no mojarse durante el registro", EspecialidadId = espCard.Id },

            // Pediatría
            new { Nombre = "Control de Crecimiento y Desarrollo", Descripcion = "Evaluación antropométrica y percentiles pediátricos", Duracion = 30, Preparacion = "Traer carnet de vacunas y libreta sanitaria", EspecialidadId = espPed.Id },
            new { Nombre = "Test de Alergias Pediátricas", Descripcion = "Prick test cutáneo de alérgenos comunes para niños", Duracion = 40, Preparacion = "Suspender antihistamínicos 5 días previos", EspecialidadId = espPed.Id },
            new { Nombre = "Oximetría Pediátrica", Descripcion = "Medición no invasiva de saturación y frecuencia respiratoria", Duracion = 20, Preparacion = "Niño tranquilo en brazos del tutor", EspecialidadId = espPed.Id },

            // Traumatología
            new { Nombre = "Infiltración Articular", Descripcion = "Aplicación terapéutica intraarticular guiada", Duracion = 30, Preparacion = "Zona higienizada, reposo relativo post-procedimiento", EspecialidadId = espTraum.Id },
            new { Nombre = "Evaluación Articular Funcional", Descripcion = "Medición biomecánica y rango articular goniométrico", Duracion = 30, Preparacion = "Ropa deportiva holgada", EspecialidadId = espTraum.Id },
            new { Nombre = "Artrocentesis Diagnóstica", Descripcion = "Punción y análisis de líquido sinovial articular", Duracion = 40, Preparacion = "Ayuno de 4 horas", EspecialidadId = espTraum.Id },

            // Dermatología
            new { Nombre = "Dermatoscopia Digital", Descripcion = "Mapeo fotográfico digital de nevus y lesiones pigmentadas", Duracion = 30, Preparacion = "Sin esmalte de uñas ni maquillaje", EspecialidadId = espDerm.Id },
            new { Nombre = "Biopsia Cutánea por Punch", Descripcion = "Toma de muestra tisular cutánea diagnóstica", Duracion = 35, Preparacion = "Informar alergias a anestésicos locales", EspecialidadId = espDerm.Id },
            new { Nombre = "Crioterapia Dermatológica", Descripcion = "Tratamiento térmico ablativo con nitrógeno líquido", Duracion = 25, Preparacion = "Piel limpia sin cremas", EspecialidadId = espDerm.Id }
        };

        foreach (var est in estudiosData)
        {
            var existente = db.Estudios.FirstOrDefault(e => e.Nombre == est.Nombre);
            if (existente == null)
            {
                db.Estudios.Add(new Estudio
                {
                    Nombre = est.Nombre,
                    Descripcion = est.Descripcion,
                    Duracion = est.Duracion,
                    Preparacion = est.Preparacion,
                    EspecialidadId = est.EspecialidadId
                });
            }
            else
            {
                existente.Descripcion = est.Descripcion;
                existente.Duracion = est.Duracion;
                existente.Preparacion = est.Preparacion;
                existente.EspecialidadId = est.EspecialidadId;
            }
        }
        db.SaveChanges();

        // 9. Médicos Profesionales (Mínimo 2 por Especialidad Registrada = 10 Médicos)
        var profesionalesData = new[]
        {
            // CARDIOLOGÍA (2 médicos)
            new
            {
                Cuil = "20123456789",
                Nombre = "Carlos",
                Apellido = "Pérez",
                Matricula = "MP1234",
                Genero = "M",
                Telefono = "3816003344",
                FechaNacimiento = new DateTime(1980, 8, 15),
                EspecialidadNombre = "Cardiología",
                ConsultoriosCuits = new[] { "30111222331", "30111222332" },
                ObrasSocialesNombres = new[] { "Subsidio de Salud", "OSDE", "Swiss Medical" },
                EstudiosNombres = new[] { "Electrocardiograma", "Ergometría Graduada", "Ecocardiograma Doppler" }
            },
            new
            {
                Cuil = "27223344551",
                Nombre = "Valeria",
                Apellido = "Gómez",
                Matricula = "MP5678",
                Genero = "F",
                Telefono = "3816112233",
                FechaNacimiento = new DateTime(1984, 11, 23),
                EspecialidadNombre = "Cardiología",
                ConsultoriosCuits = new[] { "30111222331" },
                ObrasSocialesNombres = new[] { "OSDE", "PAMI", "Subsidio de Salud" },
                EstudiosNombres = new[] { "Electrocardiograma", "Holter 24 hs" }
            },

            // PEDIATRÍA (2 médicos)
            new
            {
                Cuil = "27301112221",
                Nombre = "Sofía",
                Apellido = "Martínez",
                Matricula = "MP4321",
                Genero = "F",
                Telefono = "3816223344",
                FechaNacimiento = new DateTime(1988, 4, 12),
                EspecialidadNombre = "Pediatría",
                ConsultoriosCuits = new[] { "30111222332" },
                ObrasSocialesNombres = new[] { "Subsidio de Salud", "Swiss Medical", "OSDE" },
                EstudiosNombres = new[] { "Control de Crecimiento y Desarrollo", "Test de Alergias Pediátricas" }
            },
            new
            {
                Cuil = "20312223331",
                Nombre = "Martín",
                Apellido = "Benítez",
                Matricula = "MP8765",
                Genero = "M",
                Telefono = "3816334455",
                FechaNacimiento = new DateTime(1982, 9, 30),
                EspecialidadNombre = "Pediatría",
                ConsultoriosCuits = new[] { "30111222332" },
                ObrasSocialesNombres = new[] { "OSDE", "Swiss Medical" },
                EstudiosNombres = new[] { "Control de Crecimiento y Desarrollo", "Oximetría Pediátrica" }
            },

            // TRAUMATOLOGÍA (2 médicos)
            new
            {
                Cuil = "20284445551",
                Nombre = "Fernando",
                Apellido = "Morales",
                Matricula = "MP6543",
                Genero = "M",
                Telefono = "3816445566",
                FechaNacimiento = new DateTime(1979, 3, 19),
                EspecialidadNombre = "Traumatología",
                ConsultoriosCuits = new[] { "30555666771" },
                ObrasSocialesNombres = new[] { "Subsidio de Salud", "OSDE", "PAMI" },
                EstudiosNombres = new[] { "Infiltración Articular", "Evaluación Articular Funcional" }
            },
            new
            {
                Cuil = "27325556661",
                Nombre = "Camila",
                Apellido = "Rossi",
                Matricula = "MP9876",
                Genero = "F",
                Telefono = "3816556677",
                FechaNacimiento = new DateTime(1990, 7, 8),
                EspecialidadNombre = "Traumatología",
                ConsultoriosCuits = new[] { "30555666771" },
                ObrasSocialesNombres = new[] { "Swiss Medical", "OSDE", "Subsidio de Salud" },
                EstudiosNombres = new[] { "Infiltración Articular", "Artrocentesis Diagnóstica" }
            },

            // DERMATOLOGÍA (2 médicos)
            new
            {
                Cuil = "27296667771",
                Nombre = "Mariana",
                Apellido = "López",
                Matricula = "MP3456",
                Genero = "F",
                Telefono = "3816667788",
                FechaNacimiento = new DateTime(1986, 12, 5),
                EspecialidadNombre = "Dermatología",
                ConsultoriosCuits = new[] { "30111222331", "30555666771" },
                ObrasSocialesNombres = new[] { "OSDE", "Swiss Medical", "Subsidio de Salud" },
                EstudiosNombres = new[] { "Dermatoscopia Digital", "Biopsia Cutánea por Punch" }
            },
            new
            {
                Cuil = "20347778881",
                Nombre = "Lucas",
                Apellido = "Navarro",
                Matricula = "MP7890",
                Genero = "M",
                Telefono = "3816778899",
                FechaNacimiento = new DateTime(1983, 2, 17),
                EspecialidadNombre = "Dermatología",
                ConsultoriosCuits = new[] { "30555666771" },
                ObrasSocialesNombres = new[] { "Subsidio de Salud", "PAMI" },
                EstudiosNombres = new[] { "Dermatoscopia Digital", "Crioterapia Dermatológica" }
            },

            // DIAGNÓSTICO POR IMÁGENES (2 médicos)
            new
            {
                Cuil = "20258889991",
                Nombre = "Esteban",
                Apellido = "Vega",
                Matricula = "MP2345",
                Genero = "M",
                Telefono = "3816889900",
                FechaNacimiento = new DateTime(1976, 5, 27),
                EspecialidadNombre = "Diagnóstico por Imágenes",
                ConsultoriosCuits = new[] { "30555666772" },
                ObrasSocialesNombres = new[] { "Subsidio de Salud", "OSDE", "Swiss Medical", "PAMI" },
                EstudiosNombres = new[] { "Doppler fetal", "Ecografía ginecológica", "Ecografía de tiroides", "Ecografía Abdominal" }
            },
            new
            {
                Cuil = "27289990001",
                Nombre = "Gabriela",
                Apellido = "Castro",
                Matricula = "MP6789",
                Genero = "F",
                Telefono = "3816990011",
                FechaNacimiento = new DateTime(1985, 10, 14),
                EspecialidadNombre = "Diagnóstico por Imágenes",
                ConsultoriosCuits = new[] { "30555666772" },
                ObrasSocialesNombres = new[] { "OSDE", "Swiss Medical", "Subsidio de Salud" },
                EstudiosNombres = new[] { "Doppler fetal", "Ecografía ginecológica", "Ecografía de tiroides", "Resonancia Magnética", "Doppler Mamario" }
            }
        };

        var allObrasSociales = db.ObrasSociales.ToList();
        var allEstudios = db.Estudios.ToList();
        var allEspecialidades = db.Especialidades.ToList();

        foreach (var pd in profesionalesData)
        {
            // Usuario del médico
            var uDoctor = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == pd.Cuil);
            if (uDoctor == null)
            {
                uDoctor = new Usuario
                {
                    NombreUsuario = pd.Cuil,
                    Contrasena = "Medico123!",
                    Mail = $"{pd.Nombre.ToLower()}.{pd.Apellido.ToLower()}@tempuscare.com",
                    Rol = RolUsuario.Profesional
                };
                db.Usuarios.Add(uDoctor);
                db.SaveChanges();
            }

            // Entidad Profesional
            var prof = db.Profesionales
                .Include(p => p.Especialidades)
                .Include(p => p.Consultorios)
                .Include(p => p.ObrasSociales)
                .Include(p => p.Estudios).ThenInclude(pe => pe.Coberturas)
                .FirstOrDefault(p => p.Cuil == pd.Cuil);

            if (prof == null)
            {
                prof = new Profesional
                {
                    Cuil = pd.Cuil,
                    UsuarioId = uDoctor.Id,
                    Nombre = pd.Nombre,
                    Apellido = pd.Apellido,
                    Matricula = pd.Matricula,
                    Telefono = pd.Telefono,
                    Genero = pd.Genero,
                    FechaNacimiento = pd.FechaNacimiento,
                    Estado = EstadoProfesional.Activo
                };
                db.Profesionales.Add(prof);
                db.SaveChanges();
            }

            // Especialidad
            var espObj = allEspecialidades.FirstOrDefault(e => e.Nombre == pd.EspecialidadNombre);
            if (espObj != null && !prof.Especialidades.Any(pe => pe.EspecialidadId == espObj.Id))
            {
                prof.Especialidades.Add(new ProfesionalEspecialidad
                {
                    ProfesionalCuil = prof.Cuil,
                    EspecialidadId = espObj.Id
                });
            }

            // Consultorios
            foreach (var cuit in pd.ConsultoriosCuits)
            {
                if (!prof.Consultorios.Any(pc => pc.ConsultorioCuit == cuit))
                {
                    prof.Consultorios.Add(new ProfesionalConsultorio
                    {
                        ProfesionalCuil = prof.Cuil,
                        ConsultorioCuit = cuit
                    });
                }
            }

            // Obras Sociales
            foreach (var osNom in pd.ObrasSocialesNombres)
            {
                var osObj = allObrasSociales.FirstOrDefault(o => o.Nombre == osNom);
                if (osObj != null && !prof.ObrasSociales.Any(po => po.ObraSocialId == osObj.Id))
                {
                    prof.ObrasSociales.Add(new ProfesionalObraSocial
                    {
                        ProfesionalCuil = prof.Cuil,
                        ObraSocialId = osObj.Id
                    });
                }
            }

            // Estudios asignados al profesional
            foreach (var estNom in pd.EstudiosNombres)
            {
                var estObj = allEstudios.FirstOrDefault(e => e.Nombre == estNom);
                if (estObj != null && !prof.Estudios.Any(pe => pe.EstudioId == estObj.Id))
                {
                    var profEstudio = new ProfesionalEstudio
                    {
                        ProfesionalCuil = prof.Cuil,
                        EstudioId = estObj.Id,
                        DuracionTurno = estObj.Duracion,
                        PrecioParticular = 25000.0m,
                        Activo = true
                    };

                    // Asignar coberturas de obras sociales aceptadas por el profesional
                    foreach (var osNom in pd.ObrasSocialesNombres)
                    {
                        var osObj = allObrasSociales.FirstOrDefault(o => o.Nombre == osNom);
                        if (osObj != null)
                        {
                            profEstudio.Coberturas.Add(new Cobertura
                            {
                                ObraSocialId = osObj.Id
                            });
                        }
                    }

                    prof.Estudios.Add(profEstudio);
                }
            }

            db.SaveChanges();

            // Agenda y Turnos Disponibles para cada profesional
            var hoy = DateTime.Today;
            var primaryConsultorioCuit = pd.ConsultoriosCuits[0];

            var agenda = db.Agendas.FirstOrDefault(a =>
                a.ProfesionalCuil == prof.Cuil &&
                a.Dia == hoy.Day &&
                a.Mes == hoy.Month &&
                a.Anio == hoy.Year);

            if (agenda == null)
            {
                agenda = new Agenda
                {
                    ProfesionalCuil = prof.Cuil,
                    ConsultorioCuit = primaryConsultorioCuit,
                    Dia = hoy.Day,
                    Mes = hoy.Month,
                    Anio = hoy.Year,
                    HoraEntrada = new TimeSpan(8, 0, 0),
                    HoraSalida = new TimeSpan(18, 0, 0)
                };
                db.Agendas.Add(agenda);
                db.SaveChanges();

                var turnos = new List<Turno>();
                for (int d = 0; d <= 2; d++)
                {
                    var fechaDia = hoy.AddDays(d);
                    var horas = new[] { 9, 10, 11, 14, 15, 16 };
                    foreach (var h in horas)
                    {
                        turnos.Add(new Turno
                        {
                            AgendaId = agenda.Id,
                            Fecha = fechaDia,
                            HoraInicio = new TimeSpan(h, 0, 0),
                            HoraFin = new TimeSpan(h, 30, 0),
                            Estado = EstadoTurno.Disponible
                        });
                        turnos.Add(new Turno
                        {
                            AgendaId = agenda.Id,
                            Fecha = fechaDia,
                            HoraInicio = new TimeSpan(h, 30, 0),
                            HoraFin = new TimeSpan(h + 1, 0, 0),
                            Estado = EstadoTurno.Disponible
                        });
                    }
                }
                db.Turnos.AddRange(turnos);
                db.SaveChanges();

                // Para Carlos Pérez: Crear Cita previa Atendida con Historia Clínica y Cita Confirmada para HOY
                if (prof.Cuil == "20123456789" && pac != null && turnos.Count > 1)
                {
                    var hc = db.HistoriasClinicas.FirstOrDefault(h => h.PacienteCuil == pac.Cuil);
                    if (hc == null)
                    {
                        hc = new HistoriaClinica
                        {
                            PacienteCuil = pac.Cuil,
                            GrupSang = "A+",
                            Alergias = "Penicilina",
                            EnfermedadesCronicas = "Hipertensión leve",
                            Medicamentos = "Losartán 50mg/día",
                            Discapacidad = "Ninguna",
                            NombreContacto = "María",
                            ApellidoContacto = "García",
                            TelefonoContacto = "3815998877"
                        };
                        db.HistoriasClinicas.Add(hc);
                        db.SaveChanges();
                    }

                    var turnoPasado = turnos[0];
                    turnoPasado.Estado = EstadoTurno.Atendido;

                    var citaPasada = new Cita
                    {
                        TurnoId = turnoPasado.Id,
                        PacienteCuil = pac.Cuil,
                        Fecha = hoy.AddDays(-2),
                        Estado = EstadoCita.Atendida,
                        Tipo = TipoCita.Consulta,
                        Cobertura = CoberturaCita.ObraSocial
                    };
                    db.Citas.Add(citaPasada);
                    db.SaveChanges();
                    turnoPasado.CitaId = citaPasada.Id;

                    if (!db.Observaciones.Any(o => o.CitaId == citaPasada.Id))
                    {
                        db.Observaciones.Add(new Observacion
                        {
                            CitaId = citaPasada.Id,
                            HistoriaClinicaId = hc.Id,
                            ProfesionalCuil = prof.Cuil,
                            Motivo = "Consulta Cardiológica de Rutina",
                            Detalle = "Paciente lúcida, normotensa (125/80 mmHg). Ruidos cardíacos normofonéticos. Se renueva prescripción habitual."
                        });
                    }

                    var turnoHoy = turnos[1];
                    turnoHoy.Estado = EstadoTurno.Reservado;

                    var citaHoy = new Cita
                    {
                        TurnoId = turnoHoy.Id,
                        PacienteCuil = pac.Cuil,
                        Fecha = hoy,
                        Estado = EstadoCita.Confirmada,
                        Tipo = TipoCita.Consulta,
                        Cobertura = CoberturaCita.ObraSocial
                    };
                    db.Citas.Add(citaHoy);
                    db.SaveChanges();
                    turnoHoy.CitaId = citaHoy.Id;
                    db.SaveChanges();
                }
            }
        }

        // 10. Administrador de Consultorio y Asistente
        var consCardio = db.Consultorios.FirstOrDefault(c => c.Cuit == "30111222331");
        if (consCardio != null)
        {
            var adminConsCuil = "20334455667";
            var adminUser = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == "admin.cons101");
            if (adminUser == null)
            {
                adminUser = new Usuario
                {
                    NombreUsuario = "admin.cons101",
                    Contrasena = "AdminCons123!",
                    Mail = "admin.cons101@sanatoriotucuman.com",
                    Rol = RolUsuario.AdminConsultorio
                };
                db.Usuarios.Add(adminUser);
                db.SaveChanges();
            }

            if (!db.AdministradoresConsultorio.Any(ac => ac.Cuil == adminConsCuil))
            {
                var adminCons = new AdministradorConsultorio
                {
                    Cuil = adminConsCuil,
                    UsuarioId = adminUser.Id,
                    Nombre = "Roberto",
                    Apellido = "Sánchez",
                    Telefono = "3814234567",
                    FechaNacimiento = new DateTime(1985, 4, 12),
                    ConsultorioCuit = consCardio.Cuit
                };
                db.AdministradoresConsultorio.Add(adminCons);
                db.SaveChanges();
            }

            var asisExistente = db.Asistentes.FirstOrDefault(a => a.Cuil == "27111111111");
            if (asisExistente != null && (string.IsNullOrEmpty(asisExistente.ConsultorioCuit) || asisExistente.AdminConsultorioCuil != adminConsCuil))
            {
                asisExistente.ConsultorioCuit = consCardio.Cuit;
                asisExistente.AdminConsultorioCuil = adminConsCuil;
                db.SaveChanges();
            }
        }
    }
}
