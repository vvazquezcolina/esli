/* battle.js — combate: tablero, miedo/coraje, habilidades y turnos del monstruo */
window.G = window.G || {};
(function () {
  const B = (G.Battle = {});
  const COST = { coraje: 14, annie: 10, chiquis: 10 };
  const COLS = 7, ROWS = 7;

  let S = null;          /* estado de la batalla */
  let board = null;      /* lógica */
  let tileEls = {};      /* id -> elemento */
  let els = null;        /* cache DOM */
  let sel = null;        /* celda seleccionada */
  let ptr = null;        /* arrastre activo */

  function $(id) { return document.getElementById(id); }

  function cacheEls() {
    if (els) return;
    els = {
      board: $('board'),
      mCanvas: $('monster-canvas'), mName: $('monster-name'),
      mHp: $('monster-hp'), mHpTxt: $('monster-hp-txt'), mIntent: $('monster-intent'),
      eCanvas: $('esli-canvas'), eHp: $('esli-hp'), eHpTxt: $('esli-hp-txt'),
      eMiedo: $('esli-miedo'), eMiedoTxt: $('esli-miedo-txt'),
      abCoraje: $('ab-coraje'), abAnnie: $('ab-annie'), abChiquis: $('ab-chiquis'),
      vignette: $('vignette'), screen: $('screen-battle')
    };
    els.abCoraje.addEventListener('click', useCoraje);
    els.abAnnie.addEventListener('click', useAnnie);
    els.abChiquis.addEventListener('click', useChiquis);
    els.board.addEventListener('pointerdown', onDown);
    els.board.addEventListener('pointermove', onMove);
    els.board.addEventListener('pointerup', onUp);
    els.board.addEventListener('pointercancel', onUp);
    els.board.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    $('btn-flee').addEventListener('click', function () {
      if (S && S.over) return;
      G.UI.modal({
        html: '<h3>¿Volver al mapa?</h3><p>El monstruo se quedará esperándote, muy quitado de la pena.</p>',
        buttons: [
          { label: 'Seguir luchando', cb: function () {} },
          { label: 'Huir (está bien huir)', ghost: true, cb: function () { endBattle(); G.Game.toMap(); } }
        ]
      });
    });
  }

  /* ---------- API que usan los minijuegos (modes.js) ---------- */
  const api = {
    config: function (o) { if (!S) return; for (const k in o) S[k] = o[k]; updateAll(); },
    progress: function (p) {
      if (!S || S.over) return true;
      S.mhp = Math.max(0, Math.round(S.L.monster.hp * (1 - p)));
      updateBars();
      if (p >= 1) { win(); return true; }
      return false;
    },
    tick: function () {
      if (!S || S.over) return;
      S.counter--;
      if (S.counter <= 0) monsterAct(); else updateAll();
    },
    monsterNow: function () { if (S && !S.over) monsterAct(); },
    charge: function (n) {
      if (!S) return;
      S.coraje = Math.min(COST.coraje, S.coraje + n);
      if (S.hasAnnie) S.annieE = Math.min(COST.annie, S.annieE + n);
      if (S.hasChiquis) S.chiqE = Math.min(COST.chiquis, S.chiqE + n);
      updateAll();
    },
    fearDown: function (n) { if (S) { S.miedo = Math.max(0, S.miedo - n); updateAll(); } },
    fearUp: function (n) { if (S) { S.miedo = Math.min(100, S.miedo + n); updateAll(); } },
    locked: function () { return !S || S.resolving || S.over; },
    over: function () { return !S || S.over; },
    fct: function (t, c, a) { G.UI.fct(t, c, a); },
    sfx: function (n, a) { G.Sfx.play(n, a); },
    tone: function (f, d, t, v, dl) {
      if (!G.Sfx.muted && G.Sfx.ctx) G.Sfx.tone(f, d, t, v, dl);
    }
  };

  /* ---------- inicio / fin ---------- */
  B.start = function (levelIdx) {
    cacheEls();
    const L = G.DATA.LEVELS[levelIdx];
    const pieces = G.Game.pieceCount();
    const maxHp = 50 + pieces * 5;
    S = {
      idx: levelIdx, L: L, maxHp: maxHp, hp: maxHp,
      miedo: 30, coraje: 0, annieE: 0, chiqE: 0,
      /* completarte te hace más fuerte: el daño escala con las piezas */
      tileDmg: 6 + ((pieces / 4) | 0), corajeDmg: 26 + pieces,
      hasAnnie: levelIdx >= 2, hasChiquis: levelIdx >= 5,
      mhp: L.monster.hp, counter: L.monster.every,
      mode: L.mode || 'match3', tickWord: ['jugada', 'jugadas'],
      noCounter: false, fixedIntent: '',
      shield: false, panic: false, resolving: false, over: false, bossFlip: false,
      hint: {}
    };
    sel = null; ptr = null;
    els.mName.textContent = L.monster.name + ' · ' + L.cuadro;
    els.mCanvas.style.opacity = 1;
    const mc = els.mCanvas.getContext('2d');
    mc.clearRect(0, 0, 200, 200);
    mc.drawImage(G.Sprites.monster(L.monster.key), 0, 0, 200, 200);
    els.abAnnie.classList.toggle('hidden', !S.hasAnnie);
    els.abChiquis.classList.toggle('hidden', !S.hasChiquis);
    if (S.mode === 'match3') {
      board = G.Board.create(COLS, ROWS, L.ncolors);
      renderBoardFull();
    } else {
      board = null;
      els.board.innerHTML = '';
      tileEls = {};
      G.Modes[S.mode].start({ board: els.board, cfg: L.modeCfg || {}, api: api });
    }
    updateAll();
    G.UI.show('battle', L.pal, levelIdx);
  };

  function endBattle() {
    S.over = true;
    els.vignette.style.opacity = 0;
  }
  B.isActive = function () { return !!(S && !S.over); };

  /* ---------- render del tablero ---------- */
  function setPos(el, r, c) {
    el.style.transform = 'translate(' + c * 100 + '%,' + r * 100 + '%)';
  }
  function mkTileEl(t, r, c) {
    const el = document.createElement('div');
    el.className = 'tile' + (t.fog ? ' fog' : ' c' + t.c) + (t.special ? ' special' : '');
    setPos(el, r, c);
    els.board.appendChild(el);
    tileEls[t.id] = el;
    return el;
  }
  function renderBoardFull() {
    els.board.innerHTML = '';
    tileEls = {};
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const t = board.g[r][c];
      if (t) mkTileEl(t, r, c);
    }
  }
  function rebuildFromSnapshot(grid) {
    els.board.innerHTML = '';
    tileEls = {};
    for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[r].length; c++) {
      const t = grid[r][c];
      if (t) mkTileEl(t, r, c);
    }
  }

  /* ---------- input táctil ---------- */
  function cellFromEvent(e) {
    const rect = els.board.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left) / (rect.width / COLS));
    const r = Math.floor((e.clientY - rect.top) / (rect.height / ROWS));
    if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return null;
    return { r: r, c: c };
  }
  function markSel(p) {
    clearSel();
    if (!p) return;
    const t = board.g[p.r][p.c];
    if (t && tileEls[t.id]) { tileEls[t.id].classList.add('sel'); sel = p; }
  }
  function clearSel() {
    if (sel) {
      const t = board.g[sel.r] && board.g[sel.r][sel.c];
      if (t && tileEls[t.id]) tileEls[t.id].classList.remove('sel');
    }
    sel = null;
  }
  function onDown(e) {
    if (!S || S.over || S.resolving || S.mode !== 'match3') return;
    const p = cellFromEvent(e);
    if (!p) return;
    ptr = { id: e.pointerId, x: e.clientX, y: e.clientY, cell: p, moved: false };
  }
  function onMove(e) {
    if (!ptr || e.pointerId !== ptr.id || !S || S.resolving || S.over || S.mode !== 'match3') return;
    const dx = e.clientX - ptr.x, dy = e.clientY - ptr.y;
    if (Math.abs(dx) < 16 && Math.abs(dy) < 16) return;
    const p1 = ptr.cell;
    const p2 = Math.abs(dx) > Math.abs(dy)
      ? { r: p1.r, c: p1.c + (dx > 0 ? 1 : -1) }
      : { r: p1.r + (dy > 0 ? 1 : -1), c: p1.c };
    ptr.moved = true; ptr = null;
    clearSel();
    if (p2.r < 0 || p2.c < 0 || p2.r >= ROWS || p2.c >= COLS) return;
    attemptSwap(p1, p2);
  }
  function onUp(e) {
    if (!ptr || e.pointerId !== ptr.id) { ptr = null; return; }
    const p = ptr.cell; ptr = null;
    if (!S || S.resolving || S.over || S.mode !== 'match3') return;
    if (sel && Math.abs(sel.r - p.r) + Math.abs(sel.c - p.c) === 1) {
      const a = sel; clearSel(); attemptSwap(a, p);
    } else if (sel && sel.r === p.r && sel.c === p.c) {
      clearSel();
    } else {
      markSel(p);
    }
  }

  /* ---------- intercambio y resolución ---------- */
  function attemptSwap(p1, p2) {
    const t1 = board.g[p1.r][p1.c], t2 = board.g[p2.r][p2.c];
    if (!t1 || !t2) return;
    if (t1.fog || t2.fog) { shakeAt(p1); shakeAt(p2); G.Sfx.play('bad'); return; }
    const res = G.Board.trySwap(board, p1, p2);
    if (!res.valid) {
      /* ida y vuelta */
      setPos(tileEls[t1.id], p2.r, p2.c); setPos(tileEls[t2.id], p1.r, p1.c);
      G.Sfx.play('bad');
      setTimeout(function () {
        setPos(tileEls[t1.id], p1.r, p1.c); setPos(tileEls[t2.id], p2.r, p2.c);
      }, 200);
      return;
    }
    S.resolving = true;
    setPos(tileEls[t1.id], p2.r, p2.c); setPos(tileEls[t2.id], p1.r, p1.c);
    const acc = { dmg: 0, panicShown: false };
    setTimeout(function () { runSteps(res.steps, 0, acc); }, 210);
  }

  function shakeAt(p) {
    const t = board.g[p.r] && board.g[p.r][p.c];
    if (!t || !tileEls[t.id]) return;
    const el = tileEls[t.id];
    el.classList.add('shake');
    setTimeout(function () { el.classList.remove('shake'); }, 300);
  }

  function runSteps(steps, i, acc) {
    if (!S || S.over) return;
    if (i >= steps.length) { afterResolve(acc); return; }
    const st = steps[i];
    if (st.shuffle) {
      G.UI.fct('Sin jugadas… ¡a remezclar la pintura!', 'quote', 'board');
      rebuildFromSnapshot(st.grid);
      setTimeout(function () { runSteps(steps, i + 1, acc); }, 450);
      return;
    }
    for (let k = 0; k < st.removed.length; k++) {
      const el = tileEls[st.removed[k].id];
      if (el) el.classList.add('pop');
    }
    G.Sfx.play('match', st.chain);
    applyStepEffects(st, acc);
    setTimeout(function () {
      for (let k = 0; k < st.removed.length; k++) {
        const id = st.removed[k].id;
        if (tileEls[id]) { tileEls[id].remove(); delete tileEls[id]; }
      }
      for (let k = 0; k < st.specials.length; k++) {
        const el = tileEls[st.specials[k].id];
        if (el) el.classList.add('special');
      }
      for (let k = 0; k < st.falls.length; k++) {
        const f = st.falls[k];
        if (f.spawn) {
          const el = document.createElement('div');
          el.className = 'tile c' + f.color;
          el.style.transform = 'translate(' + f.to.c * 100 + '%,' + (-(f.drop) * 110) + '%)';
          els.board.appendChild(el);
          tileEls[f.id] = el;
          void el.offsetWidth; /* fija el punto de partida antes de animar */
          setPos(el, f.to.r, f.to.c);
        } else if (tileEls[f.id]) {
          setPos(tileEls[f.id], f.to.r, f.to.c);
        }
      }
      setTimeout(function () { runSteps(steps, i + 1, acc); }, 250);
    }, 180);
  }

  function fearBuff() { return 1 + (S.miedo / 100) * 0.75; }

  function buzz(ms) {
    if (navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} }
  }

  function applyStepEffects(st, acc) {
    const ct = st.counts;
    const chainMult = 1 + (st.chain - 1) * 0.5;
    let dmg = (ct[0] || 0) * S.tileDmg;

    let y = ct[1] || 0;
    let used = Math.min(y, COST.coraje - S.coraje);
    S.coraje += used; dmg += (y - used) * 2;

    if (ct[2]) S.miedo = Math.max(0, S.miedo - ct[2] * 4);
    if (ct[3]) {
      const heal = Math.min(S.maxHp - S.hp, ct[3] * 2);
      if (heal > 0) { S.hp += heal; G.UI.fct('+' + heal, 'heal', 'hero'); }
    }
    let o = ct[4] || 0;
    if (S.hasAnnie) {
      used = Math.min(o, COST.annie - S.annieE);
      S.annieE += used; dmg += (o - used) * 2;
    } else dmg += o * 2;

    let v = ct[5] || 0;
    if (S.hasChiquis) {
      used = Math.min(v, COST.chiquis - S.chiqE);
      S.chiqE += used; dmg += (v - used) * 2;
    } else dmg += v * 2;

    if (st.fog > 0) {
      S.miedo = Math.max(0, S.miedo - st.fog * 2);
      G.UI.fct('niebla limpiada', 'quote', 'board');
    }

    let total = Math.round(dmg * chainMult * fearBuff());
    if (S.panic && total > 0) {
      total = 0;
      if (!acc.panicShown) { G.UI.fct('Esli tiembla… el golpe no salió', 'fear', 'hero'); acc.panicShown = true; }
    }
    if (total > 0) { acc.dmg += total; hitMonster(total); }
    if (st.chain >= 2) G.UI.fct('¡cadena x' + st.chain + '!', 'dmg', 'board');
    if ((st.chain >= 3 || (S.miedo >= 60 && total > 12)) && Math.random() < 0.5) {
      G.UI.fct(G.DATA.QUOTES[(Math.random() * G.DATA.QUOTES.length) | 0], 'quote', 'hero');
    }
    updateAll();
  }

  function hitMonster(d) {
    if (S.mhp <= 0) return;
    S.mhp = Math.max(0, S.mhp - d);
    els.mCanvas.classList.remove('hit');
    void els.mCanvas.offsetWidth;
    els.mCanvas.classList.add('hit');
    G.UI.fct('−' + d, 'dmg', 'monster');
    G.Sfx.play('hit');
    buzz(15);
    updateBars();
  }

  function afterResolve(acc) {
    if (S.panic) { S.panic = false; S.miedo = 60; }
    if (S.mhp <= 0) { win(); return; }
    S.counter--;
    if (S.counter <= 0) { monsterAct(); return; } /* sigue bloqueado hasta que golpee */
    S.resolving = false;
    updateAll();
  }

  /* ---------- turno del monstruo ---------- */
  function nextEffect() {
    const m = S.L.monster;
    if (m.effect !== 'boss') return m.effect;
    return S.bossFlip ? 'golpe' : 'niebla';
  }

  function monsterAct() {
    const m = S.L.monster;
    const eff = nextEffect();
    if (m.effect === 'boss') S.bossFlip = !S.bossFlip;
    S.counter = m.every;
    S.resolving = true;
    setTimeout(function () {
      if (!S || S.over) return;
      let dmg = m.atk, fear = 12;
      if (eff === 'graznido') { dmg = Math.ceil(m.atk * 0.5); fear = 22; }
      else if (eff === 'niebla') {
        dmg = Math.ceil(m.atk * 0.6); fear = 8;
        if (S.mode === 'match3') {
          const added = G.Board.addFog(board, 2, 6);
          for (let i = 0; i < added.length; i++) {
            const a = added[i];
            if (tileEls[a.oldId]) { tileEls[a.oldId].remove(); delete tileEls[a.oldId]; }
            mkTileEl(board.g[a.r][a.c], a.r, a.c);
          }
          if (added.length) G.UI.fct('¡niebla en el tablero!', 'fear', 'board');
        }
      } else if (eff === 'pinta') {
        dmg = Math.ceil(m.atk * 0.7); fear = 10;
        if (S.mode === 'match3') {
          const ch = G.Board.repaint(board, 3);
          for (let i = 0; i < ch.length; i++) {
            const el = tileEls[ch[i].id];
            if (el) el.className = 'tile c' + ch[i].color;
          }
          if (ch.length) G.UI.fct('¡escarcha repinta fichas!', 'fear', 'board');
        }
      }
      /* travesura propia del minijuego (revolver números, tapar cartas…) */
      if (S.mode !== 'match3') {
        const mo = G.Modes[S.mode];
        if (mo && mo.onAttack) mo.onAttack();
      }
      if (S.shield) {
        S.shield = false;
        G.UI.fct('¡Annie te abrigó! ✿', 'heal', 'hero');
        G.Sfx.play('shield');
      } else {
        S.hp = Math.max(0, S.hp - dmg);
        S.miedo = Math.min(100, S.miedo + fear);
        G.UI.fct('−' + dmg, 'fear', 'hero');
        els.eCanvas.classList.remove('ouch');
        void els.eCanvas.offsetWidth;
        els.eCanvas.classList.add('ouch');
        G.Sfx.play('ouch');
        buzz(40);
        if (S.miedo >= 100 && S.mode === 'match3') { S.panic = true; G.UI.fct('¡Pánico!', 'fear', 'hero'); }
      }
      if (S.hp <= 0) { lose(); return; }
      if (S.mode !== 'match3' && S.miedo >= 100) {
        /* en los minijuegos el pánico congela un instante */
        S.miedo = 60;
        G.UI.fct('¡Pánico! Esli se congela…', 'fear', 'hero');
        updateAll();
        setTimeout(function () { if (S && !S.over) { S.resolving = false; updateAll(); } }, 1100);
        return;
      }
      S.resolving = false;
      updateAll();
    }, 280);
    updateAll();
  }

  /* ---------- habilidades ---------- */
  function useCoraje() {
    if (!S || S.over || S.resolving || S.coraje < COST.coraje) return;
    S.coraje = 0;
    G.UI.fct('¡HAZLO CON MIEDO!', 'quote', 'hero');
    G.Sfx.play('coraje');
    if (S.mode !== 'match3') {
      /* en los minijuegos, el Coraje resuelve un paso por ti */
      const mo = G.Modes[S.mode];
      if (mo && mo.solveOne) mo.solveOne();
      updateAll();
      return;
    }
    const d = Math.round(S.corajeDmg * fearBuff());
    hitMonster(d);
    if (S.mhp <= 0) { win(); return; }
    updateAll();
  }
  function useAnnie() {
    if (!S || S.over || S.resolving || !S.hasAnnie || S.annieE < COST.annie) return;
    S.annieE = 0;
    S.shield = true;
    const heal = Math.min(S.maxHp - S.hp, 10);
    S.hp += heal;
    G.UI.fct('Abrigo de lana ✿ +' + heal, 'heal', 'hero');
    G.Sfx.play('shield');
    updateAll();
  }
  function useChiquis() {
    if (!S || S.over || S.resolving || !S.hasChiquis || S.chiqE < COST.chiquis) return;
    S.chiqE = 0;
    G.Sfx.play('bark');
    if (S.mode !== 'match3') {
      const mo = G.Modes[S.mode];
      if (mo && mo.chiquis) {
        mo.chiquis();
        G.UI.fct('¡GUAU! Chiquis te cubre un fallo', 'quote', 'monster');
      } else {
        S.counter = Math.min(S.counter + 2, 9);
        G.UI.fct('¡GUAU! el monstruo duda', 'quote', 'monster');
      }
      updateAll();
      return;
    }
    S.counter = Math.min(S.counter + 2, 9);
    G.UI.fct('¡GUAU! el monstruo duda', 'quote', 'monster');
    hitMonster(8);
    if (S.mhp <= 0) { win(); return; }
    updateAll();
  }

  /* ---------- ganar / perder ---------- */
  function win() {
    if (S.over) return;
    endBattle();
    G.Sfx.play('win');
    buzz(80);
    els.mCanvas.style.opacity = 0.18; /* el miedo se disipa */
    const idx = S.idx;
    setTimeout(function () { G.Game.onBattleWin(idx); }, 700);
  }
  function lose() {
    if (S.over) return;
    endBattle();
    const idx = S.idx;
    G.UI.modal({
      html: '<h3>La Niebla susurra…</h3><p>«¿Ves? Mejor ni lo intentes.»</p>' +
        '<p>Esli respira hondo. Las manos todavía le tiemblan. Perfecto: ya sabe pintar así.</p>',
      buttons: [
        { label: 'Otra pincelada', cb: function () { B.start(idx); } },
        { label: 'Volver al mapa', ghost: true, cb: function () { G.Game.toMap(); } }
      ]
    });
  }

  /* ---------- HUD ---------- */
  function updateBars() {
    els.mHp.style.width = (S.mhp / S.L.monster.hp * 100) + '%';
    els.mHpTxt.textContent = S.mhp + ' / ' + S.L.monster.hp;
    els.eHp.style.width = (S.hp / S.maxHp * 100) + '%';
    els.eHpTxt.textContent = S.hp + ' / ' + S.maxHp;
    els.eMiedo.style.width = S.miedo + '%';
    /* la mecánica central, visible: el miedo es un arma */
    const bono = Math.round(S.miedo * 0.75);
    els.eMiedoTxt.textContent = bono > 0 ? 'miedo · +' + bono + '% daño' : 'miedo';
  }
  const HINTS = {
    coraje: '¡Coraje listo! Toca el botón amarillo',
    annie: '¡La lana de Annie está lista!',
    chiquis: '¡El ladrido de Chiquis está listo!'
  };
  function updateAbility(btn, val, cost, on, kind) {
    if (!on) return;
    btn.querySelector('.ab-fill').style.height = Math.min(100, val / cost * 100) + '%';
    const ready = val >= cost;
    btn.classList.toggle('ready', ready);
    if (ready && !S.hint[kind]) {
      S.hint[kind] = true;
      G.UI.fct(HINTS[kind], 'quote', 'hero');
    }
  }
  function updateAll() {
    if (!S) return;
    updateBars();
    updateAbility(els.abCoraje, S.coraje, COST.coraje, true, 'coraje');
    updateAbility(els.abAnnie, S.annieE, COST.annie, S.hasAnnie, 'annie');
    updateAbility(els.abChiquis, S.chiqE, COST.chiquis, S.hasChiquis, 'chiquis');
    if (S.noCounter) {
      els.mIntent.textContent = S.fixedIntent;
    } else {
      const eff = nextEffect();
      els.mIntent.textContent = (G.DATA.EFFECT_NAMES[eff] || eff) + ' en ' + S.counter + ' ' +
        (S.counter === 1 ? S.tickWord[0] : S.tickWord[1]);
    }
    els.vignette.style.opacity = S.miedo / 140;
    const mood = S.miedo >= 55 ? 'scared' : 'normal';
    if (S._mood !== mood) {
      S._mood = mood;
      const ec = els.eCanvas.getContext('2d');
      ec.clearRect(0, 0, 96, 96);
      ec.drawImage(G.Sprites.portrait('esli', mood), 0, 0, 96, 96);
    }
  }
})();
