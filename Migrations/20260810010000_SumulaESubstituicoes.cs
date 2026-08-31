using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using SuperLiga.Api.Data;

#nullable disable

namespace SuperLiga.Api.Migrations;

[DbContext(typeof(SuperLigaDbContext))]
[Migration("20260810010000_SumulaESubstituicoes")]
public partial class SumulaESubstituicoes : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(name: "EscalacaoTimeAJson", table: "Partidas", type: "nvarchar(max)", nullable: false, defaultValue: "[]");
        migrationBuilder.AddColumn<string>(name: "EscalacaoTimeBJson", table: "Partidas", type: "nvarchar(max)", nullable: false, defaultValue: "[]");
        migrationBuilder.AddColumn<string>(name: "SubstituicoesJson", table: "Partidas", type: "nvarchar(max)", nullable: false, defaultValue: "[]");
        migrationBuilder.Sql("UPDATE Jogadores SET Posicao = 'Atacante' WHERE Posicao IN ('Oposto', 'Ponta', 'Central', 'Libero')");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "EscalacaoTimeAJson", table: "Partidas");
        migrationBuilder.DropColumn(name: "EscalacaoTimeBJson", table: "Partidas");
        migrationBuilder.DropColumn(name: "SubstituicoesJson", table: "Partidas");
    }
}
