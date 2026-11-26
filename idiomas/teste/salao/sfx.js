/* ==========================================================================
   Salão Unirversos · Motor Compartilhado (SFX Web Audio, TTS, Romaji, XP, Caderno)
   100% client-side, zero dependência pesada, compatível com o ecossistema Unirversos
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

  /* ---------- TTS Japonês (usa AUDIO_MAP se disponível, senão Web Speech) ---------- */
  let playingAudio = null;
  const cleanKey = t => String(t || '').replace(/[\s、。，．,.!！?？…・「」『』（）()＿]/g, '');

  function speakTTS(text, rate) {
    try {
      if (!window.speechSynthesis || !text) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      const vel = (window.UniVel && typeof window.UniVel.get === 'function') ? window.UniVel.get() : 1;
      u.rate = (rate || 0.88) * vel;
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
      a.onerror = () => speakTTS(text, rate);
      const p = a.play();
      if (p && p.catch) p.catch(() => speakTTS(text, rate));
    } catch (e) { speakTTS(text, rate); }
  }

  /* ---------- Romaji global (compartilhado via utopiaRomaji) ---------- */
  let romajiOn = false;
  try { romajiOn = localStorage.getItem('utopiaRomaji') === '1'; } catch (e) {}

  function applyRomaji() {
    document.body.classList.toggle('ver-ro', romajiOn);
    document.querySelectorAll('[data-romaji-btn]').forEach(btn => {
      btn.textContent = 'Romaji: ' + (romajiOn ? 'ON' : 'OFF');
      btn.classList.toggle('on', romajiOn);
      btn.setAttribute('aria-pressed', String(romajiOn));
    });
  }

  function toggleRomaji() {
    romajiOn = !romajiOn;
    try { localStorage.setItem('utopiaRomaji', romajiOn ? '1' : '0'); } catch (e) {}
    applyRomaji();
    sfx.click();
  }

  /* ---------- Clima da Ruazinha (compartilhado via utopiaClima) ---------- */
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
    document.querySelectorAll('[data-clima-btn]').forEach(btn => {
      btn.textContent = item.label;
    });
  }

  function cycleClima() {
    const idx = CLIMAS.findIndex(c => c.id === clima);
    clima = CLIMAS[(idx + 1) % CLIMAS.length].id;
    try { localStorage.setItem('utopiaClima', clima); } catch (e) {}
    applyClima();
    sfx.click();
  }

  /* ---------- XP do Salão ---------- */
  function getXP() {
    try { return parseInt(localStorage.getItem('uniSalaoXP') || '0', 10) || 0; } catch (e) { return 0; }
  }
  function addXP(pts) {
    const next = getXP() + (pts || 0);
    try { localStorage.setItem('uniSalaoXP', String(next)); } catch (e) {}
    updateXPBadges();
    return next;
  }
  function updateXPBadges() {
    const xp = getXP();
    document.querySelectorAll('[data-xp-val]').forEach(el => { el.textContent = String(xp); });
  }

  /* ---------- Salvar no Caderno Unirversos (uniCadernoNotas) ---------- */
  function saveToCaderno(texto, origem) {
    try {
      const key = 'uniCadernoNotas';
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.unshift({
        texto: String(texto || '').trim(),
        origem: origem || 'Salão Unirversos',
        data: new Date().toISOString()
      });
      localStorage.setItem(key, JSON.stringify(arr.slice(0, 120)));
      toast('📒 Salvo no seu Caderno!');
      sfx.bell();
      return true;
    } catch (e) {
      toast('Não foi possível salvar agora.');
      return false;
    }
  }

  /* ---------- Toast ---------- */
  let toastEl = null;
  let toastTimer = null;
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

  /* ---------- Mute toggle ---------- */
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

  /* ---------- Init automático ---------- */
  function init() {
    applyRomaji();
    applyClima();
    applyMute();
    updateXPBadges();
    document.querySelectorAll('[data-romaji-btn]').forEach(b => b.addEventListener('click', toggleRomaji));
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
    saveToCaderno,
    toast,
    isRomaji: () => romajiOn,
    toggleRomaji
  };
})();
