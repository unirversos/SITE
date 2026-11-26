/* ==========================================================================
   Salão Unirversos · Motor Compartilhado v3
   SFX Web Audio · TTS com velocidade · Acessibilidade Global (Velocidade,
   Tradução, Furigana, Romaji) · XP · Caderno · Histórico de Desempenho
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Web Audio SFX (pentatônica japonesa suave) ---------- */
  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem('uniSalaoMute') === '1'; } catch (e) {}

  function ac() {
    if (muted) return null;
    if (!ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      ctx = new Ctx();
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, dur, type, vol, delay) {
    const c = ac();
    if (!c) return;
    const t0 = c.currentTime + (delay || 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.08, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  const sfx = {
    click() { tone(520, 0.06, 'triangle', 0.05); },
    ok() {
      tone(523.25, 0.14, 'triangle', 0.09, 0);
      tone(659.25, 0.16, 'triangle', 0.09, 0.08);
      tone(783.99, 0.22, 'sine', 0.08, 0.16);
    },
    combo(n) {
      const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
      const f = scale[Math.min(scale.length - 1, Math.max(0, (n || 1) - 1))];
      tone(f, 0.15, 'triangle', 0.09, 0);
      tone(f * 1.25, 0.2, 'sine', 0.08, 0.07);
    },
    err() {
      tone(240, 0.14, 'sine', 0.08, 0);
      tone(195, 0.18, 'sine', 0.07, 0.09);
    },
    fanfare() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        tone(f, 0.26, 'triangle', 0.09, i * 0.09);
      });
    },
    bell() {
      tone(880, 0.32, 'sine', 0.07, 0);
      tone(1318.5, 0.4, 'sine', 0.04, 0.02);
    }
  };

  /* ---------- Estado de Acessibilidade Global (padrão OFF = nível difícil) ---------- */
  const VELS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75];
  let velIdx = 2; /* 1.0x */
  let romajiOn = false;
  let furiOn = false;
  let tradOn = false;

  try {
    const sv = parseFloat(localStorage.getItem('uniSalaoVel'));
    const fi = VELS.indexOf(sv);
    if (fi >= 0) velIdx = fi;
    romajiOn = localStorage.getItem('utopiaRomaji') === '1';
    furiOn = localStorage.getItem('uniSalaoFuri') === '1';
    tradOn = localStorage.getItem('uniSalaoTrad') === '1';
  } catch (e) {}

  const listeners = [];
  function notifyAcess() {
    listeners.forEach(fn => { try { fn({ speed: VELS[velIdx], romaji: romajiOn, furi: furiOn, trad: tradOn }); } catch (e) {} });
  }

  function applyAcess() {
    document.body.classList.toggle('ver-ro', romajiOn);
    document.body.classList.toggle('ver-furi', furiOn);
    document.body.classList.toggle('ver-trad', tradOn);

    document.querySelectorAll('[data-romaji-btn]').forEach(btn => {
      btn.textContent = 'Romaji: ' + (romajiOn ? 'ON' : 'OFF');
      btn.classList.toggle('on', romajiOn);
      btn.setAttribute('aria-pressed', String(romajiOn));
    });
    document.querySelectorAll('[data-furi-btn]').forEach(btn => {
      btn.textContent = 'あ Furigana: ' + (furiOn ? 'ON' : 'OFF');
      btn.classList.toggle('on', furiOn);
      btn.setAttribute('aria-pressed', String(furiOn));
    });
    document.querySelectorAll('[data-trad-btn]').forEach(btn => {
      btn.textContent = '👁️ Tradução: ' + (tradOn ? 'ON' : 'OFF');
      btn.classList.toggle('on', tradOn);
      btn.setAttribute('aria-pressed', String(tradOn));
    });
    document.querySelectorAll('[data-vel-label]').forEach(el => {
      el.textContent = VELS[velIdx].toFixed(2).replace(/0$/, '') + 'x';
    });
    notifyAcess();
  }

  function toggleRomaji() {
    romajiOn = !romajiOn;
    try { localStorage.setItem('utopiaRomaji', romajiOn ? '1' : '0'); } catch (e) {}
    applyAcess();
    sfx.click();
  }
  function toggleFuri() {
    furiOn = !furiOn;
    try { localStorage.setItem('uniSalaoFuri', furiOn ? '1' : '0'); } catch (e) {}
    applyAcess();
    sfx.click();
  }
  function toggleTrad() {
    tradOn = !tradOn;
    try { localStorage.setItem('uniSalaoTrad', tradOn ? '1' : '0'); } catch (e) {}
    applyAcess();
    sfx.click();
  }
  function stepSpeed(delta) {
    velIdx = Math.max(0, Math.min(VELS.length - 1, velIdx + delta));
    try { localStorage.setItem('uniSalaoVel', String(VELS[velIdx])); } catch (e) {}
    applyAcess();
    sfx.click();
  }

  function bindAcessButtons(scope) {
    const root = scope || document;
    root.querySelectorAll('[data-romaji-btn]').forEach(b => { if (!b._uB) { b._uB = 1; b.addEventListener('click', toggleRomaji); } });
    root.querySelectorAll('[data-furi-btn]').forEach(b => { if (!b._uB) { b._uB = 1; b.addEventListener('click', toggleFuri); } });
    root.querySelectorAll('[data-trad-btn]').forEach(b => { if (!b._uB) { b._uB = 1; b.addEventListener('click', toggleTrad); } });
    root.querySelectorAll('[data-vel-menos]').forEach(b => { if (!b._uB) { b._uB = 1; b.addEventListener('click', () => stepSpeed(-1)); } });
    root.querySelectorAll('[data-vel-mais]').forEach(b => { if (!b._uB) { b._uB = 1; b.addEventListener('click', () => stepSpeed(1)); } });
  }

  function mountAcessBar(selector) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return;
    el.className = 'acess-bar';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Acessibilidade e velocidade');
    el.innerHTML = `
      <div class="acess-grupo">
        <span class="sub" style="font-size:12.5px;font-weight:700">🐢 Velocidade:</span>
        <div class="vel-ctrl">
          <button type="button" data-vel-menos aria-label="Diminuir velocidade">−</button>
          <span data-vel-label>1.0x</span>
          <button type="button" data-vel-mais aria-label="Aumentar velocidade">+</button>
        </div>
      </div>
      <div class="acess-grupo">
        <button type="button" class="btn sm" data-trad-btn aria-pressed="false">👁️ Tradução: OFF</button>
        <button type="button" class="btn sm" data-furi-btn aria-pressed="false">あ Furigana: OFF</button>
        <button type="button" class="btn sm" data-romaji-btn aria-pressed="false">Romaji: OFF</button>
      </div>
    `;
    bindAcessButtons(el);
    applyAcess();
  }

  /* ---------- TTS Japonês (respeita velocidade global!) ---------- */
  let playingAudio = null;
  const cleanKey = t => String(t || '').replace(/[\s、。，．,.!！?？…・「」『』（）()＿]/g, '');

  function speakTTS(text, rate) {
    try {
      if (!window.speechSynthesis || !text) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      const base = rate || 0.9;
      u.rate = Math.max(0.45, Math.min(1.8, base * VELS[velIdx]));
      const voices = window.speechSynthesis.getVoices();
      const ja = voices.find(v => /^ja/i.test(v.lang));
      if (ja) u.voice = ja;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function speak(text, rate) {
    if (!text) return;
    const id = window.AUDIO_MAP && window.AUDIO_MAP[cleanKey(text)];
    if (!id) { speakTTS(text, rate); return; }
    try {
      if (playingAudio) playingAudio.pause();
      const a = new Audio('/idiomas/audio/' + id + '.mp3');
      playingAudio = a;
      a.playbackRate = Math.max(0.5, Math.min(1.75, VELS[velIdx]));
      a.onerror = () => speakTTS(text, rate);
      const p = a.play();
      if (p && p.catch) p.catch(() => speakTTS(text, rate));
    } catch (e) { speakTTS(text, rate); }
  }

  /* ---------- Clima do Beco ---------- */
  const CLIMAS = [
    { id: 'noite', label: '🏮 Noite suave' },
    { id: 'tarde', label: '🌇 Fim de tarde' },
    { id: 'chuva', label: '🌧️ Chuva em Tóquio' }
  ];
  let clima = 'noite';
  try {
    const saved = localStorage.getItem('utopiaClima');
    if (CLIMAS.some(c => c.id === saved)) clima = saved;
  } catch (e) {}

  function applyClima() {
    document.body.dataset.clima = clima;
    const item = CLIMAS.find(c => c.id === clima) || CLIMAS[0];
    document.querySelectorAll('[data-clima-btn]').forEach(btn => { btn.textContent = item.label; });
  }
  function cycleClima() {
    const idx = CLIMAS.findIndex(c => c.id === clima);
    clima = CLIMAS[(idx + 1) % CLIMAS.length].id;
    try { localStorage.setItem('utopiaClima', clima); } catch (e) {}
    applyClima();
    sfx.click();
  }

  /* ---------- XP, Moedas & Ofensiva Diária (Streak) ---------- */
  function getXP() {
    try { return parseInt(localStorage.getItem('uniSalaoXP') || '0', 10) || 0; } catch (e) { return 0; }
  }
  function addXP(pts) {
    const next = Math.max(0, getXP() + (pts || 0));
    try { localStorage.setItem('uniSalaoXP', String(next)); } catch (e) {}
    updateXPBadges();
    return next;
  }
  function spendXP(cost) {
    const cur = getXP();
    if (cur < cost) return false;
    try { localStorage.setItem('uniSalaoXP', String(cur - cost)); } catch (e) {}
    updateXPBadges();
    return true;
  }
  function updateXPBadges() {
    const xp = getXP();
    document.querySelectorAll('[data-xp-val]').forEach(el => { el.textContent = String(xp); });
  }

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function getStreak() {
    try {
      const s = JSON.parse(localStorage.getItem('uniSalaoStreak') || 'null') || { count: 0, lastDate: '', atividadesHoje: 0, diaAtiv: '' };
      const hoje = todayStr();
      return {
        count: s.count || 0,
        lastDate: s.lastDate || '',
        claimedToday: s.lastDate === hoje,
        atividadesHoje: s.diaAtiv === hoje ? (s.atividadesHoje || 0) : 0
      };
    } catch (e) { return { count: 0, lastDate: '', claimedToday: false, atividadesHoje: 0 }; }
  }
  function markActivityDone(silent) {
    const s = getStreak();
    const hoje = todayStr();
    const yesterday = new Date(Date.now() - 86400000);
    const yStr = yesterday.getFullYear() + '-' + String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + String(yesterday.getDate()).padStart(2, '0');
    const novaOfensiva = !s.claimedToday;
    const nextCount = novaOfensiva ? (s.lastDate === yStr ? s.count + 1 : 1) : s.count;
    const nextAtiv = s.atividadesHoje + 1;
    try {
      localStorage.setItem('uniSalaoStreak', JSON.stringify({
        count: nextCount,
        lastDate: hoje,
        atividadesHoje: nextAtiv,
        diaAtiv: hoje
      }));
    } catch (e) {}
    if (novaOfensiva) {
      const bonus = 25 + Math.min(50, (nextCount - 1) * 5);
      addXP(bonus);
      if (!silent) {
        sfx.fanfare();
        toast(`🔥 Ofensiva dia ${nextCount}! +${bonus} XP!`);
      }
      return { ok: true, bonus, count: nextCount, atividadesHoje: nextAtiv };
    }
    return { ok: false, count: nextCount, atividadesHoje: nextAtiv };
  }
  function claimDailyStreak() {
    return markActivityDone(false);
  }

  /* ---------- Conversor Romaji -> Hiragana (compartilhado p/ Furigana em Kanjis) ---------- */
  const R2H = {
    kya:'きゃ',kyu:'きゅ',kyo:'きょ',sha:'しゃ',shu:'しゅ',sho:'しょ',cha:'ちゃ',chu:'ちゅ',cho:'ちょ',
    nya:'にゃ',nyu:'にゅ',nyo:'にょ',hya:'ひゃ',hyu:'ひゅ',hyo:'ひょ',mya:'みゃ',myu:'みゅ',myo:'みょ',
    rya:'りゃ',ryu:'りゅ',ryo:'りょ',gya:'ぎゃ',gyu:'ぎゅ',gyo:'ぎょ',ja:'じゃ',ju:'じゅ',jo:'じょ',
    bya:'びゃ',byu:'びゅ',byo:'びょ',pya:'ぴゃ',pyu:'ぴゅ',pyo:'ぴょ',
    shi:'し',chi:'ち',tsu:'つ',fu:'ふ',ji:'じ',
    ka:'か',ki:'き',ku:'く',ke:'け',ko:'こ',sa:'さ',su:'す',se:'せ',so:'そ',
    ta:'た',te:'て',to:'と',na:'な',ni:'に',nu:'ぬ',ne:'ね',no:'の',
    ha:'は',hi:'ひ',he:'へ',ho:'ほ',ma:'ま',mi:'み',mu:'む',me:'め',mo:'も',
    ya:'や',yu:'ゆ',yo:'よ',ra:'ら',ri:'り',ru:'る',re:'れ',ro:'ろ',wa:'わ',wo:'を',
    ga:'が',gi:'ぎ',gu:'ぐ',ge:'げ',go:'ご',za:'ざ',zu:'ず',ze:'ぜ',zo:'ぞ',
    da:'だ',de:'で',do:'ど',ba:'ば',bi:'び',bu:'ぶ',be:'べ',bo:'ぼ',
    pa:'ぱ',pi:'ぴ',pu:'ぷ',pe:'ぺ',po:'ぽ',
    a:'あ',i:'い',u:'う',e:'え',o:'お'
  };
  function romajiToHiragana(raw) {
    if (!raw) return '';
    const s = String(raw).toLowerCase()
      .replace(/ā/g, 'aa').replace(/ī/g, 'ii').replace(/ū/g, 'uu')
      .replace(/ē/g, 'ee').replace(/ō/g, 'ou')
      .replace(/[^a-z\s'-]/g, '');
    let out = '', i = 0;
    while (i < s.length) {
      const ch = s[i];
      if (ch === ' ' || ch === '-' || ch === "'") { out += ch === ' ' ? ' ' : ''; i++; continue; }
      if (i + 1 < s.length && ch === s[i + 1] && /[bcdfghjklmpqrstvwxyz]/.test(ch) && ch !== 'n') { out += 'っ'; i++; continue; }
      if (s.slice(i, i + 3) === 'tch') { out += 'っ'; i++; continue; }
      const t3 = s.slice(i, i + 3); if (R2H[t3]) { out += R2H[t3]; i += 3; continue; }
      const t2 = s.slice(i, i + 2); if (R2H[t2]) { out += R2H[t2]; i += 2; continue; }
      if (ch === 'n') { const nx = s[i + 1] || ''; if (!nx || !/[aiueoy]/.test(nx)) { out += 'ん'; i++; continue; } }
      if (R2H[ch]) { out += R2H[ch]; i++; continue; }
      i++;
    }
    return out.trim();
  }
  function rubyAuto(kanji, romaji) {
    if (!/[\u4e00-\u9faf]/.test(String(kanji || ''))) return String(kanji || '');
    const f = romajiToHiragana(romaji);
    return f ? `<ruby>${kanji}<rt>${f}</rt></ruby>` : String(kanji || '');
  }

  /* ---------- Extras do Avatar (Lojinha do Beco) ---------- */
  const EXTRA_OVERLAYS = {
    kitsune: '<g transform="translate(152,46) rotate(12)"><path d="M0 18 L8 0 L18 14 L28 0 L36 18 C36 32 28 40 18 40 C8 40 0 32 0 18 Z" fill="#fbf3e6" stroke="#4a3b38" stroke-width="2.5"/><path d="M5 10 L9 3 L13 11 M23 11 L27 3 L31 10" fill="#d96b5c"/><path d="M8 23 Q12 20 15 23 M21 23 Q24 20 28 23" stroke="#d96b5c" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="18" cy="29" r="2" fill="#4a3b38"/></g>',
    boina: '<g transform="translate(66,34)"><ellipse cx="54" cy="28" rx="52" ry="20" fill="#d96b5c" stroke="#4a3b38" stroke-width="3"/><path d="M52 10 L56 2" stroke="#4a3b38" stroke-width="4" stroke-linecap="round"/></g>',
    boina_indigo: '<g transform="translate(66,34)"><ellipse cx="54" cy="28" rx="52" ry="20" fill="#4b5378" stroke="#2d324a" stroke-width="3"/><path d="M52 10 L56 2" stroke="#2d324a" stroke-width="4" stroke-linecap="round"/></g>',
    laco: '<g transform="translate(148,54) rotate(16)"><ellipse cx="10" cy="14" rx="12" ry="8" fill="#f19bb5" stroke="#4a3b38" stroke-width="2.2"/><ellipse cx="28" cy="14" rx="12" ry="8" fill="#f19bb5" stroke="#4a3b38" stroke-width="2.2"/><circle cx="19" cy="14" r="5" fill="#d96b5c" stroke="#4a3b38" stroke-width="2"/></g>',
    oculos_red: '<g stroke="#4a3b38" stroke-width="3.2" fill="rgba(255,255,255,0.22)"><circle cx="96" cy="136" r="16"/><circle cx="144" cy="136" r="16"/><path d="M112 136 L128 136"/></g>',
    cachecol: '<g><path d="M74 198 Q120 222 166 198 L170 222 Q120 246 70 222 Z" fill="#d96b5c" stroke="#4a3b38" stroke-width="2.8"/><path d="M136 218 L142 268 L162 264 L154 214 Z" fill="#c7594a" stroke="#4a3b38" stroke-width="2.5"/></g>',
    fone: '<g stroke="#4a3b38" stroke-width="4" fill="none"><path d="M56 126 C56 56 184 56 184 126"/><rect x="46" y="114" width="16" height="34" rx="7" fill="#ecc072" stroke-width="2.8"/><rect x="178" y="114" width="16" height="34" rx="7" fill="#ecc072" stroke-width="2.8"/></g>',
    gatinho: '<g transform="translate(154,162)"><circle cx="22" cy="24" r="18" fill="#fbf3e6" stroke="#4a3b38" stroke-width="2.5"/><path d="M8 14 L10 0 L20 10 M24 10 L34 0 L36 14" fill="#d98c5f" stroke="#4a3b38" stroke-width="2"/><circle cx="16" cy="23" r="2.2" fill="#4a3b38"/><circle cx="28" cy="23" r="2.2" fill="#4a3b38"/><path d="M19 28 Q22 31 25 28" stroke="#4a3b38" stroke-width="2" fill="none"/></g>',
    lanterna: '<g transform="translate(166,154)"><rect x="4" y="10" width="24" height="32" rx="11" fill="#ecc072" stroke="#b24b3d" stroke-width="2.5"/><line x1="16" y1="0" x2="16" y2="10" stroke="#4a3b38" stroke-width="2.5"/><line x1="6" y1="20" x2="26" y2="20" stroke="#b24b3d" stroke-width="1.5" opacity="0.5"/><line x1="6" y1="30" x2="26" y2="30" stroke="#b24b3d" stroke-width="1.5" opacity="0.5"/></g>'
  };

  function getAvatarExtras() {
    try {
      const d = JSON.parse(localStorage.getItem('uniSalaoAvatarExtras') || 'null');
      return (d && typeof d === 'object') ? { owned: d.owned || [], equipped: d.equipped || {} } : { owned: [], equipped: {} };
    } catch (e) { return { owned: [], equipped: {} }; }
  }
  function saveAvatarExtras(data) {
    try { localStorage.setItem('uniSalaoAvatarExtras', JSON.stringify(data)); } catch (e) {}
  }

  function avatarHTML(opts) {
    const o = opts || {};
    const av = window.UtopiaAvatar && window.UtopiaAvatar.load && window.UtopiaAvatar.load();
    const sel = o.sel || (av && av.sel) || null;
    const extras = o.equipped || getAvatarExtras().equipped || {};
    let svgStr = (sel && window.UtopiaAvatar)
      ? window.UtopiaAvatar.svg(sel, { viewBox: o.viewBox || '30 30 180 180', still: true, label: 'Avatar' })
      : '';
    if (!svgStr) return '🧳';
    const overlays = Object.values(extras).filter(Boolean).map(id => EXTRA_OVERLAYS[id] || '').join('');
    if (overlays) svgStr = svgStr.replace('</svg>', overlays + '</svg>');
    return svgStr;
  }

  /* ---------- Salvar no Caderno Unirversos ---------- */
  function saveToCaderno(texto, origem) {
    try {
      const key = 'uniCadernoNotas';
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.unshift({ texto: String(texto || '').trim(), origem: origem || 'Salão Unirversos', data: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(arr.slice(0, 120)));
      toast('📒 Salvo no seu Caderno!');
      sfx.bell();
      return true;
    } catch (e) {
      toast('Não foi possível salvar agora.');
      return false;
    }
  }

  /* ---------- Histórico de Tempo & Desempenho (uniSalaoHistorico) ---------- */
  function getHistory() {
    try {
      const arr = JSON.parse(localStorage.getItem('uniSalaoHistorico') || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function recordSession(entry) {
    try {
      const arr = getHistory();
      const total = Math.max(0, (entry.acertos || 0) + (entry.erros || 0));
      const precisao = typeof entry.precisao === 'number'
        ? Math.max(0, Math.min(100, Math.round(entry.precisao)))
        : (total > 0 ? Math.round(((entry.acertos || 0) / total) * 100) : 0);
      const dur = Math.max(1, Math.round(entry.duracaoSeg || 0));
      const tMed = typeof entry.tempoMedio === 'number'
        ? Math.round(entry.tempoMedio * 10) / 10
        : (entry.acertos > 0 ? Math.round((dur / entry.acertos) * 10) / 10 : dur);

      arr.push({
        jogo: entry.jogo || 'salao',
        nomeJogo: entry.nomeJogo || 'Salão Unirversos',
        data: new Date().toISOString(),
        duracaoSeg: dur,
        acertos: entry.acertos || 0,
        erros: entry.erros || 0,
        precisao,
        tempoMedio: tMed,
        pts: entry.pts || 0,
        velocidade: entry.velocidade != null ? entry.velocidade : VELS[velIdx]
      });
      localStorage.setItem('uniSalaoHistorico', JSON.stringify(arr.slice(-120)));
      markActivityDone(true);
      return arr[arr.length - 1];
    } catch (e) { return null; }
  }

  /* ---------- Toast & Mute ---------- */
  let toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  function applyMute() {
    document.querySelectorAll('[data-mute-btn]').forEach(btn => {
      btn.textContent = muted ? '🔇 Som: OFF' : '🔊 Som: ON';
      btn.classList.toggle('on', !muted);
      btn.setAttribute('aria-pressed', String(!muted));
    });
  }
  function toggleMute() {
    muted = !muted;
    try { localStorage.setItem('uniSalaoMute', muted ? '1' : '0'); } catch (e) {}
    applyMute();
    if (!muted) sfx.click();
  }

  function init() {
    document.querySelectorAll('[data-acess-bar]').forEach(el => mountAcessBar(el));
    bindAcessButtons(document);
    applyAcess();
    applyClima();
    applyMute();
    updateXPBadges();
    document.querySelectorAll('[data-clima-btn]').forEach(b => b.addEventListener('click', cycleClima));
    document.querySelectorAll('[data-mute-btn]').forEach(b => b.addEventListener('click', toggleMute));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.UniSalao = {
    sfx,
    speak,
    speakTTS,
    getXP,
    addXP,
    spendXP,
    getStreak,
    claimDailyStreak,
    markActivityDone,
    romajiToHiragana,
    rubyAuto,
    getAvatarExtras,
    saveAvatarExtras,
    avatarHTML,
    EXTRA_OVERLAYS,
    saveToCaderno,
    getHistory,
    recordSession,
    mountAcessBar,
    onAcessChange: fn => { if (typeof fn === 'function') listeners.push(fn); },
    getSpeed: () => VELS[velIdx],
    isRomaji: () => romajiOn,
    isFuri: () => furiOn,
    isTrad: () => tradOn,
    toggleRomaji,
    toggleFuri,
    toggleTrad,
    toast
  };
})();
