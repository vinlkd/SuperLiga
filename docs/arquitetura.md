# Arquitetura

A interface e a API são servidas pelo mesmo processo ASP.NET Core.

| Caminho | Responsabilidade |
| --- | --- |
| Program.cs | Registro de serviços, conexão SQL, migrations e rotas |
| Controllers/SuperLigaController.cs | Equipes, jogadores, partidas e classificação |
| Services/PartidaService.cs | Pontos, cartões e estado da partida |
| Data/SuperLigaDbContext.cs | Mapeamento e acesso via Entity Framework Core |
| Models/Domain.cs | Entidades e enumerações |
| Migrations/ | Evolução do esquema SQL |
| wwwroot/index.html | Interface de operação |
| wwwroot/js/app.js | Integração da interface com a API |
| wwwroot/placar.html | Tela de exibição do placar |

O navegador chama rotas sob /api; os controladores usam o contexto SQL e o serviço de partidas. O placar público consulta periodicamente a API. Não há WebSocket ou serviço separado de frontend.
