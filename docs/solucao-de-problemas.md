# Solução de problemas

## Aplicação não inicia

Confira `dotnet --version`: o projeto exige SDK compatível com net10.0. Execute `dotnet restore` e `dotnet build`. Se a falha ocorrer durante Migrate(), verifique SQL Server, conexão e permissões da conta.

## SQL Server indisponível

Confirme o nome da instância e a chave ConnectionStrings:SuperLiga. A autenticação integrada usa a identidade do processo; outra conta ou máquina pode não ter as mesmas permissões.

## Porta ocupada ou executável bloqueado

Encerre a instância anterior com Ctrl+C. Os perfis locais usam 5233 e 7023. Não encerre processos desconhecidos apenas para liberar a porta.

## Cadastro recusado

Confira nomes duplicados, camisa de 0 a 99, limite de 12 jogadores e tamanho da imagem. Para iniciar jogo, confira seis titulares distintos com a composição 4x2.

## Placar sem conexão

Confira se a API está em execução e se o ID da partida existe. Em outro dispositivo, substitua localhost pelo endereço acessível do servidor e confira a configuração de rede.

## Banco vazio depois de trocar configuração

Confira servidor e nome do banco antes de inserir novamente os dados. A configuração pode estar apontando para uma base diferente. Não apague migrations ou bancos para resolver esse diagnóstico.
