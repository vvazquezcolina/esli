/* ui.js — pantallas, mapa, diálogos, modal, texto flotante y rompecabezas */
window.G = window.G || {};
(function () {
  const UI = (G.UI = {});
  let current = 'title';
  let curPal = null, curSeed = 0;
  let typer = null;

  function $(id) { return document.getElementById(id); }

  /* ---------- pantallas + fondo ---------- */
  UI.show = function (name, pal, seed) {
    current = name;
    if (pal !== undefined) curPal = pal;
    if (seed !== undefined) curSeed = seed;
    const screens = document.querySelectorAll('.screen');
    for (let i = 0; i < screens.length; i++) screens[i].classList.remove('active');
    $('screen-' + name).classList.add('active');
    if (name !== 'battle') $('vignette').style.opacity = 0;
    requestAnimationFrame(paintBg);
  };

  function paintBg() {
    const canvas = $('bg');
    if (current === 'map') {
      const area = $('map-area').getBoundingClientRect();
      const pts = G.DATA.MAP_POS.map(function (p) {
        return { x: area.left + p.x / 100 * area.width, y: area.top + p.y / 100 * area.height };
      });
      G.Art.paintScreenBg(canvas, 'map', { seed: 31, points: pts });
    } else if (current === 'battle') {
      G.Art.paintScreenBg(canvas, 'battle', { seed: 100 + curSeed, pal: curPal });
    } else {
      G.Art.paintScreenBg(canvas, current, { seed: current === 'title' ? 7 : 19 });
    }
  }

  let rsT = null;
  window.addEventListener('resize', function () {
    clearTimeout(rsT);
    rsT = setTimeout(function () {
      paintBg();
      if (current === 'map') UI.renderMap();
      if (current === 'puzzle') UI.renderPuzzle();
    }, 250);
  });

  /* ---------- historia ---------- */
  UI.showStory = function (paragraphs, cb) {
    const box = $('story-text');
    box.innerHTML = '';
    for (let i = 0; i < paragraphs.length; i++) {
      const p = document.createElement('p');
      p.textContent = paragraphs[i];
      if (paragraphs[i].slice(0, 1) === '—') p.className = 'firma';
      box.appendChild(p);
    }
    const btn = $('btn-story-next');
    btn.onclick = function () { btn.onclick = null; cb && cb(); };
    UI.show('story');
  };

  /* ---------- mapa ---------- */
  UI.renderMap = function () {
    const save = G.Game.save;
    const area = $('map-area');
    area.innerHTML = '';
    $('pieces-count').textContent = G.Game.pieceCount() + '/12';
    for (let i = 0; i < G.DATA.LEVELS.length; i++) {
      const p = G.DATA.MAP_POS[i];
      const node = document.createElement('button');
      node.className = 'node';
      node.style.left = p.x + '%';
      node.style.top = p.y + '%';
      const done = !!save.pieces[i];
      const isCurrent = i === save.unlocked;
      if (done) { node.classList.add('done'); node.textContent = '✓'; }
      else if (isCurrent) { node.classList.add('current'); node.textContent = i + 1; }
      else if (i > save.unlocked) { node.classList.add('locked'); node.textContent = i + 1; }
      else node.textContent = i + 1;
      if (isCurrent || done || i < save.unlocked) {
        (function (idx) {
          node.addEventListener('click', function () { G.Game.enterLevel(idx); });
        })(i);
      }
      if (isCurrent) {
        const lab = document.createElement('span');
        lab.className = 'node-label';
        lab.textContent = G.DATA.LEVELS[i].cuadro;
        node.appendChild(lab);
      }
      area.appendChild(node);
    }
  };

  /* ---------- diálogos ---------- */
  UI.dialog = function (seq, cb) {
    const box = $('dialog');
    const nameEl = $('dlg-name'), textEl = $('dlg-text');
    const canvas = $('dlg-canvas'), ctx = canvas.getContext('2d');
    let i = 0;
    function render() {
      const item = seq[i];
      const who = item.who === 'monster' ? null : item.who;
      const name = who ? G.DATA.NAMES[who] : (UI._monsterName || '???');
      nameEl.textContent = item.who === 'narrador' ? '' : name;
      ctx.clearRect(0, 0, 96, 96);
      const src = item.who === 'monster'
        ? G.Sprites.monster(UI._monsterKey || 'cuervo')
        : G.Sprites.portrait(item.who, item.who === 'esli' ? UI._esliMood : undefined);
      ctx.drawImage(src, 0, 0, 96, 96);
      /* máquina de escribir */
      if (typer) clearInterval(typer);
      const full = item.text;
      let n = 0;
      textEl.textContent = '';
      typer = setInterval(function () {
        n += 2;
        textEl.textContent = full.slice(0, n);
        if (n >= full.length) { clearInterval(typer); typer = null; }
      }, 16);
    }
    function advance() {
      if (typer) {  /* completa el texto primero */
        clearInterval(typer); typer = null;
        textEl.textContent = seq[i].text;
        return;
      }
      i++;
      if (i >= seq.length) {
        box.classList.add('hidden');
        box.removeEventListener('click', advance);
        cb && cb();
        return;
      }
      render();
    }
    box.addEventListener('click', advance);
    box.classList.remove('hidden');
    render();
  };
  UI.setDialogContext = function (monsterKey, monsterName, esliMood) {
    UI._monsterKey = monsterKey;
    UI._monsterName = monsterName;
    UI._esliMood = esliMood || 'scared';
  };

  /* ---------- modal ---------- */
  UI.modal = function (opts) {
    const m = $('modal');
    $('modal-content').innerHTML = opts.html;
    const btns = $('modal-btns');
    btns.innerHTML = '';
    (opts.buttons || [{ label: 'Entendido' }]).forEach(function (b) {
      const el = document.createElement('button');
      el.className = 'btn' + (b.ghost ? ' btn-ghost' : '');
      el.textContent = b.label;
      el.addEventListener('click', function () {
        m.classList.add('hidden');
        b.cb && b.cb();
      });
      btns.appendChild(el);
    });
    m.classList.remove('hidden');
  };

  /* ---------- texto flotante de combate ---------- */
  UI.fct = function (text, cls, anchor) {
    const layer = $('fct-layer');
    if (!layer) return;
    const screen = $('screen-battle').getBoundingClientRect();
    let ref;
    if (anchor === 'monster') ref = $('monster-canvas').getBoundingClientRect();
    else if (anchor === 'hero') ref = $('esli-canvas').getBoundingClientRect();
    else ref = $('board').getBoundingClientRect();
    const el = document.createElement('span');
    el.className = 'fct ' + (cls || '');
    el.textContent = text;
    const jx = (Math.random() - 0.5) * 40;
    el.style.left = (ref.left - screen.left + ref.width / 2 + jx) + 'px';
    el.style.top = (ref.top - screen.top + (anchor === 'board' ? 30 : ref.height * 0.25)) + 'px';
    layer.appendChild(el);
    /* que las frases largas no se corten en los bordes */
    const r = el.getBoundingClientRect(), lr = layer.getBoundingClientRect();
    let shift = 0;
    if (r.left < lr.left + 4) shift = lr.left + 4 - r.left;
    else if (r.right > lr.right - 4) shift = lr.right - 4 - r.right;
    if (shift) el.style.left = (parseFloat(el.style.left) + shift) + 'px';
    setTimeout(function () { el.remove(); }, 1000);
  };

  /* ---------- rompecabezas ---------- */
  const PCOLS = 3, PROWS = 4;

  function crackPath(ctx, x1, y1, x2, y2, seed) {
    const rnd = G.Art.mulberry(seed);
    const n = 6;
    ctx.moveTo(x1, y1);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const nx = x1 + (x2 - x1) * t + (rnd() - 0.5) * 7 * (x1 === x2 ? 1 : 0);
      const ny = y1 + (y2 - y1) * t + (rnd() - 0.5) * 7 * (y1 === y2 ? 1 : 0);
      ctx.lineTo(nx, ny);
    }
    ctx.lineTo(x2, y2);
  }

  UI.renderPuzzle = function () {
    const canvas = $('puzzle-canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const img = G.Sprites.selfPortrait();
    const pw = W / PCOLS, ph = H / PROWS;
    const pieces = G.Game.save.pieces;
    const count = G.Game.pieceCount();
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < 12; i++) {
      const r = (i / PCOLS) | 0, c = i % PCOLS;
      const x = c * pw, y = r * ph;
      if (pieces[i]) {
        ctx.drawImage(img, x, y, pw, ph, x, y, pw, ph);
      } else {
        ctx.drawImage(G.Sprites.fogTexture(Math.round(pw), Math.round(ph), i * 13 + 3), x, y, pw, ph);
      }
    }
    /* grietas doradas entre piezas (kintsugi) */
    ctx.save();
    ctx.lineWidth = count >= 12 ? 2.5 : 1.5;
    ctx.strokeStyle = count >= 12 ? 'rgba(212,175,55,.95)' : 'rgba(20,24,49,.8)';
    ctx.beginPath();
    for (let c = 1; c < PCOLS; c++) crackPath(ctx, c * pw, 0, c * pw, H, c * 7);
    for (let r = 1; r < PROWS; r++) crackPath(ctx, 0, r * ph, W, r * ph, 50 + r * 7);
    ctx.stroke();
    if (count >= 12) {
      ctx.strokeStyle = 'rgba(255,235,170,.5)';
      ctx.lineWidth = 5;
      ctx.stroke();
    }
    ctx.restore();
    $('puzzle-caption').textContent = count >= 12
      ? '«No quedó perfecto. Quedó mío.» — retrato completo, grietas de oro incluidas.'
      : 'Fragmentos recuperados: ' + count + ' de 12. Cada monstruo vencido devuelve un pedazo.';
  };

  /* imagen de una pieza individual (para el modal de victoria) */
  UI.pieceDataUrl = function (i) {
    const img = G.Sprites.selfPortrait();
    const pw = img.width / PCOLS, ph = img.height / PROWS;
    const r = (i / PCOLS) | 0, c = i % PCOLS;
    const cv = document.createElement('canvas');
    cv.width = pw; cv.height = ph;
    cv.getContext('2d').drawImage(img, c * pw, r * ph, pw, ph, 0, 0, pw, ph);
    return cv.toDataURL();
  };
})();
