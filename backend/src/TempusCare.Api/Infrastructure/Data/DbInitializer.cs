using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Infrastructure.Data;

public static class DbInitializer
{
    public static void Initialize(TempusCareDbContext db)
    {
        // 0. Tabla SolicitudesSuperAdmin para flujo de consenso multipartito (RN-12)
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

        // 1. Super Administradores y Consenso Multipartito (RN-12)
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

        if (!db.SolicitudesSuperAdmin.Any())
        {
            db.SolicitudesSuperAdmin.Add(new SolicitudSuperAdmin
            {
                EmailPropuesto = "auditoria@vitality.com",
                ProponenteId = uAdmin1.Id,
                Estado = "Pendiente",
                FechaCreacion = DateTime.UtcNow.AddHours(-2)
            });
            db.SaveChanges();
        }

        // 2. Instituciones Reales de Tucumán (RolUsuario.Institucion)
        var institucionesData = new[]
        {
            new
            {
                Cuit = "30546789123",
                Nombre = "Sanatorio 9 de Julio",
                Email = "contacto@sanatorio9dejulio.com.ar",
                Plan = "Enterprise",
                VisitasPerfil = 1540
            },
            new
            {
                Cuit = "30612345678",
                Nombre = "Sanatorio Modelo S.A.",
                Email = "info@sanatoriomodelo.com.ar",
                Plan = "Enterprise",
                VisitasPerfil = 980
            },
            new
            {
                Cuit = "30555666778",
                Nombre = "Clínica Mayo de Tucumán",
                Email = "administracion@clinicamayotucuman.com.ar",
                Plan = "Profesional",
                VisitasPerfil = 620
            }
        };

        var institucionesMap = new Dictionary<string, Institucion>();
        foreach (var instData in institucionesData)
        {
            var uInst = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == instData.Cuit);
            if (uInst == null)
            {
                uInst = new Usuario
                {
                    NombreUsuario = instData.Cuit,
                    Contrasena = "Institucion123!",
                    Mail = instData.Email,
                    Rol = RolUsuario.Institucion
                };
                db.Usuarios.Add(uInst);
                db.SaveChanges();
            }

            var inst = db.Instituciones.FirstOrDefault(i => i.Cuit == instData.Cuit);
            if (inst == null)
            {
                inst = new Institucion
                {
                    UsuarioId = uInst.Id,
                    Nombre = instData.Nombre,
                    Cuit = instData.Cuit,
                    Email = instData.Email,
                    Plan = instData.Plan,
                    VisitasPerfil = instData.VisitasPerfil
                };
                db.Instituciones.Add(inst);
                db.SaveChanges();
            }
            else
            {
                inst.VisitasPerfil = instData.VisitasPerfil;
            }
            institucionesMap[instData.Cuit] = inst;
        }

        // 3. Administradores de Institución (RolUsuario.AdminInstitucion)
        var adminsInstData = new[]
        {
            new
            {
                Usuario = "admin.9dejulio",
                Email = "admin.9dejulio@sanatorio9dejulio.com.ar",
                Cuil = "20245556667",
                Nombre = "Ricardo",
                Apellido = "Paz Posse",
                Telefono = "3814223344",
                FechaNac = new DateTime(1975, 6, 15),
                InstitucionCuit = "30546789123"
            },
            new
            {
                Usuario = "admin.modelo",
                Email = "admin.modelo@sanatoriomodelo.com.ar",
                Cuil = "27267778889",
                Nombre = "Marcela",
                Apellido = "Terán",
                Telefono = "3814334455",
                FechaNac = new DateTime(1978, 9, 22),
                InstitucionCuit = "30612345678"
            },
            new
            {
                Usuario = "admin.mayo",
                Email = "admin.mayo@clinicamayotucuman.com.ar",
                Cuil = "20289991112",
                Nombre = "Guillermo",
                Apellido = "Pérez de la Rosa",
                Telefono = "3814526001",
                FechaNac = new DateTime(1980, 1, 25),
                InstitucionCuit = "30555666778"
            }
        };

        foreach (var aid in adminsInstData)
        {
            var uAdminInst = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == aid.Usuario);
            if (uAdminInst == null)
            {
                uAdminInst = new Usuario
                {
                    NombreUsuario = aid.Usuario,
                    Contrasena = "AdminInst123!",
                    Mail = aid.Email,
                    Rol = RolUsuario.AdminInstitucion
                };
                db.Usuarios.Add(uAdminInst);
                db.SaveChanges();
            }

