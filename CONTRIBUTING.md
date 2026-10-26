# Contribuir

Crie uma branch para a alteração e mantenha cada commit focado em um assunto. Descreva o comportamento alterado e os passos usados para conferir o resultado.

## Verificação básica

```powershell
dotnet restore
dotnet build --no-restore
node --check wwwroot/js/app.js
node --check wwwroot/js/placar.js
```

Os comandos Node verificam sintaxe e exigem Node.js instalado; não substituem a verificação no navegador. O repositório não possui uma suíte automatizada de testes neste estado.

Para mudanças funcionais, use um banco separado e confira o fluxo afetado: cadastro de equipes, elenco, súmula, pontos, substituições, finalização e placar público. Não use dados de produção para testes de exclusão.

Ao alterar entidades, inclua a migration correspondente e revise o efeito sobre os dados existentes. Não versione senhas, credenciais ou backups SQL. Atualize a documentação quando mudar regras, rotas ou requisitos.

A aplicação atual não tem autenticação. Uma publicação aberta exige tratar os controles de acesso antes de permitir operações de escrita a usuários externos.
