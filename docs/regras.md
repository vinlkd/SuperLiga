# Regras implementadas

Esta página descreve o código atual, sem afirmar conformidade integral com um regulamento esportivo.

- A partida termina quando uma equipe vence três sets.
- Todos os sets usam alvo de 25 pontos e diferença mínima de dois, inclusive o quinto set nesta versão.
- Ao recuperar o saque, a equipe que marcou ponto avança sua rotação, módulo seis.
- Um novo set começa com o saque sem equipe definida no estado.
- O ajuste de pontos aceita apenas +1 ou −1 e não permite alterar partida finalizada.
- Remover ponto exige um evento da equipe no set atual; a remoção não recompõe todo o histórico de rotações.
- A súmula exige dois levantadores e quatro atacantes por equipe.
- Substituições mantêm a posição do jogador que sai.
- Cartões são registrados como eventos; o serviço não aplica automaticamente penalidade de pontos.

A classificação atribui três pontos por vitória, ordena por pontos, saldo de sets e nome. Ela não implementa pontuação distinta para resultados 3×2.

O lançamento de resultado anterior gera sets de 25×20 ou 20×25. Esses valores são representativos, não as parciais originais.
