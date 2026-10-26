# Dados e persistência

| Entidade | Conteúdo |
| --- | --- |
| Time | Nome, nome normalizado, imagem e elenco |
| Jogador | Nome, camisa, posição e vínculo com time |
| Partida | Equipes, status, vencedor, escalações e estado |
| SetPartida | Número do set, pontos e finalização |

Escalações, substituições e estado de jogo são armazenados em JSON na partida. O estado contém rotações, saque, fase, início/fim e eventos de pontos/cartões. Os registros de eventos usam UTC.

O contexto define índices únicos para nome de time, nome de jogador, camisa por time e número de set por partida. Posição e status são convertidos em texto no banco.

As migrations são aplicadas automaticamente ao iniciar. Antes de atualizar uma instalação com dados importantes, faça backup do SQL Server. O repositório não contém backup do banco.

Excluir um time pela API também remove suas partidas; essa operação afeta o histórico e a classificação.
