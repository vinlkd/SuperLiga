using System.ComponentModel.DataAnnotations;
namespace SuperLiga.Api.Models;
public enum Posicao { Levantador=1, Atacante=2 }
public enum StatusPartida { EmAndamento=1, Finalizada }
public class Time { public int Id {get;set;} [MaxLength(80)] public string Nome {get;set;}=""; public string NomeNormalizado {get;set;}=""; public byte[]? Logo {get;set;} public string? LogoTipo {get;set;} public List<Jogador> Jogadores {get;set;}=[]; }
public class Jogador { public int Id {get;set;} public string Nome {get;set;}=""; public string NomeNormalizado {get;set;}=""; public byte NumeroCamisa {get;set;} public Posicao Posicao {get;set;} public int TimeId {get;set;} public Time Time {get;set;}=null!; }
public class Partida { public int Id {get;set;} public int TimeAId {get;set;} public Time TimeA {get;set;}=null!; public int TimeBId {get;set;} public Time TimeB {get;set;}=null!; public StatusPartida Status {get;set;}=StatusPartida.EmAndamento; public int? VencedorId {get;set;} public string EscalacaoTimeAJson {get;set;}="[]"; public string EscalacaoTimeBJson {get;set;}="[]"; public string SubstituicoesJson {get;set;}="[]"; public string EstadoJogoJson {get;set;}="{}"; public List<SetPartida> Sets {get;set;}=[]; }
public class SetPartida { public int Id {get;set;} public int PartidaId {get;set;} public Partida Partida {get;set;}=null!; public byte Numero {get;set;} public int PontosTimeA {get;set;} public int PontosTimeB {get;set;} public bool Finalizado {get;set;} }
