/* Mapa pessoal: o aluno escolhe ferramentas e elas aparecem na trilha do japonês.
   Guarda só a lista de ids em localStorage 'uniMapaPessoal1' (sincroniza com a conta via conta.js). */
(function(){
  var KEY='uniMapaPessoal1';
  var FERR={
    numeros:{e:'🔢',t:'Números e contagens',href:'/idiomas/numeros/',d:'Os números de 1 a 10.000 e as contagens dos 12 mapas.',perto:'horas'},
    hiragana:{e:'あ',t:'Hiragana',href:'/idiomas/hiragana/',d:'As letras, a ordem dos traços e folhas para imprimir.',perto:'letras'},
    katakana:{e:'ア',t:'Katakana',href:'/idiomas/katakana/',d:'As letras das palavras de fora, com traços e folhas.',perto:'letras'},
    ar:{e:'🌬️',t:'Ar',href:'/idiomas/ar/',d:'Para quando você precisar de um ar.',perto:null},
    calendario:{e:'📅',t:'Calendário',href:'/idiomas/calendario/',d:'Dias, meses e datas em japonês.',perto:'planos'}
  };
  function lista(){ try{ var a=JSON.parse(localStorage.getItem(KEY)||'[]'); return Array.isArray(a)?a.filter(function(i){return FERR[i];}):[]; }catch(e){ return []; } }
  function grava(a){ try{ localStorage.setItem(KEY,JSON.stringify(a)); }catch(e){} try{ document.dispatchEvent(new Event('uni-progresso')); }catch(e){} }
  function tem(id){ return lista().indexOf(id)>=0; }
  function alterna(id){ var a=lista(), i=a.indexOf(id); if(i>=0) a.splice(i,1); else a.push(id); grava(a); return i<0; }
  window.UniMapaPessoal={FERR:FERR,lista:lista,tem:tem,alterna:alterna};

  /* botão nas páginas das ferramentas */
  var m=location.pathname.match(/^\/idiomas\/(numeros|hiragana|katakana|ar|calendario)\/?/);
  if(!m) return;
  var id=m[1];
  var css=document.createElement('style');
  css.textContent='.mp-btn{display:inline-flex;align-items:center;gap:8px;margin:12px 0 0;font:inherit;font-weight:700;font-size:15px;padding:9px 18px;border-radius:999px;border:2px solid #b5514d;background:#fff;color:#b5514d;cursor:pointer}'+
    '.mp-btn:hover{background:#b5514d;color:#fff}.mp-btn.on{border-color:#4f7a58;color:#3e6347;background:#e9f2ea}.mp-btn.on:hover{background:#4f7a58;color:#fff}'+
    '.mp-obs{display:block;font-size:13px;color:#7a6a70;margin-top:4px}';
  document.head.appendChild(css);
  function monta(){
    var h=document.querySelector('header'); if(!h) return;
    var b=document.createElement('button'); b.type='button'; b.className='mp-btn';
    var o=document.createElement('span'); o.className='mp-obs';
    function pinta(){ var on=tem(id);
      b.classList.toggle('on',on); b.setAttribute('aria-pressed',on);
      b.textContent=on?'✓ No meu mapa · tirar':'＋ Adicionar ao meu mapa';
      o.textContent=on?'Ela aparece na sua trilha do japonês.':'Ela vai aparecer na sua trilha do japonês.'; }
    b.addEventListener('click',function(){ alterna(id); pinta(); });
    pinta(); h.appendChild(b); h.appendChild(o);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',monta); else monta();
})();
