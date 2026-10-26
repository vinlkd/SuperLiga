# SuperLiga

Aplicação web para organizar equipes e acompanhar partidas de voleibol, com súmula 4x2, pontuação, rotações, substituições, cartões, histórico e placar público.

Desenvolvida em C#, ASP.NET Core 10, Entity Framework Core e SQL Server. A interface usa HTML, CSS e JavaScript sem framework.

## Começar

Instale o SDK .NET 10 e disponibilize um SQL Server. Na pasta do projeto, execute `dotnet restore` e `dotnet run --launch-profile http`. Abra http://localhost:5233. A conexão padrão usa autenticação integrada do Windows e o banco SuperLigaDB; as migrations são aplicadas na inicialização.

## Documentação

- [Instalação](docs/instalacao.md)
- [Configuração](docs/configuracao.md)
- [Arquitetura](docs/arquitetura.md)
- [Dados](docs/dados.md)
- [Equipes](docs/equipes.md)
- [Partidas](docs/partidas.md)
- [Placar público](docs/placar.md)
- [Regras implementadas](docs/regras.md)
- [API](docs/api.md)
- [Solução de problemas](docs/solucao-de-problemas.md)
- [Contribuição](CONTRIBUTING.md)

O projeto não implementa autenticação ou perfis de acesso. Consulte os limites documentados antes de disponibilizá-lo em uma rede pública.
