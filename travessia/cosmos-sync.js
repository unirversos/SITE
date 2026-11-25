/* Unirversos Travessia · Cosmos Sync & Login Gate (teste/)
   - Login obrigatório para salvar e sincronizar a viagem na nuvem (grátis, sem cobrança).
   - Nunca grava no Firestore em resposta a leitura (respeita limite gratuito).
   - Fornece window.CosmosSync.salvar() (debounced) e window.CosmosUI.toast(msg). */
import { auth, db, entrar } from "/idiomas/dados/conta.js?v=6";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ---------- Toast global (sem alert() do navegador) ---------- */
function toast(msg, tipo){
  var el = document.getElementById('cosmos-toast');
  if(!el){
    el = document.createElement('div');
    el.id = 'cosmos-toast';
    el.className = 'cosmos-toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = 'cosmos-toast on' + (tipo === 'erro' ? ' erro' : '');
  clearTimeout(el._t);
  el._t = setTimeout(function(){ el.classList.remove('on'); }, 3200);
}
window.CosmosUI = { toast: toast };

/* ---------- Portão de Login (grátis, transparente) ---------- */
var gateEl = null;
var liberadoLocal = false;

function mostrarGate(){
  if(liberadoLocal || gateEl) return;
  gateEl = document.createElement('div');
  gateEl.id = 'cosmos-gate';
  gateEl.className = 'cosmos-gate';
  gateEl.setAttribute('role', 'dialog');
  gateEl.setAttribute('aria-modal', 'true');
  gateEl.setAttribute('aria-labelledby', 'cg-tit');
  var ehLocal = (location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');
  gateEl.innerHTML =
    '<div class="cg-box">'+
      '<span class="c-badge verde">100% gratuito · sem cobrança</span>'+
      '<h2 id="cg-tit">Entre para guardar sua travessia</h2>'+
      '<p>Não há cobrança, assinatura nem cartão. O login serve <b>apenas para salvar seu progresso na nuvem</b> e abrir sua viagem no computador e no celular sem perder nada.</p>'+
      '<button type="button" class="btn pri" id="cg-entrar" style="width:100%;min-height:46px;font-size:15.5px">Entrar ou criar conta grátis →</button>'+
      (ehLocal ? '<button type="button" class="btn sm" id="cg-local" style="width:100%">Continuar só neste aparelho (teste local)</button>' : '')+
      '<p class="cg-foot">Seus dados são privados da sua conta. <a href="/privacidade/">Privacidade</a></p>'+
    '</div>';
  document.body.appendChild(gateEl);
  document.getElementById('cg-entrar').addEventListener('click', function(){
    entrar({
      titulo: 'Entre na sua conta grátis',
      texto: 'Sem cobrança e sem cartão. O login serve apenas para salvar sua viagem na nuvem e sincronizar entre celular e computador.'
    });
  });
  var bl = document.getElementById('cg-local');
  if(bl) bl.addEventListener('click', function(){ liberadoLocal = true; fecharGate(); });
}

function fecharGate(){
  if(gateEl){ gateEl.remove(); gateEl = null; }
}

/* ---------- Sincronização na nuvem (progress/{uid}) ---------- */
var usuarioAtual = null;
var tSave = null;
var carregouNuvem = false;

function lerJson(k){ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } }

async function carregarDaNuvem(u){
  if(!u || carregouNuvem) return;
  carregouNuvem = true;
  try{
    var snap = await getDoc(doc(db, 'progress', u.uid));
    if(!snap.exists()) return;
    var data = snap.data() || {};
    var mudou = false;

    /* 1. Calendário (só sobrescreve local se nuvem for mais recente ou local vazio) */
    if(data.calendario && typeof data.calendario === 'object'){
      var loc = lerJson('uniCalendario1');
      var tNuv = data.calendario.atualizado || '';
      var tLoc = (loc && loc.atualizado) || '';
      if(!loc || !loc.ini || (tNuv && tNuv > tLoc)){
        localStorage.setItem('uniCalendario1', JSON.stringify(data.calendario));
        if(data.calendario.ini && data.calendario.fim){
          localStorage.setItem('uniViagemDatas1', JSON.stringify({titulo:data.calendario.titulo||'', ini:data.calendario.ini, fim:data.calendario.fim}));
        }
        mudou = true;
      }
    }

    /* 2. Extras da Travessia (burocracia + emergência) */
    if(data.travessiaExtra && typeof data.travessiaExtra === 'object'){
      var ex = data.travessiaExtra;
      if(ex.burocracia && typeof ex.burocracia === 'object'){
        var bLoc = lerJson('travessiaBurocracia1') || {};
        var bNovo = Object.assign({}, ex.burocracia, bLoc);
        localStorage.setItem('travessiaBurocracia1', JSON.stringify(bNovo));
        mudou = true;
      }
      if(ex.emergencia && typeof ex.emergencia === 'object'){
        var eLoc = lerJson('travessiaEmergencia1') || {};
        if(!Object.keys(eLoc).length){
          localStorage.setItem('travessiaEmergencia1', JSON.stringify(ex.emergencia));
          mudou = true;
        }
      }
    }

    if(mudou) document.dispatchEvent(new CustomEvent('cosmos-sync-ready'));
  }catch(e){}
}

function salvarAgora(){
  if(!usuarioAtual) return;
  clearTimeout(tSave);
  tSave = setTimeout(async function(){
    if(!usuarioAtual) return;
    try{
      var payload = {};
      var cal = lerJson('uniCalendario1');
      if(cal && typeof cal === 'object'){
        cal.atualizado = cal.atualizado || new Date().toISOString();
        payload.calendario = cal;
        payload.calendarioAtualizado = cal.atualizado;
      }
      var bur = lerJson('travessiaBurocracia1');
      var emg = lerJson('travessiaEmergencia1');
      if(bur || emg){
        payload.travessiaExtra = {
          burocracia: bur || {},
          emergencia: emg || {},
          atualizado: new Date().toISOString()
        };
      }
      if(Object.keys(payload).length){
        await setDoc(doc(db, 'progress', usuarioAtual.uid), payload, { merge: true });
      }
    }catch(e){}
  }, 1800);
}

window.CosmosSync = { salvar: salvarAgora };

/* Observa o estado de login emitido por idiomas/dados/conta.js */
document.addEventListener('uni-conta', function(ev){
  var u = (ev.detail && ev.detail.user) || null;
  usuarioAtual = u;
  if(u){
    fecharGate();
    carregarDaNuvem(u);
  } else {
    carregouNuvem = false;
    mostrarGate();
  }
});

/* Caso a conta já esteja resolvida antes do listener */
setTimeout(function(){
  if(auth && auth.currentUser){
    usuarioAtual = auth.currentUser;
    fecharGate();
    carregarDaNuvem(usuarioAtual);
  } else if(!usuarioAtual){
    mostrarGate();
  }
}, 900);