            if (!db.AdministradoresInstitucion.Any(ai => ai.Cuil == aid.Cuil))
            {
                var inst = institucionesMap[aid.InstitucionCuit];
                db.AdministradoresInstitucion.Add(new AdministradorInstitucion
                {
                    Cuil = aid.Cuil,
                    UsuarioId = uAdminInst.Id,
                    InstitucionId = inst.Id,
                    Nombre = aid.Nombre,
                    Apellido = aid.Apellido,
                    Telefono = aid.Telefono,
                    FechaNacimiento = aid.FechaNac
                });
                db.SaveChanges();
            }
        }

        // 4. Sedes / Consultorios Reales en Tucumán con Coordenadas Exactas
        var consultoriosData = new[]
        {
            new
            {
                Cuit = "30546789101",
                Nombre = "Sede Central - Cardiología y Clínica",
                Email = "sedecentral@sanatorio9dejulio.com.ar",
                Telefono = "3814504500",
                NivelAccesibilidad = "Total",
                InstitucionCuit = "30546789123",
                Calle = "25 de Mayo",
                Nro = "372",
                Localidad = "San Miguel de Tucumán",
                Provincia = "Tucumán",
                CodPostal = "4000",
                Latitud = -26.826356,
                Longitud = -65.203986,
                VisitasPerfil = 830
            },
            new
            {
                Cuit = "30546789102",
                Nombre = "Consultorios Externos Barrio Norte - Pediatría",
                Email = "barrionorte@sanatorio9dejulio.com.ar",
                Telefono = "3814504510",
                NivelAccesibilidad = "Especializada",
                InstitucionCuit = "30546789123",
                Calle = "Santiago del Estero",
                Nro = "650",
                Localidad = "San Miguel de Tucumán",
                Provincia = "Tucumán",
                CodPostal = "4000",
                Latitud = -26.822200,
                Longitud = -65.207100,
                VisitasPerfil = 415
            },
            new
            {
                Cuit = "30612345601",
                Nombre = "Centro Médico Sanatorio Modelo - Traumatología y Dermatología",
                Email = "sarmiento@sanatoriomodelo.com.ar",
                Telefono = "3814311111",
                NivelAccesibilidad = "Total",
                InstitucionCuit = "30612345678",
                Calle = "Av. Sarmiento",
                Nro = "550",
                Localidad = "San Miguel de Tucumán",
                Provincia = "Tucumán",
                CodPostal = "4000",
                Latitud = -26.823996,
                Longitud = -65.201637,
                VisitasPerfil = 520
            },
            new
            {
                Cuit = "30612345602",
                Nombre = "Sede Yerba Buena - Consultorios del Sol",
                Email = "yerbabuena@sanatoriomodelo.com.ar",
                Telefono = "3814258899",
                NivelAccesibilidad = "Básica",
                InstitucionCuit = "30612345678",
                Calle = "Av. Aconquija",
                Nro = "1750",
                Localidad = "Yerba Buena",
                Provincia = "Tucumán",
                CodPostal = "4107",
                Latitud = -26.815350,
                Longitud = -65.302150,
                VisitasPerfil = 390
            },
            new
            {
                Cuit = "30555666701",
                Nombre = "Instituto de Diagnóstico por Imágenes",
                Email = "imagenes@clinicamayotucuman.com.ar",
                Telefono = "3814526000",
                NivelAccesibilidad = "Media",
                InstitucionCuit = "30555666778",
                Calle = "9 de Julio",
                Nro = "279",
                Localidad = "San Miguel de Tucumán",
                Provincia = "Tucumán",
                CodPostal = "4000",
                Latitud = -26.833626,
                Longitud = -65.204585,
                VisitasPerfil = 260
            }
        };

        var consultoriosMap = new Dictionary<string, Consultorio>();
        foreach (var cd in consultoriosData)
        {
            var cons = db.Consultorios.Include(c => c.Direccion).FirstOrDefault(c => c.Cuit == cd.Cuit);
            var inst = institucionesMap[cd.InstitucionCuit];
            if (cons == null)
            {
                var dir = new Direccion
                {
                    Calle = cd.Calle,
                    Nro = cd.Nro,
                    Localidad = cd.Localidad,
                    Provincia = cd.Provincia,
                    CodPostal = cd.CodPostal,
                    Pais = "Argentina"
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
                    InstitucionId = inst.Id,
                    DireccionId = dir.Id,
                    Latitud = cd.Latitud,
                    Longitud = cd.Longitud,
                    VisitasPerfil = cd.VisitasPerfil
                };
                db.Consultorios.Add(cons);
                db.SaveChanges();
            }
            else
            {
                cons.Nombre = cd.Nombre;
                cons.Email = cd.Email;
                cons.Telefono = cd.Telefono;
                cons.NivelAccesibilidad = cd.NivelAccesibilidad;
                cons.InstitucionId = inst.Id;
                cons.Latitud = cd.Latitud;
                cons.Longitud = cd.Longitud;
                cons.VisitasPerfil = cd.VisitasPerfil;
                if (cons.Direccion != null)
                {
                    cons.Direccion.Calle = cd.Calle;
                    cons.Direccion.Nro = cd.Nro;
                    cons.Direccion.Localidad = cd.Localidad;
                    cons.Direccion.Provincia = cd.Provincia;
                    cons.Direccion.CodPostal = cd.CodPostal;
                }
                db.SaveChanges();
            }
            consultoriosMap[cd.Cuit] = cons;
        }

        // 5. Administradores de Consultorio y Asistentes (Secretaría)
        // Admin Consultorio 1 (Sede 25 de Mayo)
        var uAdminCons1 = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == "admin.sede25demayo");
        if (uAdminCons1 == null)
        {
            uAdminCons1 = new Usuario
            {
                NombreUsuario = "admin.sede25demayo",
                Contrasena = "AdminCons123!",
                Mail = "admin.sede25demayo@sanatorio9dejulio.com.ar",
                Rol = RolUsuario.AdminConsultorio
            };
            db.Usuarios.Add(uAdminCons1);
            db.SaveChanges();
        }

        if (!db.AdministradoresConsultorio.Any(ac => ac.Cuil == "20334455667"))
        {
            db.AdministradoresConsultorio.Add(new AdministradorConsultorio
            {
                Cuil = "20334455667",
                UsuarioId = uAdminCons1.Id,
                ConsultorioCuit = "30546789101",
                Nombre = "Roberto",
                Apellido = "Sánchez",
                Telefono = "3814234567",
                FechaNacimiento = new DateTime(1985, 4, 12)
            });
            db.SaveChanges();
        }

        // Admin Consultorio 2 (Sede Sarmiento)
        var uAdminCons2 = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == "admin.sedesarmiento");
        if (uAdminCons2 == null)
        {
            uAdminCons2 = new Usuario
            {
                NombreUsuario = "admin.sedesarmiento",
                Contrasena = "AdminCons123!",
                Mail = "admin.sedesarmiento@sanatoriomodelo.com.ar",
                Rol = RolUsuario.AdminConsultorio
            };
            db.Usuarios.Add(uAdminCons2);
            db.SaveChanges();
        }

        if (!db.AdministradoresConsultorio.Any(ac => ac.Cuil == "27312233445"))
        {
            db.AdministradoresConsultorio.Add(new AdministradorConsultorio
            {
                Cuil = "27312233445",
                UsuarioId = uAdminCons2.Id,
                ConsultorioCuit = "30612345601",
                Nombre = "Claudia",
                Apellido = "Albornoz",
                Telefono = "3814345678",
                FechaNacimiento = new DateTime(1987, 11, 3)
            });
            db.SaveChanges();
        }

        // Admin Consultorio 3 (Clínica Mayo - Sede 9 de Julio 279)
        var uAdminCons3 = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == "admin.sedemayo");
        if (uAdminCons3 == null)
        {
            uAdminCons3 = new Usuario
            {
                NombreUsuario = "admin.sedemayo",
                Contrasena = "AdminCons123!",
                Mail = "admin.sedemayo@clinicamayotucuman.com.ar",
                Rol = RolUsuario.AdminConsultorio
            };
            db.Usuarios.Add(uAdminCons3);
            db.SaveChanges();
        }

        if (!db.AdministradoresConsultorio.Any(ac => ac.Cuil == "20356667778"))
        {
            db.AdministradoresConsultorio.Add(new AdministradorConsultorio
            {
                Cuil = "20356667778",
                UsuarioId = uAdminCons3.Id,
                ConsultorioCuit = "30555666701",
                Nombre = "Esteban",
                Apellido = "Juárez",
                Telefono = "3814526002",
                FechaNacimiento = new DateTime(1984, 8, 14)
            });
            db.SaveChanges();
        }

        // Asistente 1: Lucía Fernández (Sanatorio 9 de Julio, Sede 25 de Mayo)
        var uAsis1 = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == "27111111111");
        if (uAsis1 == null)
        {
            uAsis1 = new Usuario
            {
                NombreUsuario = "27111111111",
                Contrasena = "Asistente123!",
                Mail = "lucia.fernandez@sanatorio9dejulio.com.ar",
                Rol = RolUsuario.Asistente
            };
            db.Usuarios.Add(uAsis1);
            db.SaveChanges();
        }

        var asis1 = db.Asistentes.FirstOrDefault(a => a.Cuil == "27111111111");
        if (asis1 == null)
        {
            asis1 = new Asistente
            {
                Cuil = "27111111111",
                UsuarioId = uAsis1.Id,
                Nombre = "Lucía",
                Apellido = "Fernández",
                Telefono = "3817005566",
                Genero = "F",
                FechaNacimiento = new DateTime(1992, 3, 10),
                InstitucionId = institucionesMap["30546789123"].Id,
                ConsultorioCuit = "30546789101",
                AdminConsultorioCuil = "20334455667"
            };
            db.Asistentes.Add(asis1);
            db.SaveChanges();
        }
        else
        {
            asis1.ConsultorioCuit = "30546789101";
            asis1.AdminConsultorioCuil = "20334455667";
            asis1.InstitucionId = institucionesMap["30546789123"].Id;
            db.SaveChanges();
        }

        // Asistente 2: Gonzalo Romero (Sanatorio Modelo, Sede Sarmiento)
        var uAsis2 = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == "20222222223");
        if (uAsis2 == null)
        {
            uAsis2 = new Usuario
            {
                NombreUsuario = "20222222223",
                Contrasena = "Asistente123!",
                Mail = "gonzalo.romero@sanatoriomodelo.com.ar",
                Rol = RolUsuario.Asistente
            };
            db.Usuarios.Add(uAsis2);
            db.SaveChanges();
        }

        var asis2 = db.Asistentes.FirstOrDefault(a => a.Cuil == "20222222223");
        if (asis2 == null)
        {
            asis2 = new Asistente
            {
                Cuil = "20222222223",
                UsuarioId = uAsis2.Id,
                Nombre = "Gonzalo",
                Apellido = "Romero",
                Telefono = "3817112233",
                Genero = "M",
                FechaNacimiento = new DateTime(1994, 8, 19),
                InstitucionId = institucionesMap["30612345678"].Id,
                ConsultorioCuit = "30612345601",
                AdminConsultorioCuil = "27312233445"
            };
            db.Asistentes.Add(asis2);
            db.SaveChanges();
        }
        else
        {
            asis2.ConsultorioCuit = "30612345601";
            asis2.AdminConsultorioCuil = "27312233445";
            asis2.InstitucionId = institucionesMap["30612345678"].Id;
            db.SaveChanges();
        }

        // Asistente 3: Paula Rivas (Clínica Mayo, Sede Instituto de Diagnóstico por Imágenes)
        var uAsis3 = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == "27333333334");
        if (uAsis3 == null)
        {
            uAsis3 = new Usuario
            {
                NombreUsuario = "27333333334",
                Contrasena = "Asistente123!",
                Mail = "paula.rivas@clinicamayotucuman.com.ar",
                Rol = RolUsuario.Asistente
            };
            db.Usuarios.Add(uAsis3);
            db.SaveChanges();
        }

        var asis3 = db.Asistentes.FirstOrDefault(a => a.Cuil == "27333333334");
        if (asis3 == null)
        {
            asis3 = new Asistente
            {
                Cuil = "27333333334",
                UsuarioId = uAsis3.Id,
                Nombre = "Paula",
                Apellido = "Rivas",
                Telefono = "3814526003",
                Genero = "F",
                FechaNacimiento = new DateTime(1995, 5, 20),
                InstitucionId = institucionesMap["30555666778"].Id,
                ConsultorioCuit = "30555666701",
                AdminConsultorioCuil = "20356667778"
            };
            db.Asistentes.Add(asis3);
            db.SaveChanges();
        }
        else
        {
            asis3.ConsultorioCuit = "30555666701";
            asis3.AdminConsultorioCuil = "20356667778";
            asis3.InstitucionId = institucionesMap["30555666778"].Id;
            db.SaveChanges();
        }

        // 6. Obras Sociales Reales en Tucumán
        var obrasSocialesData = new[]
        {
            new { Nombre = "Subsidio de Salud (IPSST)", Catalogo = "Obra social provincial de Tucumán" },
            new { Nombre = "PAMI", Catalogo = "Instituto Nacional de Servicios Sociales para Jubilados y Pensionados" },
            new { Nombre = "OSDE", Catalogo = "Prepaga nacional - Planes 210, 310, 410" },
            new { Nombre = "Swiss Medical", Catalogo = "Prepaga nacional de alta complejidad" },
            new { Nombre = "Boreal Cobertura de Salud", Catalogo = "Prepaga regional del NOA" },
            new { Nombre = "ASUNT", Catalogo = "Acción Social de la Universidad Nacional de Tucumán" }
        };

        foreach (var os in obrasSocialesData)
        {
            if (!db.ObrasSociales.Any(o => o.Nombre == os.Nombre))
            {
                db.ObrasSociales.Add(new ObraSocial { Nombre = os.Nombre, Catalogo = os.Catalogo });
            }
        }
        db.SaveChanges();

        var osSubsidio = db.ObrasSociales.First(o => o.Nombre == "Subsidio de Salud (IPSST)");
        var osPami = db.ObrasSociales.First(o => o.Nombre == "PAMI");
        var osOsde = db.ObrasSociales.First(o => o.Nombre == "OSDE");

        // 7. Pacientes con Distintos Escenarios de Prueba
        // Paciente 1: Ana García (Subsidio de Salud + OSDE)
        var uPac1 = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == "27000000001");
        if (uPac1 == null)
        {
            uPac1 = new Usuario
            {
                NombreUsuario = "27000000001",
                Contrasena = "Paciente123!",
                Mail = "ana.garcia@tempuscare.com",
                Rol = RolUsuario.Paciente
            };
            db.Usuarios.Add(uPac1);
            db.SaveChanges();
        }

        var dirPac1 = db.Direcciones.FirstOrDefault(d => d.Calle == "Muñecas" && d.Nro == "450");
        if (dirPac1 == null)
        {
            dirPac1 = new Direccion
            {
                Calle = "Muñecas",
                Nro = "450",
                Localidad = "San Miguel de Tucumán",
                Provincia = "Tucumán",
                CodPostal = "4000",
                Pais = "Argentina"
            };
            db.Direcciones.Add(dirPac1);
            db.SaveChanges();
        }

        var pac1 = db.Pacientes.FirstOrDefault(p => p.Cuil == "27000000001");
        if (pac1 == null)
        {
            pac1 = new Paciente
            {
                Cuil = "27000000001",
                UsuarioId = uPac1.Id,
                Nombre = "Ana",
                Apellido = "García",
                FechaNacimiento = new DateTime(1995, 5, 20),
                Telefono = "3815001122",
                Genero = "F",
                DireccionId = dirPac1.Id
            };
            db.Pacientes.Add(pac1);
            db.SaveChanges();
        }

        if (!db.PacienteObrasSociales.Any(pos => pos.PacienteCuil == pac1.Cuil && pos.ObraSocialId == osSubsidio.Id))
        {
            db.PacienteObrasSociales.Add(new PacienteObraSocial { PacienteCuil = pac1.Cuil, ObraSocialId = osSubsidio.Id });
        }
        if (!db.PacienteObrasSociales.Any(pos => pos.PacienteCuil == pac1.Cuil && pos.ObraSocialId == osOsde.Id))
        {
            db.PacienteObrasSociales.Add(new PacienteObraSocial { PacienteCuil = pac1.Cuil, ObraSocialId = osOsde.Id });
        }
        db.SaveChanges();

        var hcPac1 = db.HistoriasClinicas.FirstOrDefault(h => h.PacienteCuil == pac1.Cuil);
        if (hcPac1 == null)
        {
            hcPac1 = new HistoriaClinica
            {
                PacienteCuil = pac1.Cuil,
                GrupSang = "A+",
                Alergias = "Penicilina",
                EnfermedadesCronicas = "Hipertensión arterial leve",
                Medicamentos = "Losartán 50mg/día",
                Discapacidad = "Ninguna",
                NombreContacto = "María",
                ApellidoContacto = "García",
                TelefonoContacto = "3815998877"
            };
            db.HistoriasClinicas.Add(hcPac1);
            db.SaveChanges();
        }

        // Paciente 2: Héctor Juárez (PAMI)
        var uPac2 = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == "20145556662");
        if (uPac2 == null)
        {
            uPac2 = new Usuario
            {
                NombreUsuario = "20145556662",
                Contrasena = "Paciente123!",
                Mail = "hector.juarez@tempuscare.com",
                Rol = RolUsuario.Paciente
            };
            db.Usuarios.Add(uPac2);
            db.SaveChanges();
        }

        var dirPac2 = db.Direcciones.FirstOrDefault(d => d.Calle == "San Lorenzo" && d.Nro == "820");
        if (dirPac2 == null)
        {
            dirPac2 = new Direccion
            {
                Calle = "San Lorenzo",
                Nro = "820",
                Localidad = "San Miguel de Tucumán",
                Provincia = "Tucumán",
                CodPostal = "4000",
                Pais = "Argentina"
            };
            db.Direcciones.Add(dirPac2);
            db.SaveChanges();
        }

        var pac2 = db.Pacientes.FirstOrDefault(p => p.Cuil == "20145556662");
        if (pac2 == null)
        {
            pac2 = new Paciente
            {
                Cuil = "20145556662",
                UsuarioId = uPac2.Id,
                Nombre = "Héctor",
                Apellido = "Juárez",
                FechaNacimiento = new DateTime(1952, 7, 9),
                Telefono = "3814667788",
                Genero = "M",
                DireccionId = dirPac2.Id
            };
            db.Pacientes.Add(pac2);
            db.SaveChanges();
        }

        if (!db.PacienteObrasSociales.Any(pos => pos.PacienteCuil == pac2.Cuil && pos.ObraSocialId == osPami.Id))
        {
            db.PacienteObrasSociales.Add(new PacienteObraSocial { PacienteCuil = pac2.Cuil, ObraSocialId = osPami.Id });
            db.SaveChanges();
        }

        var hcPac2 = db.HistoriasClinicas.FirstOrDefault(h => h.PacienteCuil == pac2.Cuil);
        if (hcPac2 == null)
        {
            hcPac2 = new HistoriaClinica
            {
                PacienteCuil = pac2.Cuil,
                GrupSang = "O+",
                Alergias = "Ninguna",
                EnfermedadesCronicas = "Diabetes Tipo 2",
                Medicamentos = "Metformina 850mg",
                Discapacidad = "Hipoacusia moderada",
                NombreContacto = "Elena",
                ApellidoContacto = "Juárez",
                TelefonoContacto = "3814778899"
            };
            db.HistoriasClinicas.Add(hcPac2);
            db.SaveChanges();
        }

        // Paciente 3: Valentina Costilla (Sin Obra Social / Particular RN-03)
        var uPac3 = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == "23398887779");
        if (uPac3 == null)
        {
            uPac3 = new Usuario
            {
                NombreUsuario = "23398887779",
                Contrasena = "Paciente123!",
                Mail = "valentina.costilla@tempuscare.com",
                Rol = RolUsuario.Paciente
            };
            db.Usuarios.Add(uPac3);
            db.SaveChanges();
        }

        var dirPac3 = db.Direcciones.FirstOrDefault(d => d.Calle == "Laprida" && d.Nro == "315");
        if (dirPac3 == null)
        {
            dirPac3 = new Direccion
            {
                Calle = "Laprida",
                Nro = "315",
                Localidad = "San Miguel de Tucumán",
                Provincia = "Tucumán",
                CodPostal = "4000",
                Pais = "Argentina"
            };
            db.Direcciones.Add(dirPac3);
            db.SaveChanges();
        }

        var pac3 = db.Pacientes.FirstOrDefault(p => p.Cuil == "23398887779");
        if (pac3 == null)
        {
            pac3 = new Paciente
            {
                Cuil = "23398887779",
                UsuarioId = uPac3.Id,
                Nombre = "Valentina",
                Apellido = "Costilla",
                FechaNacimiento = new DateTime(1998, 10, 14),
                Telefono = "3816123987",
                Genero = "F",
                DireccionId = dirPac3.Id
            };
            db.Pacientes.Add(pac3);
            db.SaveChanges();
        }

        var hcPac3 = db.HistoriasClinicas.FirstOrDefault(h => h.PacienteCuil == pac3.Cuil);
        if (hcPac3 == null)
        {
            hcPac3 = new HistoriaClinica
            {
                PacienteCuil = pac3.Cuil,
                GrupSang = "B+",
                Alergias = "Ibuprofeno",
                EnfermedadesCronicas = "Ninguna",
                Medicamentos = "Ninguno",
                Discapacidad = "Ninguna",
                NombreContacto = "Javier",
                ApellidoContacto = "Costilla",
                TelefonoContacto = "3816554433"
            };
            db.HistoriasClinicas.Add(hcPac3);
            db.SaveChanges();
        }

        // Paciente 4: Tomas Agustin Alvarez Paez (Perfil Real del Operador / Tester)
        var uPac4 = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == "20452790094");
        if (uPac4 == null)
        {
            uPac4 = new Usuario
            {
                NombreUsuario = "20452790094",
                Contrasena = "Paciente123!",
                Mail = "tomas.alvarez@tempuscare.com",
                Rol = RolUsuario.Paciente
            };
            db.Usuarios.Add(uPac4);
            db.SaveChanges();
        }

        var dirPac4 = db.Direcciones.FirstOrDefault(d => d.Calle == "Barrio Los Apostoles Mzn N" && d.Nro == "Casa 7");
        if (dirPac4 == null)
        {
            dirPac4 = new Direccion
            {
                Calle = "Barrio Los Apostoles Mzn N",
                Nro = "Casa 7",
                Localidad = "Las Talitas",
                Provincia = "Tucumán",
                CodPostal = "4101",
                Pais = "Argentina"
            };
            db.Direcciones.Add(dirPac4);
            db.SaveChanges();
        }

        var pac4 = db.Pacientes.FirstOrDefault(p => p.Cuil == "20452790094");
        if (pac4 == null)
        {
            pac4 = new Paciente
            {
                Cuil = "20452790094",
                UsuarioId = uPac4.Id,
                Nombre = "Tomas Agustin",
                Apellido = "Alvarez Paez",
                FechaNacimiento = new DateTime(2003, 10, 18),
                Telefono = "03813272232",
                Genero = "M",
                DireccionId = dirPac4.Id
            };
            db.Pacientes.Add(pac4);
            db.SaveChanges();
        }

        if (osPami != null && !db.PacienteObrasSociales.Any(pos => pos.PacienteCuil == pac4.Cuil && pos.ObraSocialId == osPami.Id))
        {
            db.PacienteObrasSociales.Add(new PacienteObraSocial { PacienteCuil = pac4.Cuil, ObraSocialId = osPami.Id });
            db.SaveChanges();
        }

        var hcPac4 = db.HistoriasClinicas.FirstOrDefault(h => h.PacienteCuil == pac4.Cuil);
        if (hcPac4 == null)
        {
            hcPac4 = new HistoriaClinica
            {
                PacienteCuil = pac4.Cuil,
                GrupSang = "0+",
                Alergias = "Ninguna conocida",
                EnfermedadesCronicas = "Ninguna",
                Medicamentos = "Ninguno",
                Discapacidad = "Ninguna"
            };
            db.HistoriasClinicas.Add(hcPac4);
            db.SaveChanges();
        }

        // 8. Especialidades y Estudios
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

        // 9. Médicos Profesionales (10 Médicos en total, 2 por Especialidad)
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
                ConsultoriosCuits = new[] { "30546789101", "30612345602" }, // Sede Central 25 de Mayo y Yerba Buena
                ObrasSocialesNombres = new[] { "Subsidio de Salud (IPSST)", "OSDE", "Swiss Medical", "ASUNT" },
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
                ConsultoriosCuits = new[] { "30546789101" },
                ObrasSocialesNombres = new[] { "OSDE", "PAMI", "Subsidio de Salud (IPSST)", "Boreal Cobertura de Salud" },
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
                ConsultoriosCuits = new[] { "30546789102", "30612345602" }, // Barrio Norte (9 de Julio) y Sede Yerba Buena (Sanatorio Modelo)
                ObrasSocialesNombres = new[] { "Subsidio de Salud (IPSST)", "Swiss Medical", "OSDE", "ASUNT" },
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
                ConsultoriosCuits = new[] { "30546789102" }, // Barrio Norte
                ObrasSocialesNombres = new[] { "OSDE", "Swiss Medical", "PAMI" },
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
                ConsultoriosCuits = new[] { "30612345601" }, // Av. Sarmiento
                ObrasSocialesNombres = new[] { "Subsidio de Salud (IPSST)", "OSDE", "PAMI", "Boreal Cobertura de Salud" },
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
                ConsultoriosCuits = new[] { "30612345601", "30612345602" }, // Sarmiento y Yerba Buena
                ObrasSocialesNombres = new[] { "Swiss Medical", "OSDE", "Subsidio de Salud (IPSST)" },
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
                ConsultoriosCuits = new[] { "30546789101", "30612345601" }, // 25 de Mayo y Sarmiento
                ObrasSocialesNombres = new[] { "OSDE", "Swiss Medical", "Subsidio de Salud (IPSST)" },
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
                ConsultoriosCuits = new[] { "30612345601" }, // Av. Sarmiento
                ObrasSocialesNombres = new[] { "Subsidio de Salud (IPSST)", "PAMI", "ASUNT" },
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
                ConsultoriosCuits = new[] { "30555666701" }, // Clínica Mayo 9 de Julio
                ObrasSocialesNombres = new[] { "Subsidio de Salud (IPSST)", "OSDE", "Swiss Medical", "PAMI" },
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
                ConsultoriosCuits = new[] { "30555666701", "30546789101" }, // Clínica Mayo 9 de Julio y Sede Central 25 de Mayo
                ObrasSocialesNombres = new[] { "OSDE", "Swiss Medical", "Subsidio de Salud (IPSST)", "Boreal Cobertura de Salud" },
                EstudiosNombres = new[] { "Doppler fetal", "Ecografía ginecológica", "Ecografía de tiroides", "Resonancia Magnética", "Doppler Mamario" }
            }
        };

        var allObrasSociales = db.ObrasSociales.ToList();
        var allEstudios = db.Estudios.ToList();
        var allEspecialidades = db.Especialidades.ToList();

        var profesionalesMap = new Dictionary<string, Profesional>();

        foreach (var pd in profesionalesData)
        {
            var uDoctor = db.Usuarios.FirstOrDefault(u => u.NombreUsuario == pd.Cuil);
            if (uDoctor == null)
            {
                uDoctor = new Usuario
                {
                    NombreUsuario = pd.Cuil,
                    Contrasena = "Medico123!",
                    Mail = $"{pd.Nombre.ToLower().Replace("é", "e").Replace("í", "i").Replace("á", "a").Replace("ó", "o").Replace("ú", "u")}.{pd.Apellido.ToLower().Replace("é", "e").Replace("í", "i").Replace("á", "a").Replace("ó", "o").Replace("ú", "u")}@tempuscare.com",
                    Rol = RolUsuario.Profesional
                };
                db.Usuarios.Add(uDoctor);
                db.SaveChanges();
            }

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

            var espObj = allEspecialidades.FirstOrDefault(e => e.Nombre == pd.EspecialidadNombre);
            if (espObj != null && !prof.Especialidades.Any(pe => pe.EspecialidadId == espObj.Id))
            {
                prof.Especialidades.Add(new ProfesionalEspecialidad
                {
                    ProfesionalCuil = prof.Cuil,
                    EspecialidadId = espObj.Id
                });
            }

            // Sincronizar exactamente los consultorios del médico (solo 1 o 2 sedes asignadas)
            var currentCuits = prof.Consultorios.Select(pc => pc.ConsultorioCuit).ToList();
            foreach (var extra in prof.Consultorios.Where(pc => !pd.ConsultoriosCuits.Contains(pc.ConsultorioCuit)).ToList())
            {
                db.ProfesionalConsultorios.Remove(extra);
            }
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
            profesionalesMap[pd.Cuil] = prof;
        }

        // 10. Agendas Idempotentes y Turnos Futuros Garantizados para Pruebas (Lunes a Viernes, con Franjas Humanas y Pausa de Almuerzo)
        var hoy = DateTime.Today;

        // Construir conjunto de fechas hábiles: Pasado (-3 días), Hoy, próximos 7 días hábiles y fechas a +15d, +1m, +2m, +3m, +5m
        var fechasFuturasHabiles = new List<DateTime>();
        var cursor = hoy.AddDays(1);
        while (fechasFuturasHabiles.Count < 7)
        {
            if (cursor.DayOfWeek != DayOfWeek.Saturday && cursor.DayOfWeek != DayOfWeek.Sunday)
            {
                fechasFuturasHabiles.Add(cursor);
            }
            cursor = cursor.AddDays(1);
        }

        var hitosFuturos = new[]
        {
            hoy.AddDays(15),
            hoy.AddMonths(1),
            hoy.AddMonths(2),
            hoy.AddMonths(3),
            hoy.AddMonths(5)
        };

        foreach (var hito in hitosFuturos)
        {
            var d = hito;
            while (d.DayOfWeek == DayOfWeek.Saturday || d.DayOfWeek == DayOfWeek.Sunday)
            {
                d = d.AddDays(1);
            }
            if (!fechasFuturasHabiles.Contains(d))
            {
                fechasFuturasHabiles.Add(d);
            }
        }

        var agendasSedeCentral = new List<Agenda>();
        var agendasSedeSarmiento = new List<Agenda>();
        var agendasSedeMayo = new List<Agenda>();

        Agenda? agendaPasadaCarlos = null;
        Agenda? agendaHoyCarlos = null;
        Agenda? agendaFuturaCarlos = null;

        Agenda? agendaPasadaMorales = null;
        Agenda? agendaHoyMorales = null;

        Agenda? agendaPasadaVega = null;
        Agenda? agendaHoyVega = null;

        Agenda? agendaPasadaCastro = null;
        Agenda? agendaHoyCastro = null;

        Agenda? agendaPasadaGomez = null;

        foreach (var pd in profesionalesData)
        {
            var prof = profesionalesMap[pd.Cuil];
            var primaryConsultorioCuit = pd.ConsultoriosCuits[0];
            bool esMultiSede = pd.ConsultoriosCuits.Length > 1;

            // Determinar tipo de jornada médica realista de Tucumán:
            // Horario Cortado: 08:30 a 12:30 y 16:30 a 20:30 (descanso 12:30 a 16:30)
            // Turno Mañana: 08:00 a 13:00
            // Turno Tarde: 15:00 a 20:00
            bool esHorarioCortado = prof.Cuil == "20123456789" || prof.Cuil == "27223344551" || prof.Cuil == "27296667771" || prof.Cuil == "20284445551" || prof.Cuil == "27289990001";
            bool esTurnoTarde = prof.Cuil == "20312223331" || prof.Cuil == "27325556661" || prof.Cuil == "20258889991";

            // Lista de días a generar para este médico: Pasado (-3 días), Hoy, y las fechas futuras hábiles
            var diasMedicos = new List<(DateTime Fecha, bool EsPasado, bool EsHoy)>
            {
                (hoy.AddDays(-3), true, false),
                (hoy, false, true)
            };
            foreach (var fh in fechasFuturasHabiles)
            {
                diasMedicos.Add((fh, false, false));
            }

            foreach (var dm in diasMedicos)
            {
                TimeSpan horaEntrada;
                TimeSpan horaSalida;
                TimeSpan? pausaInicio = null;
                TimeSpan? pausaFin = null;

                if (esHorarioCortado)
                {
                    horaEntrada = new TimeSpan(8, 30, 0);
                    horaSalida = new TimeSpan(20, 30, 0);
                    pausaInicio = new TimeSpan(12, 30, 0);
                    pausaFin = new TimeSpan(16, 30, 0);
                }
                else if (esTurnoTarde)
                {
                    horaEntrada = new TimeSpan(15, 0, 0);
                    horaSalida = new TimeSpan(20, 0, 0);
                }
                else
                {
                    horaEntrada = new TimeSpan(8, 0, 0);
                    horaSalida = new TimeSpan(13, 0, 0);
                }

                // Si es multi-sede (ej: Dr. Carlos Pérez), en días hábiles pares alternos (martes/jueves), atiende mañana en Central y tarde en Yerba Buena
                bool atiendeSecundariaHoy = esMultiSede && !dm.EsPasado && !dm.EsHoy && (dm.Fecha.Day % 2 == 0);
                var horaSalidaPrimaria = (atiendeSecundariaHoy && esHorarioCortado)
                    ? new TimeSpan(12, 30, 0)
                    : horaSalida;

                var agenda = db.Agendas.Include(a => a.Turnos).FirstOrDefault(a =>
                    a.ProfesionalCuil == prof.Cuil &&
                    a.ConsultorioCuit == primaryConsultorioCuit &&
                    a.Dia == dm.Fecha.Day &&
                    a.Mes == dm.Fecha.Month &&
                    a.Anio == dm.Fecha.Year);

                if (agenda == null)
                {
                    agenda = new Agenda
                    {
                        ProfesionalCuil = prof.Cuil,
                        ConsultorioCuit = primaryConsultorioCuit,
                        Dia = dm.Fecha.Day,
                        Mes = dm.Fecha.Month,
                        Anio = dm.Fecha.Year,
                        HoraEntrada = horaEntrada,
                        HoraSalida = horaSalidaPrimaria
                    };
                    db.Agendas.Add(agenda);
                    db.SaveChanges();

                    var turnosNuevos = new List<Turno>();
                    var current = horaEntrada;
                    while (current < horaSalidaPrimaria)
                    {
                        var fin = current.Add(TimeSpan.FromMinutes(30));
                        // Si está dentro de la pausa de almuerzo/descanso, no generar turno
                        bool enPausa = pausaInicio.HasValue && pausaFin.HasValue &&
                                       (current < pausaFin.Value && fin > pausaInicio.Value);

                        if (!enPausa)
                        {
                            turnosNuevos.Add(new Turno
                            {
                                AgendaId = agenda.Id,
                                Fecha = dm.Fecha.Date,
                                HoraInicio = current,
                                HoraFin = fin,
                                Estado = EstadoTurno.Disponible
                            });
                        }
                        current = fin;
                    }
                    db.Turnos.AddRange(turnosNuevos);
                    db.SaveChanges();
                }

                if (primaryConsultorioCuit == "30546789101")
                {
                    agendasSedeCentral.Add(agenda);
                }
                else if (primaryConsultorioCuit == "30612345601")
                {
                    agendasSedeSarmiento.Add(agenda);
                }
                else if (primaryConsultorioCuit == "30555666701")
                {
                    agendasSedeMayo.Add(agenda);
                }

                if (prof.Cuil == "20123456789")
                {
                    if (dm.EsPasado) agendaPasadaCarlos = agenda;
                    if (dm.EsHoy) agendaHoyCarlos = agenda;
                    if (!dm.EsPasado && !dm.EsHoy && agendaFuturaCarlos == null) agendaFuturaCarlos = agenda;
                }
                else if (prof.Cuil == "20284445551")
                {
                    if (dm.EsPasado) agendaPasadaMorales = agenda;
                    if (dm.EsHoy) agendaHoyMorales = agenda;
                }
                else if (prof.Cuil == "20258889991")
                {
                    if (dm.EsPasado) agendaPasadaVega = agenda;
                    if (dm.EsHoy) agendaHoyVega = agenda;
                }
                else if (prof.Cuil == "27289990001")
                {
                    if (dm.EsPasado) agendaPasadaCastro = agenda;
                    if (dm.EsHoy) agendaHoyCastro = agenda;
                }
                else if (prof.Cuil == "27223344551")
                {
                    if (dm.EsPasado) agendaPasadaGomez = agenda;
                }

                // Generar agenda en sede secundaria si corresponde para ese día
                if (atiendeSecundariaHoy)
                {
                    var secondaryCuit = pd.ConsultoriosCuits[1];
                    var agendaSec = db.Agendas.Include(a => a.Turnos).FirstOrDefault(a =>
                        a.ProfesionalCuil == prof.Cuil &&
                        a.ConsultorioCuit == secondaryCuit &&
                        a.Dia == dm.Fecha.Day &&
                        a.Mes == dm.Fecha.Month &&
                        a.Anio == dm.Fecha.Year);

                    if (agendaSec == null)
                    {
                        var horaInicioSec = new TimeSpan(16, 30, 0);
                        var horaFinSec = new TimeSpan(20, 30, 0);
                        agendaSec = new Agenda
                        {
                            ProfesionalCuil = prof.Cuil,
                            ConsultorioCuit = secondaryCuit,
                            Dia = dm.Fecha.Day,
                            Mes = dm.Fecha.Month,
                            Anio = dm.Fecha.Year,
                            HoraEntrada = horaInicioSec,
                            HoraSalida = horaFinSec
                        };
                        db.Agendas.Add(agendaSec);
                        db.SaveChanges();

                        var turnosSec = new List<Turno>();
                        var cur = horaInicioSec;
                        while (cur < horaFinSec)
                        {
                            var f = cur.Add(TimeSpan.FromMinutes(30));
                            turnosSec.Add(new Turno
                            {
                                AgendaId = agendaSec.Id,
                                Fecha = dm.Fecha.Date,
                                HoraInicio = cur,
                                HoraFin = f,
                                Estado = EstadoTurno.Disponible
                            });
                            cur = f;
                        }
                        db.Turnos.AddRange(turnosSec);
                        db.SaveChanges();
                    }
                }
            }
        }

        // 11. Vinculación de Asistentes a Agendas de sus Sedes (RF-ASI-02)
        // Lucía Fernández -> Sede Central (30546789101)
        foreach (var ag in agendasSedeCentral)
        {
            if (!db.AsistenteAgendas.Any(aa => aa.AsistenteCuil == "27111111111" && aa.AgendaId == ag.Id))
            {
                db.AsistenteAgendas.Add(new AsistenteAgenda
                {
                    AsistenteCuil = "27111111111",
                    AgendaId = ag.Id
                });
            }
        }

        // Gonzalo Romero -> Sede Sarmiento (30612345601)
        foreach (var ag in agendasSedeSarmiento)
        {
            if (!db.AsistenteAgendas.Any(aa => aa.AsistenteCuil == "20222222223" && aa.AgendaId == ag.Id))
            {
                db.AsistenteAgendas.Add(new AsistenteAgenda
                {
                    AsistenteCuil = "20222222223",
                    AgendaId = ag.Id
                });
            }
        }

        // Paula Rivas -> Sede Instituto de Diagnóstico por Imágenes - Clínica Mayo (30555666701)
        foreach (var ag in agendasSedeMayo)
        {
            if (!db.AsistenteAgendas.Any(aa => aa.AsistenteCuil == "27333333334" && aa.AgendaId == ag.Id))
            {
                db.AsistenteAgendas.Add(new AsistenteAgenda
                {
                    AsistenteCuil = "27333333334",
                    AgendaId = ag.Id
                });
            }
        }
        db.SaveChanges();

        // 12. Escenarios Clínicos Pre-cargados para Todos los Roles e Instituciones

        // ==========================================
        // A. SANATORIO 9 DE JULIO (Dr. Carlos Pérez - Cardiología)
        // ==========================================
        if (agendaPasadaCarlos != null)
        {
            var turnosPasados = db.Turnos
                .Where(t => t.AgendaId == agendaPasadaCarlos.Id)
                .AsEnumerable()
                .OrderBy(t => t.HoraInicio)
                .ToList();

            // Cita 1: Atendida CON Cuestionario (para calificar con 5 estrellas al Dr. Pérez en el buscador)
            var turnoCita1 = turnosPasados.FirstOrDefault(t => t.HoraInicio == new TimeSpan(9, 0, 0)) ?? turnosPasados.ElementAtOrDefault(0);
            if (turnoCita1 != null && turnoCita1.CitaId == null)
            {
                turnoCita1.Estado = EstadoTurno.Atendido;

                var cita1 = new Cita
                {
                    TurnoId = turnoCita1.Id,
                    PacienteCuil = "27000000001", // Ana García
                    Fecha = hoy.AddDays(-3),
                    Estado = EstadoCita.Atendida,
                    Tipo = TipoCita.Consulta,
                    Cobertura = CoberturaCita.ObraSocial
                };
                db.Citas.Add(cita1);
                db.SaveChanges();

                turnoCita1.CitaId = cita1.Id;

                db.Observaciones.Add(new Observacion
                {
                    CitaId = cita1.Id,
                    HistoriaClinicaId = hcPac1.Id,
                    ProfesionalCuil = "20123456789",
                    Motivo = "Consulta Cardiológica de Rutina",
                    Detalle = "Paciente normotensa (120/80 mmHg). Ritmo sinusal regular. Sin signos de insuficiencia cardíaca. Se solicita ergometría graduada de control anual."
                });

                db.Cuestionarios.Add(new Cuestionario
                {
                    CitaId = cita1.Id,
                    Puntualidad = 5,
                    Atencion = 5,
                    Profesionalismo = 5,
                    Comentario = "Excelente atención del Dr. Pérez en el Sanatorio 9 de Julio, muy claro y puntual."
                });
                db.SaveChanges();
            }

            // Cita 2: Atendida CON Cuestionario (Héctor Juárez) -> 4 estrellas para que el promedio de Carlos Pérez sea 4.5
            var turnoCita2 = turnosPasados.FirstOrDefault(t => t.HoraInicio == new TimeSpan(10, 0, 0)) ?? turnosPasados.ElementAtOrDefault(1);
            if (turnoCita2 != null && turnoCita2.CitaId == null)
            {
                turnoCita2.Estado = EstadoTurno.Atendido;

                var cita2 = new Cita
                {
                    TurnoId = turnoCita2.Id,
                    PacienteCuil = "20145556662", // Héctor Juárez
                    Fecha = hoy.AddDays(-3),
                    Estado = EstadoCita.Atendida,
                    Tipo = TipoCita.Consulta,
                    Cobertura = CoberturaCita.ObraSocial
                };
                db.Citas.Add(cita2);
                db.SaveChanges();

                turnoCita2.CitaId = cita2.Id;

                db.Observaciones.Add(new Observacion
                {
                    CitaId = cita2.Id,
                    HistoriaClinicaId = hcPac2.Id,
                    ProfesionalCuil = "20123456789",
                    Motivo = "Control de Presión y Ajuste de Medicación",
                    Detalle = "Evolución favorable. Continúa con Losartán 50mg. Se indica registro de presión domiciliaria."
                });

                db.Cuestionarios.Add(new Cuestionario
                {
                    CitaId = cita2.Id,
                    Puntualidad = 4,
                    Atencion = 4,
                    Profesionalismo = 4,
                    Comentario = "Buena atención y seguimiento adecuado del tratamiento."
                });
                db.SaveChanges();
            }

            // Cita 2b: Atendida SIN Cuestionario (Ana García) -> lista para que Ana García califique desde la interfaz
            var turnoCita2b = turnosPasados.FirstOrDefault(t => t.HoraInicio == new TimeSpan(11, 0, 0)) ?? turnosPasados.ElementAtOrDefault(2);
            if (turnoCita2b != null && turnoCita2b.CitaId == null)
            {
                turnoCita2b.Estado = EstadoTurno.Atendido;

                var cita2b = new Cita
                {
                    TurnoId = turnoCita2b.Id,
                    PacienteCuil = "27000000001", // Ana García
                    Fecha = hoy.AddDays(-3),
                    Estado = EstadoCita.Atendida,
                    Tipo = TipoCita.Consulta,
                    Cobertura = CoberturaCita.ObraSocial
                };
                db.Citas.Add(cita2b);
                db.SaveChanges();

                turnoCita2b.CitaId = cita2b.Id;

                db.Observaciones.Add(new Observacion
                {
                    CitaId = cita2b.Id,
                    HistoriaClinicaId = hcPac1.Id,
                    ProfesionalCuil = "20123456789",
                    Motivo = "Evaluación Cardiológica Post-Tratamiento",
                    Detalle = "Parámetros hemodinámicos estables. Próximo control en seis meses."
                });
                db.SaveChanges();
            }
        }

        if (agendaHoyCarlos != null)
        {
            var turnosHoy = db.Turnos
                .Where(t => t.AgendaId == agendaHoyCarlos.Id)
                .AsEnumerable()
                .OrderBy(t => t.HoraInicio)
                .ToList();

            // Cita 3 (Hoy a las 18:30): Confirmada para Ana García (lista para pasar a 'En Sala de Espera' desde Recepción)
            var turnoCita3 = turnosHoy.FirstOrDefault(t => t.HoraInicio == new TimeSpan(18, 30, 0));
            if (turnoCita3 != null && turnoCita3.CitaId == null)
            {
                turnoCita3.Estado = EstadoTurno.Reservado;

                var cita3 = new Cita
                {
                    TurnoId = turnoCita3.Id,
                    PacienteCuil = "27000000001",
                    Fecha = hoy,
                    Estado = EstadoCita.Confirmada,
                    Tipo = TipoCita.Consulta,
                    Cobertura = CoberturaCita.ObraSocial
                };
                db.Citas.Add(cita3);
                db.SaveChanges();

                turnoCita3.CitaId = cita3.Id;
                db.SaveChanges();
            }

            // Cita 4 (Hoy a las 18:00): En Sala de Espera para Héctor Juárez (lista para pasar a 'En Atención' y evolucionar RN-09)
            var turnoCita4 = turnosHoy.FirstOrDefault(t => t.HoraInicio == new TimeSpan(18, 0, 0));
            if (turnoCita4 != null && turnoCita4.CitaId == null)
            {
                turnoCita4.Estado = EstadoTurno.Reservado;

                var cita4 = new Cita
                {
                    TurnoId = turnoCita4.Id,
                    PacienteCuil = "20145556662",
                    Fecha = hoy,
                    Estado = EstadoCita.EnSalaDeEspera,
                    Tipo = TipoCita.Consulta,
                    Cobertura = CoberturaCita.ObraSocial
                };
                db.Citas.Add(cita4);
                db.SaveChanges();

                turnoCita4.CitaId = cita4.Id;
                db.SaveChanges();
            }
        }

        if (agendaFuturaCarlos != null)
        {
            var turnosFuturos = db.Turnos
                .Where(t => t.AgendaId == agendaFuturaCarlos.Id)
                .AsEnumerable()
                .OrderBy(t => t.HoraInicio)
                .ToList();

            // Cita 5: Futura Confirmada para Tomas Alvarez (20452790094) -> lista para ver en Próximas Citas o probar cancelación RN-01
            var turnoCita5 = turnosFuturos.FirstOrDefault(t => t.HoraInicio == new TimeSpan(10, 0, 0)) ?? turnosFuturos.ElementAtOrDefault(0);
            if (turnoCita5 != null && turnoCita5.CitaId == null)
            {
                turnoCita5.Estado = EstadoTurno.Reservado;

                var cita5 = new Cita
                {
                    TurnoId = turnoCita5.Id,
                    PacienteCuil = "20452790094",
                    Fecha = turnoCita5.Fecha,
                    Estado = EstadoCita.Confirmada,
                    Tipo = TipoCita.Consulta,
                    Cobertura = CoberturaCita.ObraSocial
                };
                db.Citas.Add(cita5);
                db.SaveChanges();

                turnoCita5.CitaId = cita5.Id;
                db.SaveChanges();
            }
        }

        if (agendaPasadaGomez != null)
        {
            var turnosPasados = db.Turnos
                .Where(t => t.AgendaId == agendaPasadaGomez.Id)
                .AsEnumerable()
                .OrderBy(t => t.HoraInicio)
                .ToList();

            var turnoGomez = turnosPasados.FirstOrDefault(t => t.HoraInicio == new TimeSpan(9, 0, 0)) ?? turnosPasados.ElementAtOrDefault(0);
            if (turnoGomez != null && turnoGomez.CitaId == null)
            {
                turnoGomez.Estado = EstadoTurno.Atendido;

                var citaGomez = new Cita
                {
                    TurnoId = turnoGomez.Id,
                    PacienteCuil = "23398887779", // Valentina Costilla
                    Fecha = hoy.AddDays(-3),
                    Estado = EstadoCita.Atendida,
                    Tipo = TipoCita.Consulta,
                    Cobertura = CoberturaCita.ObraSocial
                };
                db.Citas.Add(citaGomez);
                db.SaveChanges();

                turnoGomez.CitaId = citaGomez.Id;

                db.Observaciones.Add(new Observacion
                {
                    CitaId = citaGomez.Id,
                    HistoriaClinicaId = hcPac3.Id,
                    ProfesionalCuil = "27223344551",
                    Motivo = "Chequeo Cardiológico Preventivo",
                    Detalle = "Examen cardiovascular dentro de límites normales. Se sugiere actividad física regular."
                });

                db.Cuestionarios.Add(new Cuestionario
                {
                    CitaId = citaGomez.Id,
                    Puntualidad = 3,
                    Atencion = 4,
                    Profesionalismo = 3,
                    Comentario = "Atención médica aceptable pero hubo bastante demora en la sala de espera."
                });
                db.SaveChanges();
            }
        }

        // ==========================================
        // B. SANATORIO MODELO (Dr. Fernando Morales - Traumatología)
        // ==========================================
        if (agendaPasadaMorales != null)
        {
            var turnosPasados = db.Turnos
                .Where(t => t.AgendaId == agendaPasadaMorales.Id)
                .AsEnumerable()
                .OrderBy(t => t.HoraInicio)
                .ToList();

            // Cita 6: Atendida con Cuestionario (Valentina Costilla) -> Calificación al Dr. Morales
            var turnoCita6 = turnosPasados.FirstOrDefault(t => t.HoraInicio == new TimeSpan(9, 0, 0)) ?? turnosPasados.ElementAtOrDefault(0);
            if (turnoCita6 != null && turnoCita6.CitaId == null)
            {
                turnoCita6.Estado = EstadoTurno.Atendido;

                var cita6 = new Cita
                {
                    TurnoId = turnoCita6.Id,
                    PacienteCuil = "23398887779",
                    Fecha = hoy.AddDays(-3),
                    Estado = EstadoCita.Atendida,
                    Tipo = TipoCita.Consulta,
                    Cobertura = CoberturaCita.Particular
                };
                db.Citas.Add(cita6);
                db.SaveChanges();

                turnoCita6.CitaId = cita6.Id;

                db.Observaciones.Add(new Observacion
                {
                    CitaId = cita6.Id,
                    HistoriaClinicaId = hcPac3.Id,
                    ProfesionalCuil = "20284445551",
                    Motivo = "Traumatismo en Rodilla Izquierda",
                    Detalle = "Se constata leve derrame articular sin bostezo lateral. Se solicita resonancia magnética y reposo deportivo."
                });

                db.Cuestionarios.Add(new Cuestionario
                {
                    CitaId = cita6.Id,
                    Puntualidad = 5,
                    Atencion = 5,
                    Profesionalismo = 5,
                    Comentario = "Excelente atención del traumatólogo Dr. Morales en el Sanatorio Modelo."
                });
                db.SaveChanges();
            }

            // Cita 7: Atendida SIN Cuestionario para Tomas Alvarez (20452790094) -> Tomas puede calificar la atención
            var turnoCita7 = turnosPasados.FirstOrDefault(t => t.HoraInicio == new TimeSpan(10, 0, 0)) ?? turnosPasados.ElementAtOrDefault(1);
            if (turnoCita7 != null && turnoCita7.CitaId == null)
            {
                turnoCita7.Estado = EstadoTurno.Atendido;

                var cita7 = new Cita
                {
                    TurnoId = turnoCita7.Id,
                    PacienteCuil = "20452790094",
                    Fecha = hoy.AddDays(-3),
                    Estado = EstadoCita.Atendida,
                    Tipo = TipoCita.Consulta,
                    Cobertura = CoberturaCita.ObraSocial
                };
                db.Citas.Add(cita7);
                db.SaveChanges();

                turnoCita7.CitaId = cita7.Id;

                db.Observaciones.Add(new Observacion
                {
                    CitaId = cita7.Id,
                    HistoriaClinicaId = hcPac4.Id,
                    ProfesionalCuil = "20284445551",
                    Motivo = "Control de Esguince de Tobillo",
                    Detalle = "Evolución favorable. Sin dolor a la palpación del ligamento peroneo astragalino. Alta traumatológica."
                });
                db.SaveChanges();
            }
        }

        if (agendaHoyMorales != null)
        {
            var turnosHoy = db.Turnos
                .Where(t => t.AgendaId == agendaHoyMorales.Id)
                .AsEnumerable()
                .OrderBy(t => t.HoraInicio)
                .ToList();

            // Cita 8 (Hoy a las 18:30): Confirmada para Valentina Costilla -> Gonzalo Romero puede marcar llegada en Sanatorio Modelo
            var turnoCita8 = turnosHoy.FirstOrDefault(t => t.HoraInicio == new TimeSpan(18, 30, 0));
            if (turnoCita8 != null && turnoCita8.CitaId == null)
            {
                turnoCita8.Estado = EstadoTurno.Reservado;

                var cita8 = new Cita
                {
                    TurnoId = turnoCita8.Id,
                    PacienteCuil = "23398887779",
                    Fecha = hoy,
                    Estado = EstadoCita.Confirmada,
                    Tipo = TipoCita.Consulta,
                    Cobertura = CoberturaCita.Particular
                };
                db.Citas.Add(cita8);
                db.SaveChanges();

                turnoCita8.CitaId = cita8.Id;
                db.SaveChanges();
            }

            // Cita 9 (Hoy a las 18:00): En Sala de Espera para Tomas Alvarez -> Dr. Morales puede atenderlo y evolucionar
            var turnoCita9 = turnosHoy.FirstOrDefault(t => t.HoraInicio == new TimeSpan(18, 0, 0));
            if (turnoCita9 != null && turnoCita9.CitaId == null)
            {
                turnoCita9.Estado = EstadoTurno.Reservado;

                var cita9 = new Cita
                {
                    TurnoId = turnoCita9.Id,
                    PacienteCuil = "20452790094",
                    Fecha = hoy,
                    Estado = EstadoCita.EnSalaDeEspera,
                    Tipo = TipoCita.Consulta,
                    Cobertura = CoberturaCita.ObraSocial
                };
                db.Citas.Add(cita9);
                db.SaveChanges();

                turnoCita9.CitaId = cita9.Id;
                db.SaveChanges();
            }
        }

        // ==========================================
        // C. CLÍNICA MAYO (Dr. Esteban Vega y Dra. Gabriela Castro - Diagnóstico por Imágenes)
        // ==========================================
        var estEcoAbdominal = allEstudios.FirstOrDefault(e => e.Nombre.Contains("Abdominal"));
        var estEcoTiroides = allEstudios.FirstOrDefault(e => e.Nombre.Contains("tiroides"));
        var estDopplerFetal = allEstudios.FirstOrDefault(e => e.Nombre.Contains("Doppler fetal"));

        if (agendaPasadaVega != null && estEcoAbdominal != null)
        {
            var turnosPasados = db.Turnos
                .Where(t => t.AgendaId == agendaPasadaVega.Id)
                .AsEnumerable()
                .OrderBy(t => t.HoraInicio)
                .ToList();

            // Cita 10: Atendida de Estudio CON Cuestionario (Héctor Juárez) -> Calificación al Dr. Esteban Vega en Clínica Mayo
            var turnoCita10 = turnosPasados.FirstOrDefault(t => t.HoraInicio == new TimeSpan(16, 0, 0)) ?? turnosPasados.ElementAtOrDefault(0);
            if (turnoCita10 != null && turnoCita10.CitaId == null)
            {
                turnoCita10.Estado = EstadoTurno.Atendido;

                var cita10 = new Cita
                {
                    TurnoId = turnoCita10.Id,
                    PacienteCuil = "20145556662",
                    Fecha = hoy.AddDays(-3),
                    Estado = EstadoCita.Atendida,
                    Tipo = TipoCita.Estudio,
                    EstudioId = estEcoAbdominal.Id,
                    Cobertura = CoberturaCita.ObraSocial
                };
                db.Citas.Add(cita10);
                db.SaveChanges();

                turnoCita10.CitaId = cita10.Id;

                db.Observaciones.Add(new Observacion
                {
                    CitaId = cita10.Id,
                    HistoriaClinicaId = hcPac2.Id,
                    ProfesionalCuil = "20258889991",
                    Motivo = "Estudio Diagnóstico: Ecografía Abdominal Completa",
                    Detalle = "Hígado de tamaño conservado, parénquima homogéneo. Vesícula alitiásica. Vía biliar intra y extrahepática normal. Bazo y riñones sin anomalías ecográficas."
                });

                db.Cuestionarios.Add(new Cuestionario
                {
                    CitaId = cita10.Id,
                    Puntualidad = 5,
                    Atencion = 5,
                    Profesionalismo = 5,
                    Comentario = "Excelente atención del Dr. Vega en el Instituto de Diagnóstico de Clínica Mayo."
                });
                db.SaveChanges();
            }
        }

        if (agendaHoyVega != null && estEcoTiroides != null)
        {
            var turnosHoy = db.Turnos
                .Where(t => t.AgendaId == agendaHoyVega.Id)
                .AsEnumerable()
                .OrderBy(t => t.HoraInicio)
                .ToList();

            // Cita 11 (Hoy a las 17:30): Confirmada de Estudio para Ana García -> Paula Rivas puede marcar llegada en recepción de Clínica Mayo
            var turnoCita11 = turnosHoy.FirstOrDefault(t => t.HoraInicio == new TimeSpan(17, 30, 0));
            if (turnoCita11 != null && turnoCita11.CitaId == null)
            {
                turnoCita11.Estado = EstadoTurno.Reservado;

                var cita11 = new Cita
                {
                    TurnoId = turnoCita11.Id,
                    PacienteCuil = "27000000001",
                    Fecha = hoy,
                    Estado = EstadoCita.Confirmada,
                    Tipo = TipoCita.Estudio,
                    EstudioId = estEcoTiroides.Id,
                    Cobertura = CoberturaCita.ObraSocial
                };
                db.Citas.Add(cita11);
                db.SaveChanges();

                turnoCita11.CitaId = cita11.Id;
                db.SaveChanges();
            }

            // Cita 12 (Hoy a las 17:00): En Sala de Espera de Estudio para Héctor Juárez -> Dr. Vega puede iniciar estudio y cargar informe
            var turnoCita12 = turnosHoy.FirstOrDefault(t => t.HoraInicio == new TimeSpan(17, 0, 0));
            if (turnoCita12 != null && turnoCita12.CitaId == null)
            {
                turnoCita12.Estado = EstadoTurno.Reservado;

                var cita12 = new Cita
                {
                    TurnoId = turnoCita12.Id,
                    PacienteCuil = "20145556662",
                    Fecha = hoy,
                    Estado = EstadoCita.EnSalaDeEspera,
                    Tipo = TipoCita.Estudio,
                    EstudioId = estEcoAbdominal?.Id,
                    Cobertura = CoberturaCita.ObraSocial
                };
                db.Citas.Add(cita12);
                db.SaveChanges();

                turnoCita12.CitaId = cita12.Id;
                db.SaveChanges();
            }
        }

        if (agendaPasadaCastro != null && estDopplerFetal != null)
        {
            var turnosPasados = db.Turnos
                .Where(t => t.AgendaId == agendaPasadaCastro.Id)
                .AsEnumerable()
                .OrderBy(t => t.HoraInicio)
                .ToList();

            // Cita 13: Atendida de Estudio SIN Cuestionario (Valentina Costilla) -> Valentina puede calificar a la Dra. Castro
            var turnoCita13 = turnosPasados.FirstOrDefault(t => t.HoraInicio == new TimeSpan(9, 0, 0)) ?? turnosPasados.ElementAtOrDefault(0);
            if (turnoCita13 != null && turnoCita13.CitaId == null)
            {
                turnoCita13.Estado = EstadoTurno.Atendido;

                var cita13 = new Cita
                {
                    TurnoId = turnoCita13.Id,
                    PacienteCuil = "23398887779",
                    Fecha = hoy.AddDays(-3),
                    Estado = EstadoCita.Atendida,
                    Tipo = TipoCita.Estudio,
                    EstudioId = estDopplerFetal.Id,
                    Cobertura = CoberturaCita.Particular
                };
                db.Citas.Add(cita13);
                db.SaveChanges();

                turnoCita13.CitaId = cita13.Id;

                db.Observaciones.Add(new Observacion
                {
                    CitaId = cita13.Id,
                    HistoriaClinicaId = hcPac3.Id,
                    ProfesionalCuil = "27289990001",
                    Motivo = "Estudio Diagnóstico: Doppler Fetal",
                    Detalle = "Flujometría doppler obstétrica normal. Relación cerebro-placentaria adecuada. Frecuencia cardíaca fetal rítmica en 142 lpm."
                });

                db.Cuestionarios.Add(new Cuestionario
                {
                    CitaId = cita13.Id,
                    Puntualidad = 4,
                    Atencion = 5,
                    Profesionalismo = 4,
                    Comentario = "Muy buena predisposición de la Dra. Castro durante la ecografía Doppler."
                });
                db.SaveChanges();
            }
        }

        if (agendaHoyCastro != null && estDopplerFetal != null)
        {
            var turnosHoy = db.Turnos
                .Where(t => t.AgendaId == agendaHoyCastro.Id)
                .AsEnumerable()
                .OrderBy(t => t.HoraInicio)
                .ToList();

            // Cita 14 (Hoy a las 18:30): Confirmada de Estudio para Tomas Alvarez -> Paula Rivas puede gestionar en Clínica Mayo
            var turnoCita14 = turnosHoy.FirstOrDefault(t => t.HoraInicio == new TimeSpan(18, 30, 0));
            if (turnoCita14 != null && turnoCita14.CitaId == null)
            {
                turnoCita14.Estado = EstadoTurno.Reservado;

                var cita14 = new Cita
                {
                    TurnoId = turnoCita14.Id,
                    PacienteCuil = "20452790094",
                    Fecha = hoy,
                    Estado = EstadoCita.Confirmada,
                    Tipo = TipoCita.Estudio,
                    EstudioId = estEcoAbdominal?.Id ?? estDopplerFetal.Id,
                    Cobertura = CoberturaCita.ObraSocial
                };
                db.Citas.Add(cita14);
                db.SaveChanges();

                turnoCita14.CitaId = cita14.Id;
                db.SaveChanges();
            }
        }

        // RNF-SEG-01: Garantizar que el 100% de las contraseñas en base de datos estén almacenadas con hash criptográfico (PBKDF2-SHA256) y nunca en texto plano
        var usuariosSinHash = db.Usuarios
            .AsEnumerable()
            .Where(u => !TempusCare.Api.Infrastructure.Auth.PasswordSecurity.IsHashed(u.Contrasena))
            .ToList();

        if (usuariosSinHash.Count > 0)
        {
            foreach (var u in usuariosSinHash)
            {
                u.Contrasena = TempusCare.Api.Infrastructure.Auth.PasswordSecurity.HashPassword(u.Contrasena);
            }
            db.SaveChanges();
        }

        // RNF-SEG-06 (Ley 25.326): Garantizar el cifrado AES-256 en reposo de todas las Historias Clínicas y Observaciones existentes
        var historiasExistentes = db.HistoriasClinicas.ToList();
        foreach (var hc in historiasExistentes)
        {
            db.Entry(hc).Property(h => h.Discapacidad).IsModified = true;
            db.Entry(hc).Property(h => h.Alergias).IsModified = true;
            db.Entry(hc).Property(h => h.EnfermedadesCronicas).IsModified = true;
            db.Entry(hc).Property(h => h.Medicamentos).IsModified = true;
        }

        var observacionesExistentes = db.Observaciones.ToList();
        foreach (var obs in observacionesExistentes)
        {
            db.Entry(obs).Property(o => o.Motivo).IsModified = true;
            db.Entry(obs).Property(o => o.Detalle).IsModified = true;
        }

        if (historiasExistentes.Count > 0 || observacionesExistentes.Count > 0)
        {
            db.SaveChanges();
        }
    }
}
