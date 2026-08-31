using Microsoft.EntityFrameworkCore;
using SuperLiga.Api.Models;
namespace SuperLiga.Api.Data;
public class SuperLigaDbContext(DbContextOptions<SuperLigaDbContext> options) : DbContext(options)
{
    public DbSet<Time> Times => Set<Time>();
    public DbSet<Jogador> Jogadores => Set<Jogador>();
    public DbSet<Partida> Partidas => Set<Partida>();
    public DbSet<SetPartida> Sets => Set<SetPartida>();
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Time>().HasIndex(x => x.Nome).IsUnique();
        b.Entity<Jogador>().HasIndex(x => new { x.TimeId, x.NumeroCamisa }).IsUnique();
        b.Entity<Jogador>().HasIndex(x => x.Nome).IsUnique();
        b.Entity<Jogador>().Property(x => x.Posicao).HasConversion<string>();
        b.Entity<Partida>().Property(x => x.Status).HasConversion<string>();
        b.Entity<Partida>().HasOne(x => x.TimeA).WithMany().HasForeignKey(x => x.TimeAId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Partida>().HasOne(x => x.TimeB).WithMany().HasForeignKey(x => x.TimeBId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<SetPartida>().HasIndex(x => new { x.PartidaId, x.Numero }).IsUnique();
    }
}
