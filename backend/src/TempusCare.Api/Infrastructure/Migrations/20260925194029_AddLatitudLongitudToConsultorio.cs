using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TempusCare.Api.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLatitudLongitudToConsultorio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitud",
                table: "Consultorios",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitud",
                table: "Consultorios",
                type: "REAL",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitud",
                table: "Consultorios");

            migrationBuilder.DropColumn(
                name: "Longitud",
                table: "Consultorios");
        }
    }
}
