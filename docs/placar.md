# Placar público

Durante uma partida, abra Conectar placar para copiar o endereço de exibição:

```text
http://localhost:5233/placar.html?partida=1
```

Substitua 1 pelo identificador da partida. A interface gera o link automaticamente com a origem atual. A página exibe nomes, pontos, sets, fase e situação da partida, com botão de tela cheia.

O navegador consulta GET /api/partidas/{id}/placar-publico e aguarda 1,5 segundo após cada tentativa para atualizar novamente. Isso é consulta periódica, não transmissão instantânea por WebSocket.

Se perder acesso à API, aparece a mensagem de ausência de conexão e a página continua tentando. Um parâmetro ausente ou inválido mostra erro de link.

Em outro dispositivo, localhost aponta para o próprio dispositivo. Para exibir em uma TV ou computador da rede, é necessário configurar a aplicação para aceitar conexões de rede e usar o endereço do servidor. O projeto não configura isso automaticamente.
