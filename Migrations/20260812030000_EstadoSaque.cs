using Microsoft.EntityFrameworkCore.Infrastructure;using Microsoft.EntityFrameworkCore.Migrations;using SuperLiga.Api.Data;
#nullable disable
namespace SuperLiga.Api.Migrations;
[DbContext(typeof(SuperLigaDbContext))][Migration("20260812030000_EstadoSaque")]
public partial class EstadoSaque:Migration{protected override void Up(MigrationBuilder m)=>m.AddColumn<string>(name:"EstadoJogoJson",table:"Partidas",type:"nvarchar(max)",nullable:false,defaultValue:"{}");protected override void Down(MigrationBuilder m)=>m.DropColumn(name:"EstadoJogoJson",table:"Partidas");}
