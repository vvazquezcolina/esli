/* modes.js — minijuegos alternativos: memorama, restaura, estrellas y eco.
   Cada modo usa el marco de batalla (monstruo, HP, miedo, habilidades) vía `api`:
   progress(p) vacía la vida del monstruo según el avance; tick() acerca su ataque. */
window.G = window.G || {};
(function () {
  const Modes = (G.Modes = {});

  function el(tag, cls, parent) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    parent.appendChild(e);
    return e;
  }
  function shuffle(a, rnd) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = ((rnd ? rnd() : Math.random()) * (i + 1)) | 0;
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ============================ MEMORAMA ============================ */
  Modes.memoria = (function () {
    const SYMS = [
      ['#ef6f56', '#a93226', '▲'], ['#f9e79f', '#d4ac0d', '●'], ['#7da7e8', '#1f4e96', '◆'],
      ['#6fcf8f', '#187a43', '✚'], ['#f6b26b', '#b9560a', '✿'], ['#b39ddb', '#5e3a8c', '♪'],
      ['#fdfdf6', '#9aa0b5', '✦'], ['#8e7cc3', '#4a235a', '☾'], ['#f7e8a0', '#c87f0a', '☀'],
      ['#aab7c4', '#34495e', '◗']
    ];
    let M = null;
    function start(ctx) {
      const pairs = ctx.cfg.pairs || 8;
      const cols = 4, rows = Math.ceil(pairs * 2 / 4);
      M = { api: ctx.api, cfg: ctx.cfg, pairs: pairs, found: 0, first: null, busy: false, combo: 0, cards: [] };
      ctx.api.config({ tickWord: ['fallo', 'fallos'], noCounter: false });
      const deck = [];
      for (let i = 0; i < pairs; i++) { deck.push(i, i); }
      shuffle(deck);
      for (let i = 0; i < deck.length; i++) {
        const c = el('div', 'card', ctx.board);
        const r = (i / cols) | 0, cc = i % cols;
        c.style.left = (cc * 100 / cols) + '%';
        c.style.top = (r * 100 / rows) + '%';
        c.style.width = (100 / cols) + '%';
        c.style.height = (100 / rows) + '%';
        const inner = el('div', 'card-inner', c);
        const sym = SYMS[deck[i]];
        inner.style.setProperty('--t-light', sym[0]);
        inner.style.setProperty('--t-dark', sym[1]);
        inner.dataset.glyph = sym[2];
        c.dataset.sym = deck[i];
        c.addEventListener('click', function () { tap(c); });
        M.cards.push(c);
      }
    }
    function tap(c) {
      if (!M || M.busy || M.api.locked()) return;
      if (c.classList.contains('fogged')) { c.classList.remove('fogged'); M.api.sfx('match', 1); return; }
      if (c.classList.contains('up') || c.classList.contains('cleared')) return;
      c.classList.add('up');
      if (!M.first) { M.first = c; return; }
      const a = M.first, b = c;
      M.first = null; M.busy = true;
      if (a.dataset.sym === b.dataset.sym) {
        setTimeout(function () {
          if (M.api.over()) return;
          a.classList.add('cleared'); b.classList.add('cleared');
          M.busy = false; M.found++; M.combo++;
          M.api.sfx('match', M.combo);
          M.api.charge(2); M.api.fearDown(2);
          if (M.combo >= 2) M.api.fct('¡memoria x' + M.combo + '!', 'dmg', 'board');
          M.api.progress(M.found / M.pairs);
        }, 380);
      } else {
        a.classList.add('wrong'); b.classList.add('wrong');
        M.api.sfx('bad');
        setTimeout(function () {
          if (M.api.over()) return;
          a.classList.remove('up', 'wrong'); b.classList.remove('up', 'wrong');
          M.busy = false; M.combo = 0;
          M.api.tick();
        }, 750);
      }
    }
    function onAttack() {
      if (!M || !M.cfg.fog) return;
      let n = 2;
      const libres = M.cards.filter(function (c) {
        return !c.classList.contains('cleared') && !c.classList.contains('up') && !c.classList.contains('fogged');
      });
      shuffle(libres);
      while (n-- > 0 && libres.length) libres.pop().classList.add('fogged');
      M.api.fct('¡la niebla tapa cartas!', 'fear', 'board');
    }
    function solveOne() {
      if (!M) return;
      const ocultas = M.cards.filter(function (c) { return !c.classList.contains('cleared'); });
      for (let i = 0; i < ocultas.length; i++) {
        for (let j = i + 1; j < ocultas.length; j++) {
          if (ocultas[i].dataset.sym === ocultas[j].dataset.sym) {
            if (M.first) { M.first.classList.remove('up'); M.first = null; }
            ocultas[i].classList.remove('fogged'); ocultas[j].classList.remove('fogged');
            ocultas[i].classList.add('up', 'cleared'); ocultas[j].classList.add('up', 'cleared');
            M.found++; M.api.charge(1);
            M.api.progress(M.found / M.pairs);
            return;
          }
        }
      }
    }
    return { start: start, onAttack: onAttack, solveOne: solveOne };
  })();

  /* ============================ RESTAURA ============================ */
  Modes.restaura = (function () {
    let M = null;
    function paintLirios() {
      const c = document.createElement('canvas');
      c.width = 360; c.height = 360;
      const x = c.getContext('2d');
      const rnd = G.Art.mulberry(61);
      const g = x.createLinearGradient(0, 0, 0, 360);
      g.addColorStop(0, '#4a7fb5'); g.addColorStop(0.45, '#7fb3d5'); g.addColorStop(0.46, '#1e8449'); g.addColorStop(1, '#145a32');
      x.fillStyle = g; x.fillRect(0, 0, 360, 360);
      G.Art.strokeField(x, 0, 0, 360, 165, ['#5c8ac9', '#86abdd', '#d4e6f1'], { n: 160, len: 22, width: 3, rnd: rnd, alpha: .8, jitter: .4, angleFn: function () { return 0.1; } });
      G.Art.strokeField(x, 0, 165, 360, 195, ['#145a32', '#27ae60', '#117a65'], { n: 240, len: 20, width: 3.5, rnd: rnd, alpha: .85, jitter: .3, angleFn: function () { return -1.3; } });
      for (let i = 0; i < 6; i++) {
        const fx = 30 + i * 60 + rnd() * 22, fy = 200 + rnd() * 120;
        x.strokeStyle = '#0b3d20'; x.lineWidth = 5; x.lineCap = 'round';
        x.beginPath(); x.moveTo(fx, fy + 60); x.quadraticCurveTo(fx - 6, fy + 30, fx, fy); x.stroke();
        for (let p = 0; p < 6; p++) {
          const a = -1.57 + (p - 2.5) * 0.5;
          x.strokeStyle = p % 2 ? '#5b3e8c' : '#7d5ba6'; x.lineWidth = 9;
          x.beginPath(); x.moveTo(fx, fy);
          x.quadraticCurveTo(fx + Math.cos(a) * 12, fy + Math.sin(a) * 18, fx + Math.cos(a) * 17, fy + Math.sin(a) * 24);
          x.stroke();
        }
        x.fillStyle = '#f5d76e';
        x.beginPath(); x.arc(fx, fy, 3.2, 0, 7); x.fill();
      }
      G.Art.star(x, 320, 36, 6, rnd);
      return c;
    }
    function paintRetrato() {
      const c = document.createElement('canvas');
      c.width = 360; c.height = 360;
      const x = c.getContext('2d');
      const rnd = G.Art.mulberry(15);
      x.fillStyle = '#1b2a5e'; x.fillRect(0, 0, 360, 360);
      G.Art.strokeField(x, 0, 0, 360, 360, ['#27408b', '#3f5fa3', '#16224e'], { n: 200, len: 26, width: 4, rnd: rnd, alpha: .7, jitter: .5, angleFn: function (xx, yy) { return Math.atan2(yy - 180, xx - 180) + 1.57; } });
      const p = G.Sprites.selfPortrait();
      x.drawImage(p, 45, 0, 270, 360);
      return c;
    }
    function start(ctx) {
      const grid = ctx.cfg.grid || [3, 4];
      const cols = grid[0], rows = grid[1], total = cols * rows;
      const img = ctx.cfg.img === 'retrato' ? paintRetrato() : paintLirios();
      const url = img.toDataURL();
      M = { api: ctx.api, cfg: ctx.cfg, cols: cols, rows: rows, total: total, sel: null, slots: [], frags: [] };
      ctx.api.config({ tickWord: ['cambio', 'cambios'], noCounter: false });
      for (let i = 0; i < total; i++) M.slots.push(i);
      let tries = 0;
      do { shuffle(M.slots); tries++; } while (tries < 30 && countOk() > 1);
      for (let s = 0; s < total; s++) {
        const f = el('div', 'frag', ctx.board);
        const r = (s / cols) | 0, c = s % cols;
        f.style.left = (c * 100 / cols) + '%';
        f.style.top = (r * 100 / rows) + '%';
        f.style.width = (100 / cols) + '%';
        f.style.height = (100 / rows) + '%';
        f.style.backgroundImage = 'url(' + url + ')';
        f.style.backgroundSize = (cols * 100) + '% ' + (rows * 100) + '%';
        f.dataset.slot = s;
        setPiece(f, M.slots[s]);
        f.addEventListener('click', function () { tap(f); });
        M.frags.push(f);
      }
      ctx.api.progress(countOk() / total);
    }
    function setPiece(f, piece) {
      f.dataset.piece = piece;
      const pr = (piece / M.cols) | 0, pc = piece % M.cols;
      f.style.backgroundPosition =
        (pc * 100 / (M.cols - 1)) + '% ' + (pr * 100 / (M.rows - 1)) + '%';
      f.classList.toggle('ok', +f.dataset.slot === piece);
    }
    function countOk() {
      let n = 0;
      for (let i = 0; i < M.slots.length; i++) if (M.slots[i] === i) n++;
      return n;
    }
    function swap(fa, fb, esJugada) {
      const pa = +fa.dataset.piece, pb = +fb.dataset.piece;
      setPiece(fa, pb); setPiece(fb, pa);
      M.slots[+fa.dataset.slot] = pb; M.slots[+fb.dataset.slot] = pa;
      fa.classList.add('swapped'); fb.classList.add('swapped');
      setTimeout(function () { fa.classList.remove('swapped'); fb.classList.remove('swapped'); }, 260);
      if (esJugada) {
        M.api.sfx('match', 1);
        M.api.charge(2);
        if (M.api.progress(countOk() / M.total)) return;
        M.api.tick();
      } else {
        M.api.progress(countOk() / M.total);
      }
    }
    function tap(f) {
      if (!M || M.api.locked()) return;
      if (!M.sel) { M.sel = f; f.classList.add('sel-f'); return; }
      if (M.sel === f) { f.classList.remove('sel-f'); M.sel = null; return; }
      const a = M.sel; a.classList.remove('sel-f'); M.sel = null;
      swap(a, f, true);
    }
    function onAttack() {
      if (!M) return;
      const ok = M.frags.filter(function (f) { return f.classList.contains('ok'); });
      const pool = ok.length >= 2 ? ok : M.frags.slice();
      shuffle(pool);
      if (pool.length >= 2) {
        swap(pool[0], pool[1], false);
        if (M.cfg.attackLine) M.api.fct(M.cfg.attackLine, 'fear', 'board');
      }
    }
    function solveOne() {
      if (!M) return;
      for (let s = 0; s < M.total; s++) {
        if (M.slots[s] !== s) {
          const fDest = M.frags[s];
          const fSrc = M.frags.find(function (f) { return +f.dataset.piece === s; });
          if (M.sel) { M.sel.classList.remove('sel-f'); M.sel = null; }
          swap(fDest, fSrc, false);
          M.api.charge(1);
          M.api.progress(countOk() / M.total);
          return;
        }
      }
    }
    return { start: start, onAttack: onAttack, solveOne: solveOne };
  })();

  /* ============================ ESTRELLAS ============================ */
  Modes.estrellas = (function () {
    let M = null;
    function start(ctx) {
      const n = ctx.cfg.stars || 14;
      M = { api: ctx.api, n: n, next: 1, stars: [] };
      ctx.api.config({ tickWord: ['toque', 'toques'], noCounter: false });
      const rnd = G.Art.mulberry(33);
      const pos = [];
      let guard = 0;
      while (pos.length < n && guard++ < 600) {
        const p = { x: 9 + rnd() * 82, y: 10 + rnd() * 80 };
        let ok = true;
        for (let i = 0; i < pos.length; i++) {
          const dx = p.x - pos[i].x, dy = p.y - pos[i].y;
          if (dx * dx + dy * dy < 17 * 17) { ok = false; break; }
        }
        if (ok) pos.push(p);
      }
      const labels = [];
      for (let i = 1; i <= pos.length; i++) labels.push(i);
      shuffle(labels);
      for (let i = 0; i < pos.length; i++) {
        const s = el('button', 'star-btn', ctx.board);
        s.style.left = pos[i].x + '%';
        s.style.top = pos[i].y + '%';
        s.textContent = labels[i];
        s.addEventListener('click', function () { tap(s); });
        M.stars.push(s);
      }
      M.n = pos.length;
    }
    function tap(s) {
      if (!M || M.api.locked() || s.classList.contains('lit')) return;
      if (+s.textContent === M.next) {
        s.classList.add('lit');
        M.api.sfx('match', 1 + (M.next % 5));
        M.api.charge(1); M.api.fearDown(1);
        M.next++;
        if (M.api.progress((M.next - 1) / M.n)) return;
        M.api.tick();
      } else {
        s.classList.add('wrong');
        setTimeout(function () { s.classList.remove('wrong'); }, 300);
        M.api.sfx('bad');
        M.api.fearUp(4);
        M.api.fct('¡esa no!', 'fear', 'board');
        M.api.tick();
      }
    }
    function onAttack() {
      if (!M) return;
      const restantes = M.stars.filter(function (s) { return !s.classList.contains('lit'); });
      const labels = restantes.map(function (s) { return s.textContent; });
      shuffle(labels);
      for (let i = 0; i < restantes.length; i++) restantes[i].textContent = labels[i];
      M.api.fct('¡el Remolino revolvió los números!', 'fear', 'board');
    }
    function solveOne() {
      if (!M) return;
      const s = M.stars.find(function (st) { return !st.classList.contains('lit') && +st.textContent === M.next; });
      if (!s) return;
      s.classList.add('lit');
      M.next++;
      M.api.charge(1);
      M.api.progress((M.next - 1) / M.n);
    }
    return { start: start, onAttack: onAttack, solveOne: solveOne };
  })();

  /* ============================ ECO ============================ */
  Modes.eco = (function () {
    const FREQS = [330, 415, 494, 587];
    let M = null;
    function start(ctx) {
      const rounds = ctx.cfg.rounds || 5;
      M = { api: ctx.api, rounds: rounds, round: 1, seq: [], pos: 0, playing: false, forgive: false, vitrales: [], timers: [] };
      ctx.api.config({ noCounter: true, fixedIntent: 'El Eco ataca cuando fallas' });
      const grid = el('div', 'vitral-grid', ctx.board);
      for (let i = 0; i < 4; i++) {
        const v = el('button', 'vitral v' + i, grid);
        (function (idx, elv) {
          elv.addEventListener('click', function () { tap(idx, elv); });
        })(i, v);
        M.vitrales.push(v);
      }
      M.msg = el('p', 'mode-msg', ctx.board);
      later(beginRound, 700);
    }
    function later(fn, ms) {
      const t = setTimeout(function () { if (M && !M.api.over()) fn(); }, ms);
      M.timers.push(t);
    }
    function light(i, dur) {
      const v = M.vitrales[i];
      v.classList.add('on');
      M.api.tone(FREQS[i], 0.32, 'triangle', 0.07);
      setTimeout(function () { v.classList.remove('on'); }, dur || 360);
    }
    function beginRound() {
      M.seq = [];
      const len = 2 + M.round;
      for (let i = 0; i < len; i++) {
        let v = (Math.random() * 4) | 0;
        if (i >= 1 && v === M.seq[i - 1] && Math.random() < 0.6) v = (v + 1) % 4;
        M.seq.push(v);
      }
      playSeq();
    }
    function playSeq() {
      M.playing = true; M.pos = 0;
      M.msg.textContent = 'Ronda ' + M.round + ' de ' + M.rounds + ' — escucha…';
      for (let i = 0; i < M.seq.length; i++) {
        (function (idx) { later(function () { light(M.seq[idx]); }, 600 + idx * 620); })(i);
      }
      later(function () {
        M.playing = false;
        M.msg.textContent = 'Ronda ' + M.round + ' de ' + M.rounds + ' — tu turno';
      }, 600 + M.seq.length * 620);
    }
    function tap(i, v) {
      if (!M || M.playing || M.api.locked()) return;
      light(i, 250);
      if (i === M.seq[M.pos]) {
        M.pos++;
        if (M.pos >= M.seq.length) {
          M.api.sfx('coraje');
          M.api.charge(3); M.api.fearDown(4);
          M.api.fct('¡eco devuelto!', 'dmg', 'board');
          if (M.api.progress(M.round / M.rounds)) return;
          M.round++;
          M.playing = true;
          later(beginRound, 1000);
        }
      } else {
        M.playing = true;
        if (M.forgive) {
          M.forgive = false;
          M.api.fct('¡Chiquis tapó el error con un ladrido!', 'heal', 'hero');
          later(playSeq, 900);
        } else {
          M.api.sfx('bad');
          M.api.monsterNow();
          later(playSeq, 1400);
        }
      }
    }
    function solveOne() {
      if (!M || M.playing || M.api.locked()) return;
      tap(M.seq[M.pos], M.vitrales[M.seq[M.pos]]);
    }
    function chiquis() { if (M) M.forgive = true; }
    /* hook de pruebas (driver de smoke) */
    function _debug() {
      return M ? { seq: M.seq.slice(), pos: M.pos, round: M.round, playing: M.playing } : null;
    }
    return { start: start, solveOne: solveOne, chiquis: chiquis, _debug: _debug };
  })();
})();
