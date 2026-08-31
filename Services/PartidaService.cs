using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SuperLiga.Api.Data;
using SuperLiga.Api.Models;

namespace SuperLiga.Api.Services;

public record PontoEvento(int TimeId, int JogadorId, string Tipo, byte Set, int PontosTimeA, int PontosTimeB, DateTime DataUtc);
public record CartaoRegistro(int TimeId, int JogadorId, string Tipo, byte Set, DateTime DataUtc);

public class EstadoJogo
{
    public int RotacaoTimeA { get; set; }
    public int RotacaoTimeB { get; set; }
    public int? TimeSacandoId { get; set; }
    public DateTime InicioUtc { get; set; }
    public DateTime? FimUtc { get; set; }
    public string Fase { get; set; } = "Classificatória";
    public List<PontoEvento> Pontos { get; set; } = [];
    public List<CartaoRegistro> Cartoes { get; set; } = [];
}

public class PartidaService(SuperLigaDbContext db)
{
    public static EstadoJogo Estado(Partida p)
    {
        try { return JsonSerializer.Deserialize<EstadoJogo>(p.EstadoJogoJson) ?? new(); }
        catch { return new(); }
    }

    public async Task<Partida> Alterar(int id, int timeId, int delta, string? tipo, int? jogadorId, CancellationToken ct)
    {
        var p = await db.Partidas.Include(x => x.Sets).SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        if (p.Status == StatusPartida.Finalizada) throw new InvalidOperationException("Partida já finalizada.");
        if (timeId != p.TimeAId && timeId != p.TimeBId) throw new InvalidOperationException("Time inválido.");
        if (delta is not (1 or -1)) throw new InvalidOperationException("Delta deve ser +1 ou -1.");
        var set = p.Sets.Single(x => !x.Finalizado);
        var estado = Estado(p);

        if (delta == 1)
        {
            if (tipo is not ("Saque" or "Normal")) throw new InvalidOperationException("Informe o tipo do ponto.");
            if (estado.TimeSacandoId.HasValue && estado.TimeSacandoId != timeId)
            {
                if (timeId == p.TimeAId) estado.RotacaoTimeA = (estado.RotacaoTimeA + 1) % 6;
                else estado.RotacaoTimeB = (estado.RotacaoTimeB + 1) % 6;
            }
            var ids = JsonSerializer.Deserialize<int[]>(timeId == p.TimeAId ? p.EscalacaoTimeAJson : p.EscalacaoTimeBJson) ?? [];
            var rotacao = timeId == p.TimeAId ? estado.RotacaoTimeA : estado.RotacaoTimeB;
            int[] ciclo = [1, 6, 5, 4, 3, 2];
            var origemDaPosicaoUm = ciclo[(0 - rotacao + 6) % 6];
            var sacador = ids.Length == 6 ? ids[origemDaPosicaoUm - 1] : 0;
            if (tipo == "Saque") jogadorId = sacador;
            else if (estado.Fase == "Final" && (!jogadorId.HasValue || !ids.Contains(jogadorId.Value)))
                throw new InvalidOperationException("Selecione quem fez o ponto.");
            else if (estado.Fase != "Final") jogadorId = 0;
            estado.TimeSacandoId = timeId;
            if (timeId == p.TimeAId) set.PontosTimeA++; else set.PontosTimeB++;
            estado.Pontos.Add(new(timeId, jogadorId ?? 0, tipo, set.Numero, set.PontosTimeA, set.PontosTimeB, DateTime.UtcNow));
        }
        else
        {
            var ultimo = estado.Pontos.LastOrDefault(x => x.TimeId == timeId && x.Set == set.Numero)
                ?? throw new InvalidOperationException("Não existe ponto deste time para remover.");
            estado.Pontos.Remove(ultimo);
            if (timeId == p.TimeAId) set.PontosTimeA = Math.Max(0, set.PontosTimeA - 1);
            else set.PontosTimeB = Math.Max(0, set.PontosTimeB - 1);
            estado.TimeSacandoId = estado.Pontos.LastOrDefault()?.TimeId;
        }

        const int alvo = 25;
        if (Math.Max(set.PontosTimeA, set.PontosTimeB) >= alvo && Math.Abs(set.PontosTimeA - set.PontosTimeB) >= 2)
        {
            set.Finalizado = true;
            var setsA = p.Sets.Count(x => x.Finalizado && x.PontosTimeA > x.PontosTimeB);
            var setsB = p.Sets.Count(x => x.Finalizado && x.PontosTimeB > x.PontosTimeA);
            if (setsA == 3 || setsB == 3)
            {
                p.Status = StatusPartida.Finalizada;
                p.VencedorId = setsA == 3 ? p.TimeAId : p.TimeBId;
                estado.FimUtc = DateTime.UtcNow;
            }
            else
            {
                p.Sets.Add(new() { Numero = (byte)(set.Numero + 1) });
                estado.TimeSacandoId = null;
            }
        }
        p.EstadoJogoJson = JsonSerializer.Serialize(estado);
        await db.SaveChangesAsync(ct);
        return p;
    }

    public async Task<Partida> AplicarCartao(int id, int timeId, int jogadorId, string tipo, CancellationToken ct)
    {
        var p = await db.Partidas.Include(x => x.Sets).Include(x => x.TimeA).ThenInclude(x => x.Jogadores)
            .Include(x => x.TimeB).ThenInclude(x => x.Jogadores).SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        if (p.Status == StatusPartida.Finalizada) throw new InvalidOperationException("Partida já finalizada.");
        var time = timeId == p.TimeAId ? p.TimeA : timeId == p.TimeBId ? p.TimeB : null;
        if (time is null || time.Jogadores.All(x => x.Id != jogadorId)) throw new InvalidOperationException("Jogador inválido.");
        if (tipo is not ("Amarelo" or "Vermelho")) throw new InvalidOperationException("Cartão inválido.");
        var estado = Estado(p);
        estado.Cartoes.Add(new(timeId, jogadorId, tipo, p.Sets.Single(x => !x.Finalizado).Numero, DateTime.UtcNow));
        p.EstadoJogoJson = JsonSerializer.Serialize(estado);
        await db.SaveChangesAsync(ct);
        return p;
    }
}
