const parametros = new URLSearchParams(window.location.search);
const partidaId = Number(parametros.get("partida"));
const intervaloMs = 1500;

const elemento = (id) => document.getElementById(id);

function definirTexto(id, valor) {
  elemento(id).textContent = valor;
}

function renderizar(placar) {
  definirTexto("fase", placar.fase || "PARTIDA");
  definirTexto("nome-a", placar.timeA.nome);
  definirTexto("nome-b", placar.timeB.nome);
  definirTexto("sets-a", placar.setsTimeA);
  definirTexto("sets-b", placar.setsTimeB);
  definirTexto("pontos-a", placar.pontosTimeA);
  definirTexto("pontos-b", placar.pontosTimeB);
  definirTexto("set-atual", placar.setAtual);
  const painelA = elemento("painel-a");
  const painelB = elemento("painel-b");
  painelA.classList.toggle("winner", placar.status === 2 && placar.vencedorId === placar.timeA.timeAId);
  painelB.classList.toggle("winner", placar.status === 2 && placar.vencedorId === placar.timeB.timeBId);
  definirTexto("situacao", placar.status === 2 ? "PARTIDA ENCERRADA" : "PLACAR AO VIVO");
}

async function atualizar() {
  if (!Number.isInteger(partidaId) || partidaId <= 0) {
    elemento("placar-publico").classList.add("hidden");
    elemento("mensagem").textContent = "Link do placar inválido.";
    elemento("mensagem").classList.remove("hidden");
    return;
  }

  try {
    const resposta = await fetch(`/api/partidas/${partidaId}/placar-publico`, { cache: "no-store" });
    if (!resposta.ok) throw new Error("Não foi possível localizar a partida.");
    renderizar(await resposta.json());
    definirTexto("conexao", "Conectado");
    elemento("conexao").className = "";
  } catch (erro) {
    definirTexto("conexao", "Sem conexão — tentando novamente");
    elemento("conexao").className = "offline";
  }

  window.setTimeout(atualizar, intervaloMs);
}

elemento("tela-cheia").addEventListener("click", async () => {
  if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
  else await document.exitFullscreen();
});

atualizar();
