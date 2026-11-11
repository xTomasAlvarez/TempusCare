using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TempusCare.Api.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVisitasPerfil : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Observaciones_Citas_CitaId",
                table: "Observaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Observaciones_HistoriasClinicas_HistoriaClinicaId",
                table: "Observaciones");

            migrationBuilder.AddColumn<int>(
                name: "VisitasPerfil",
                table: "Instituciones",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "VisitasPerfil",
                table: "Consultorios",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "SolicitudesSuperAdmin",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    EmailPropuesto = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    ProponenteId = table.Column<int>(type: "INTEGER", nullable: false),
                    AprobadorId = table.Column<int>(type: "INTEGER", nullable: true),
                    Estado = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "TEXT", nullable: false),
                    FechaResolucion = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SolicitudesSuperAdmin", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SolicitudesSuperAdmin_Usuarios_AprobadorId",
                        column: x => x.AprobadorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SolicitudesSuperAdmin_Usuarios_ProponenteId",
                        column: x => x.ProponenteId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudesSuperAdmin_AprobadorId",
                table: "SolicitudesSuperAdmin",
                column: "AprobadorId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudesSuperAdmin_ProponenteId",
                table: "SolicitudesSuperAdmin",
                column: "ProponenteId");

            migrationBuilder.AddForeignKey(
                name: "FK_Observaciones_Citas_CitaId",
                table: "Observaciones",
                column: "CitaId",
                principalTable: "Citas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Observaciones_HistoriasClinicas_HistoriaClinicaId",
                table: "Observaciones",
                column: "HistoriaClinicaId",
                principalTable: "HistoriasClinicas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Observaciones_Citas_CitaId",
                table: "Observaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Observaciones_HistoriasClinicas_HistoriaClinicaId",
                table: "Observaciones");

            migrationBuilder.DropTable(
                name: "SolicitudesSuperAdmin");

            migrationBuilder.DropColumn(
                name: "VisitasPerfil",
                table: "Instituciones");

            migrationBuilder.DropColumn(
                name: "VisitasPerfil",
                table: "Consultorios");

            migrationBuilder.AddForeignKey(
                name: "FK_Observaciones_Citas_CitaId",
                table: "Observaciones",
                column: "CitaId",
                principalTable: "Citas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Observaciones_HistoriasClinicas_HistoriaClinicaId",
                table: "Observaciones",
                column: "HistoriaClinicaId",
                principalTable: "HistoriasClinicas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
