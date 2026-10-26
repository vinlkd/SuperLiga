# API

Prefixo: /api. A API atual não exige autenticação. Cadastros de time usam multipart/form-data; operações com objetos de entrada usam JSON.

| Método | Caminho após /api | Uso |
| --- | --- | --- |
| GET, POST | /times | Listar ou criar times |
| GET, PUT, DELETE | /times/{id} | Consultar, editar ou excluir time |
| GET | /times/{id}/logo | Obter imagem |
| POST | /times/{timeId}/jogadores | Adicionar jogador |
| PUT, DELETE | /jogadores/{id} | Editar ou excluir jogador |
| GET | /times/{id}/rotacao | Consultar escalação sugerida |
| POST | /partidas | Criar partida com súmula |
| GET | /partidas/em-andamento | Listar jogos em andamento |
| GET | /partidas/{id} | Consultar partida |
| GET | /partidas/{id}/placar-publico | Consultar exibição pública |
| POST | /partidas/{id}/pontos | Ajustar pontuação |
| POST | /partidas/{id}/cartoes | Registrar cartão |
| POST | /partidas/{id}/substituicoes | Substituir titular |
| GET, POST | /partidas/historico | Listar ou registrar resultados |
| GET | /classificacao | Consultar classificação |

Exemplo de cadastro de jogador:

```json
{"nome":"Jogador exemplo","numeroCamisa":7,"posicao":1}
```

Posição: 1 = Levantador, 2 = Atacante. Para pontuar, envie timeId, delta (+1 ou −1), tipo (Saque ou Normal, obrigatório ao adicionar) e jogadorId opcional. Consulte os records de entrada em Controllers/SuperLigaController.cs para os demais formatos.

As rotas retornam 400 para entradas rejeitadas, 404 para registros ausentes e 409 para conflitos tratados, conforme a operação. Algumas mensagens de erro são texto; não presuma JSON em todas as respostas.
