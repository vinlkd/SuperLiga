const q = (s) => document.querySelector(s),
  api = "/api";
let times = [],
  timeId,
  match,
  partidaPendente,
  relogioId;
async function call(u, o) {
  const r = await fetch(api + u, o);
  if (!r.ok) throw Error(await r.text());
  return r.status === 204 ? null : r.json();
}
function toast(s) {
  q("#toast").textContent = s;
  q("#toast").className = "show";
  setTimeout(() => (q("#toast").className = ""), 3500);
}
function esc(s) {
  return String(s).replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}
async function view(v) {
  document
    .querySelectorAll(".view")
    .forEach((x) => x.classList.toggle("hidden", x.id !== v));
  if (v === "home" || v === "partida" || v === "jogos") await loadTimes();
  if (v === "classificacao") await rank();
  if (v === "jogos") await loadJogos();
}
document
  .querySelectorAll("[data-view]")
  .forEach((b) => (b.onclick = () => view(b.dataset.view)));
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action], [data-close-dialog]");
  if (!button) return;
  if (button.dataset.closeDialog) return q(`#${button.dataset.closeDialog}`).close();
  const id = +button.dataset.id;
  const actions = {
    "view-team": () => roster(id),
    "edit-player": () => editarJogador(id, button.dataset.name, +button.dataset.shirt, +button.dataset.position),
    "delete-player": () => excluirJogador(id),
    "start-sheet": () => iniciarComSumula(+button.dataset.teamA, +button.dataset.teamB),
    "choose-first-serve": () => confirmarInicioPartida(+button.dataset.id),
    point: () => point(id, +button.dataset.delta),
    substitute: () => abrirSubstituicao(),
    scout: () => abrirScout(),
    "exit-match": () => sairPartida(),
  };
  actions[button.dataset.action]?.();
});
async function loadTimes() {
  times = await call("/times");
  q("#times").innerHTML = times
    .map(
      (t) =>
        `<article class="card">${t.logoUrl ? `<img src="${t.logoUrl}?v=${Date.now()}">` : '<div class="logo placeholder">SEM LOGO</div>'}<h3>${t.nome}</h3><p>${t.jogadores.length}/12 jogadores</p><button class="primary view-team" data-action="view-team" data-id="${t.id}">Visualizar</button></article>`,
    )
    .join("");
  const opts =
    '<option value="">Selecione um time</option>' +
    times.map((t) => `<option value="${t.id}">${t.nome}</option>`).join("");
  q("#time-a").innerHTML = opts;
  q("#time-b").innerHTML = opts;
}
q("#form-time").onsubmit = async (e) => {
  e.preventDefault();
  try {
    const t = await call("/times", {
      method: "POST",
      body: new FormData(e.target),
    });
    e.target.reset();
    await roster(t.id);
  } catch (x) {
    toast(x.message);
  }
};
async function roster(id) {
  timeId = id;
  await view("jogadores");
  const t = await call("/times/" + id);
  q("#nome-time").textContent = t.nome;
  q("#contador").textContent = t.jogadores.length + "/12 jogadores";
  q("#editar-time-detalhe").onclick = () => abrirEditarTime(id);
  q("#excluir-time-detalhe").onclick = () => excluirTime(id);
  q("#form-jogador button").disabled = t.jogadores.length >= 12;
  q("#lista-jogadores").innerHTML = t.jogadores
    .map(
      (j) =>
        `<div class="player"><span class="number">#${j.numeroCamisa}</span><b>${j.nome}</b><span>${["", "Levantador", "Atacante"][j.posicao]}</span><span class="row-actions"><button data-action="edit-player" data-id="${j.id}" data-name="${j.nome}" data-shirt="${j.numeroCamisa}" data-position="${j.posicao}">Editar</button><button class="danger-btn" data-action="delete-player" data-id="${j.id}">Excluir</button></span></div>`,
    )
    .join("");
}
q("#form-jogador").onsubmit = async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  try {
    await call(`/times/${timeId}/jogadores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: f.get("nome"),
        numeroCamisa: +f.get("numeroCamisa"),
        posicao: f.get("posicao") === "Levantador" ? 1 : 2,
      }),
    });
    e.target.reset();
    await roster(timeId);
  } catch (x) {
    toast(x.message);
  }
};
async function editarJogador(id, nome, camisa, posicao) {
  const f=q('#form-editar-jogador');f.elements.id.value=id;f.elements.nome.value=nome;f.elements.numeroCamisa.value=camisa;f.elements.posicao.value=posicao;q('#editar-jogador').showModal();
}
q('#form-editar-jogador').addEventListener('submit',async e=>{e.preventDefault();const f=e.target,id=f.elements.id.value;
  try {
    await call(`/jogadores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: f.elements.nome.value,
        numeroCamisa: +f.elements.numeroCamisa.value,
        posicao: +f.elements.posicao.value,
      }),
    });
    q('#editar-jogador').close();
    await roster(timeId);
    toast("Jogador atualizado.");
  } catch (x) {
    toast(x.message);
  }
});
function excluirJogador(id) {abrirConfirmacao('Excluir jogador','Tem certeza que deseja excluir este jogador?',()=>confirmarExcluirJogador(id))}
async function confirmarExcluirJogador(id) {
  try {
    await call(`/jogadores/${id}`, { method: "DELETE" });
    q('#confirmar-dialog').close();
    await roster(timeId);
    toast("Jogador excluído.");
  } catch (x) {
    toast(x.message);
  }
}
function abrirEditarTime(id) {
  const t = times.find((x) => x.id === id),
    f = q("#form-editar-time");
  f.elements.id.value = id;
  f.elements.nome.value = t.nome;
  f.elements.logo.value = "";
  q("#editar-time").showModal();
}
q("#form-editar-time").onsubmit = async (e) => {
  e.preventDefault();
  const f = new FormData(e.target),
    id = f.get("id");
  f.delete("id");
  try {
    await call(`/times/${id}`, { method: "PUT", body: f });
    q("#editar-time").close();
    await loadTimes();
    toast("Time atualizado.");
  } catch (x) {
    toast(x.message);
  }
};
async function excluirTime(id) {
  const t = times.find((x) => x.id === id);
  abrirConfirmacao('Excluir time',`Excluir ${t.nome}, seus jogadores e todas as partidas e resultados relacionados?`,()=>confirmarExcluirTime(id));
}
async function confirmarExcluirTime(id) {
  try {
    await call(`/times/${id}`, { method: "DELETE" });
    q('#confirmar-dialog').close();
    timeId = null;
    await view("home");
    toast("Time excluído.");
  } catch (x) {
    toast(x.message);
  }
}
let acaoConfirmacao=null;
function abrirConfirmacao(titulo,mensagem,acao){q('#confirmar-titulo').textContent=titulo;q('#confirmar-mensagem').textContent=mensagem;acaoConfirmacao=acao;q('#confirmar-dialog').showModal()}
q('#confirmar-acao').addEventListener('click',()=>acaoConfirmacao?.());
q("#form-partida").onsubmit = (e) => {
  e.preventDefault();
  const a = +q("#time-a").value,
    b = +q("#time-b").value;
  if (!a || !b) return toast("Selecione os dois times.");
  if (a === b) return toast("Escolha times diferentes.");
  const ta = times.find((x) => x.id === a),
    tb = times.find((x) => x.id === b);
  q("#sumula").innerHTML =
    `<div class="sheet"><h2>SÚMULA — TITULARES</h2><div class="courts">${sumulaEquipe(ta, "a")}${sumulaEquipe(tb, "b")}</div><button class="primary" data-action="start-sheet" data-team-a="${a}" data-team-b="${b}">Confirmar súmula e começar</button></div>`;
  q("#placar").innerHTML = "";
};
function sumulaEquipe(t, p) {
  const ordem = [4, 3, 2, 5, 6, 1];
  return `<section><h3>${t.nome}</h3><div class="sumula-grid">${ordem
    .map((z) => {
      const opcoes = (posicao) => t.jogadores
          .filter((j) => j.posicao === posicao)
          .sort((a, b) => a.numeroCamisa - b.numeroCamisa)
          .map(
            (j) =>
              `<option value="${j.id}">${j.numeroCamisa} — ${j.nome}</option>`,
          )
          .join("");
      return `<label><b>${["", "I", "II", "III", "IV", "V", "VI"][z]}</b><select data-sumula="${p}" data-zona="${z}"><option value="">Selecione</option><optgroup label="LEVANTADORES">${opcoes(1)}</optgroup><optgroup label="ATACANTES">${opcoes(2)}</optgroup></select></label>`;
    })
    .join("")}</div></section>`;
}
async function iniciarComSumula(a, b) {
  const ids = (p) =>
    [1, 2, 3, 4, 5, 6].map(
      (z) => +q(`[data-sumula="${p}"][data-zona="${z}"]`).value,
    );
  const ia = ids("a"),
    ib = ids("b");
  if (ia.some((x) => !x) || ib.some((x) => !x))
    return toast("Preencha as 12 posições da súmula.");
  if (new Set(ia).size !== 6 || new Set(ib).size !== 6)
    return toast("Cada jogador só pode ocupar uma posição na súmula.");
  partidaPendente = { a, b, ia, ib, fase: q('#fase-partida').value };
  const ta = times.find((x) => x.id === a),
    tb = times.find((x) => x.id === b);
  q("#primeiro-saque-times").innerHTML =
    `<button type="button" class="primary" data-action="choose-first-serve" data-id="${a}">${ta.nome}</button>` +
    `<span>OU</span>` +
    `<button type="button" class="primary" data-action="choose-first-serve" data-id="${b}">${tb.nome}</button>`;
  q("#primeiro-saque-dialog").showModal();
}
async function confirmarInicioPartida(timeSacandoId) {
  if (!partidaPendente) return;
  const { a, b, ia, ib, fase } = partidaPendente;
  try {
    match = await call("/partidas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timeAId: a,
        timeBId: b,
        titularesTimeA: ia,
        titularesTimeB: ib,
        timeSacandoId,
        fase,
      }),
    });
    q("#primeiro-saque-dialog").close();
    partidaPendente = null;
    q("#sumula").innerHTML = "";
    await score();
  } catch (x) {
    toast(x.message);
  }
}
async function point(id, delta, tipo=null, jogadorId=null) {
  if(delta===1&&!tipo){
    q('#ponto-time-id').value=id;
    const team=id===match.timeAId?match.timeA:match.timeB,
      rot=id===match.timeAId?(match.rotacaoTimeA||0):(match.rotacaoTimeB||0),
      sacando=match.timeSacandoId===id,
      ring=[1,6,5,4,3,2],origem=ring[(0-rot+6)%6],sacador=team.jogadores[origem-1],
      temScout=match.fase==='Final',jogadores=sacando?[sacador]:team.jogadores.filter(x=>x.id);
    q('#ponto-jogador-id').innerHTML=jogadores.filter(Boolean).map(x=>`<option value="${x.id}">${x.numeroCamisa} — ${x.nome}</option>`).join('');
    q('#ponto-jogador-label').classList.toggle('hidden',sacando||!temScout);
    q('#point-types').innerHTML=sacando
      ?'<button type="submit" value="Saque" class="primary">Ponto de saque</button>'
      :'<button type="submit" value="Normal" class="primary">Ponto normal</button>';
    return q('#tipo-ponto-dialog').showModal();
  }
  try {
    const atualizado = await call(`/partidas/${match.id}/pontos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timeId: id, delta, tipo, jogadorId }),
    });
    match.status = atualizado.status;
    match.vencedorId = atualizado.vencedorId;
    match.sets = atualizado.sets;
    match.rotacaoTimeA=atualizado.rotacaoTimeA;match.rotacaoTimeB=atualizado.rotacaoTimeB;match.timeSacandoId=atualizado.timeSacandoId;match.pontos=atualizado.pontos;match.cartoes=atualizado.cartoes;match.fimUtc=atualizado.fimUtc;
    renderScore();
  } catch (x) {
    toast(x.message);
  }
}
q('#form-tipo-ponto').addEventListener('submit',async e=>{e.preventDefault();const tipo=e.submitter.value,id=+q('#ponto-time-id').value,jogadorId=match.fase==='Final'||tipo==='Saque'?+q('#ponto-jogador-id').value:null;q('#tipo-ponto-dialog').close();await point(id,1,tipo,jogadorId)});
async function score() {
  match = await call("/partidas/" + match.id);
  atualizarEstadoPartida(true);
  renderScore();
}
function atualizarEstadoPartida(iniciada){q('#form-partida').classList.toggle('hidden',iniciada);q('#partida-status').textContent=iniciada?'PLACAR AO VIVO':'NOVA PARTIDA';q('#partida-titulo').textContent=iniciada?'Jogo iniciado':'Começar jogo';q('#partida-descricao').textContent=iniciada?'Acompanhe o placar, as rotações e as substituições em tempo real.':'Selecione os times e preencha a súmula antes da partida.'}
function renderScore() {
  const atual = match.sets.find((x) => !x.finalizado) || match.sets.at(-1),
    sa = match.sets.filter(
      (x) => x.finalizado && x.pontosTimeA > x.pontosTimeB,
    ).length,
    sb = match.sets.filter(
      (x) => x.finalizado && x.pontosTimeB > x.pontosTimeA,
    ).length,
    pa = match.rotacaoTimeA || 0,
    pb = match.rotacaoTimeB || 0;
  q("#placar").innerHTML =
    `<div class="scoreboard"><div class="match-clock"><span>${match.fase||'Partida'} • Tempo de jogo</span><strong id="tempo-partida">00:00:00</strong></div><div class="match-toolbar"><button data-action="exit-match">${match.status===2?'Sair da partida':'← Sair da partida'}</button><button class="toolbar-scout" data-action="scout">${match.fase==='Final'?'Scout e cartões':'Cartões'}</button>${match.status===2?'':'<button class="toolbar-sub" data-action="substitute">Substituição</button>'}</div><div class="score-head">${side(match.timeA.nome, match.timeAId, atual.pontosTimeA, sa)}<b>SET ${atual.numero}</b>${side(match.timeB.nome, match.timeBId, atual.pontosTimeB, sb)}</div><div class="courts">${court(match.timeA, pa)}${court(match.timeB, pb)}</div><div class="serve-panels">${servePanel(match.timeA,pa)}${servePanel(match.timeB,pb)}</div></div>`;
  iniciarRelogio();
}
function servePanel(team,rot){const ring=[1,6,5,4,3,2],origem=ring[(0-rot+6)%6],proximo=team.jogadores[origem-1],sacando=match.timeSacandoId===team.id,eventos=(match.pontos||[]).slice().reverse();let seguidos=0;if(sacando)for(const e of eventos){if(e.timeId!==team.id)break;seguidos++}const jogador=proximo?.id?`${proximo.numeroCamisa} — ${proximo.nome}`:'Não definido';return `<div class="serve-panel"><b>SAQUE</b><strong>${sacando?jogador:'Ninguém sacando'}</strong><small>${sacando?`Posição 1 • ${seguidos} saque(s) realizado(s)`:`Próximo: ${jogador}`}</small></div>`}
function sairPartida(){if(match?.status!==2)return abrirConfirmacao('Sair da partida','A partida ainda não terminou. O placar continuará salvo. Deseja sair?',confirmarSaida);confirmarSaida()}
async function confirmarSaida(){q('#confirmar-dialog').close();match=null;q('#placar').innerHTML='';q('#sumula').innerHTML='';atualizarEstadoPartida(false);await view('partida')}
function side(nome, id, pontos, sets) {
  return `<div><h2>${nome}</h2><div class="sets">${sets} sets</div><div class="score">${pontos}</div>${match.status === 2 ? (match.vencedorId === id ? '<div class="winner">VENCEDOR</div>' : "") : `<div><button data-action="point" data-id="${id}" data-delta="-1">−1</button><button data-action="point" data-id="${id}" data-delta="1">+1</button></div>`}</div>`;
}
function court(team, pontos) {
  const ring = [1, 6, 5, 4, 3, 2],
    order = [4, 3, 2, 5, 6, 1],
    offset = pontos % 6,
    byZone = {};
  for (const zona of order) {
    const i = ring.indexOf(zona),
      origem = ring[(i - offset + 6) % 6];
    byZone[zona] = team.jogadores[origem - 1];
  }
  return `<section class="volley-team"><h3>${team.nome}</h3><div class="volley-court"><span class="net"></span>${order
    .map((z) => {
      const j = byZone[z];
      return `<div class="court-position zone-${z}"><span class="zone">POSIÇÃO ${z}</span>${j && j.id ? `<span class="shirt">${j.numeroCamisa}</span><b>${j.nome}</b><small>${j.posicao}</small>` : "<b>Sem jogador</b>"}</div>`;
    })
    .join("")}</div></section>`;
}
function iniciarRelogio(){
  clearInterval(relogioId);
  const atualizar=()=>{const el=q('#tempo-partida');if(!el||!match)return;const inicio=new Date(match.inicioUtc),fim=match.fimUtc?new Date(match.fimUtc):new Date(),segundos=isNaN(inicio)?0:Math.max(0,Math.floor((fim-inicio)/1000));el.textContent=[Math.floor(segundos/3600),Math.floor(segundos%3600/60),segundos%60].map(x=>String(x).padStart(2,'0')).join(':')};
  atualizar();if(match?.status!==2)relogioId=setInterval(atualizar,1000);
}
function todosJogadores(){return [...match.timeA.jogadores,...match.timeA.reservas,...match.timeB.jogadores,...match.timeB.reservas].filter((x,i,a)=>x.id&&a.findIndex(y=>y.id===x.id)===i)}
function nomeJogador(id){return todosJogadores().find(x=>x.id===id)}
function abrirScout(){
  const final=match.fase==='Final',pontos=(match.pontos||[]).filter(x=>x.jogadorId),jogadores=todosJogadores();
  q('#scout-titulo').textContent=final?'Scout da final':'Cartões da partida';
  q('#mvp-partida').classList.toggle('hidden',!final);q('#scout-tabela').classList.toggle('hidden',!final);
  if(final){const dados=jogadores.map(j=>{const eventos=pontos.filter(x=>x.jogadorId===j.id);return{...j,total:eventos.length,saques:eventos.filter(x=>x.tipo==='Saque').length,normais:eventos.filter(x=>x.tipo==='Normal').length}}).sort((a,b)=>b.total-a.total||a.nome.localeCompare(b.nome)),mvp=dados[0];q('#mvp-partida').innerHTML=mvp&&mvp.total?`<div class="mvp-card"><small>${match.status===2?'MVP DA FINAL':'MVP PARCIAL'}</small><strong>${mvp.numeroCamisa} — ${mvp.nome}</strong><span>${mvp.total} ponto(s)</span></div>`:'<div class="mvp-card"><span>Ainda não há pontos individuais.</span></div>';q('#scout-tabela').innerHTML=`<table><thead><tr><th>Jogador</th><th>Normais</th><th>Saques</th><th>Total</th></tr></thead><tbody>${dados.map(x=>`<tr><td>${x.numeroCamisa} — ${x.nome}</td><td>${x.normais}</td><td>${x.saques}</td><td><b>${x.total}</b></td></tr>`).join('')}</tbody></table>`}
  q('#form-cartao').classList.toggle('hidden',match.status===2);q('#cartao-time').innerHTML=`<option value="${match.timeAId}">${match.timeA.nome}</option><option value="${match.timeBId}">${match.timeB.nome}</option>`;preencherJogadoresCartao(match.timeAId);renderCartoes();q('#scout-dialog').showModal();
}
function preencherJogadoresCartao(timeId){const team=timeId===match.timeAId?match.timeA:match.timeB,jogadores=[...team.jogadores,...team.reservas].filter((x,i,a)=>x.id&&a.findIndex(y=>y.id===x.id)===i);q('#cartao-jogador').innerHTML=jogadores.map(x=>`<option value="${x.id}">${x.numeroCamisa} — ${x.nome}</option>`).join('')}
function renderCartoes(){q('#cartoes-lista').innerHTML=(match.cartoes||[]).length?`<h3>Cartões registrados</h3>${match.cartoes.map(c=>{const j=nomeJogador(c.jogadorId);return `<div class="card-record ${c.tipo.toLowerCase()}"><b>${c.tipo}</b><span>${j?`${j.numeroCamisa} — ${j.nome}`:'Jogador'} • Set ${c.set}</span></div>`}).join('')}`:'<p class="empty-state">Nenhum cartão registrado.</p>'}
q('#cartao-time').addEventListener('change',e=>preencherJogadoresCartao(+e.target.value));
q('#form-cartao').addEventListener('submit',async e=>{e.preventDefault();try{const r=await call(`/partidas/${match.id}/cartoes`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({timeId:+q('#cartao-time').value,jogadorId:+q('#cartao-jogador').value,tipo:q('#cartao-tipo').value})});match.cartoes=r.cartoes;renderCartoes();toast('Cartão registrado.')}catch(x){toast(x.message)}});
function abrirSubstituicao() {const d=q('#substituicao-dialog'),s=q('#sub-time-id');s.innerHTML=`<option value="${match.timeAId}">${match.timeA.nome}</option><option value="${match.timeBId}">${match.timeB.nome}</option>`;preencherSubstituicao(match.timeAId);d.showModal()}
function preencherSubstituicao(time){const t=time===match.timeAId?match.timeA:match.timeB;
  q('#sub-sai').innerHTML='<option value="">Selecione quem vai sair</option>'+t.jogadores.filter(x=>x.id).map(x=>`<option value="${x.id}">#${x.numeroCamisa} ${x.nome} — ${x.posicao}</option>`).join('');
  q('#sub-entra').innerHTML='<option value="">Selecione quem vai entrar</option>'+t.reservas.map(x=>`<option value="${x.id}">#${x.numeroCamisa} ${x.nome} — ${x.posicao}</option>`).join('');
}
q('#sub-time-id').addEventListener('change',e=>preencherSubstituicao(+e.target.value));
async function substituir(event) {
  event.preventDefault();const time=+q('#sub-time-id').value,sai=+q('#sub-sai').value,entra=+q('#sub-entra').value;
  if (!sai) return toast("Selecione o jogador que vai sair.");
  if (!entra) return toast("Não há reserva disponível.");
  try {
    await call(`/partidas/${match.id}/substituicoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timeId: time,
        jogadorSaiId: sai,
        jogadorEntraId: entra,
      }),
    });
    q('#substituicao-dialog').close();
    await score();
  } catch (x) {
    toast(x.message);
  }
}
q("#form-substituicao").addEventListener("submit", substituir);
async function loadJogos(){const opts='<option value="">Selecione</option>'+times.map(t=>`<option value="${t.id}">${t.nome}</option>`).join('');q('#historico-time-a').innerHTML=opts;q('#historico-time-b').innerHTML=opts;const jogos=await call('/partidas/historico');q('#lista-jogos').innerHTML=jogos.length?jogos.map(j=>`<article class="game-card"><small>${j.fase||'Partida'}</small><div><strong>${j.timeA}</strong><b>${j.setsTimeA} × ${j.setsTimeB}</b><strong>${j.timeB}</strong></div></article>`).join(''):'<p class="empty-state">Nenhum jogo encerrado.</p>'}
q('#form-historico').addEventListener('submit',async e=>{e.preventDefault();const a=+q('#historico-time-a').value,b=+q('#historico-time-b').value,sa=+q('#historico-sets-a').value,sb=+q('#historico-sets-b').value;if(a===b)return toast('Escolha times diferentes.');try{await call('/partidas/historico',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({timeAId:a,timeBId:b,setsTimeA:sa,setsTimeB:sb})});e.target.reset();await loadJogos();toast('Jogo anterior registrado.')}catch(x){toast(x.message)}});
async function rank() {
  const r = await call("/classificacao");
  q("#podio").innerHTML = r
    .slice(0, 3)
    .map(
      (x, i) =>
        `<div class="place ${i === 0 ? "first" : ""}"><b>${i + 1}º</b><br>${x.nome}<br>${x.pontos} pts</div>`,
    )
    .join("");
  q("#tabela").innerHTML = r
    .map(
      (x, i) =>
        `<tr><td>${i + 1}</td><td>${x.nome}</td><td>${x.jogos}</td><td>${x.vitorias}</td><td>${x.derrotas}</td><td>${x.setsGanhos}</td><td>${x.setsPerdidos}</td><td>${x.pontos}</td></tr>`,
    )
    .join("");
}
loadTimes().catch((x) => toast(x.message));

