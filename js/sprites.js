/* sprites.js — retratos y monstruos pintados a código */
window.G = window.G || {};
(function () {
  const S = (G.Sprites = {});
  const cache = {};

  function mk(sz) {
    const c = document.createElement('canvas');
    c.width = sz; c.height = sz;
    return c;
  }
  function ell(ctx, x, y, rx, ry, col, rot) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot || 0);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 7); ctx.fill();
    ctx.restore();
  }
  function st(ctx, x1, y1, cx, cy, x2, y2, col, w, a) {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.globalAlpha = a == null ? 1 : a;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cx, cy, x2, y2); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /* ---------- cara de Esli (reutilizable en retrato y autorretrato) ---------- */
  S.esliFace = function (ctx, cx, cy, s, mood, seed) {
    const rnd = G.Art.mulberry(seed || 11);
    const HAIR = ['#b03a02', '#d35400', '#e67e22', '#8c3502', '#f39c12'];
    /* melena trasera */
    for (let i = 0; i < 30; i++) {
      const a = Math.PI * (1.02 + (i / 30) * 0.96);
      const x0 = cx + Math.cos(a) * s * 0.72;
      const y0 = cy + Math.sin(a) * s * 0.78 - s * 0.06;
      const len = s * (0.45 + rnd() * 0.55);
      const out = a + (rnd() - 0.5) * 0.7;
      st(ctx, x0, y0,
        x0 + Math.cos(out) * len * 0.6 - Math.sin(out) * len * 0.35,
        y0 + Math.sin(out) * len * 0.6 + Math.cos(out) * len * 0.35,
        x0 + Math.cos(out) * len, y0 + Math.sin(out) * len,
        HAIR[(rnd() * HAIR.length) | 0], s * (0.1 + rnd() * 0.09));
    }
    /* cara */
    ell(ctx, cx, cy, s * 0.74, s * 0.82, '#f6d7b8');
    ell(ctx, cx - s * 0.45, cy + s * 0.28, s * 0.16, s * 0.11, 'rgba(235,150,120,.4)');
    ell(ctx, cx + s * 0.45, cy + s * 0.28, s * 0.16, s * 0.11, 'rgba(235,150,120,.4)');
    /* flequillo */
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const x0 = cx - s * 0.62 + t * s * 1.24;
      st(ctx, x0, cy - s * 0.72, x0 + (rnd() - 0.5) * s * 0.3, cy - s * 0.42,
        x0 + (rnd() - 0.5) * s * 0.34, cy - s * (0.28 + rnd() * 0.16),
        HAIR[(rnd() * HAIR.length) | 0], s * 0.13);
    }
    /* ojos verdes grandes */
    const ey = cy - s * 0.04, ex = s * 0.3;
    [-1, 1].forEach(function (k) {
      ell(ctx, cx + k * ex, ey, s * 0.17, s * 0.2, '#fff');
      ell(ctx, cx + k * ex, ey + s * 0.02, s * 0.1, s * 0.12, '#2e7d52');
      ell(ctx, cx + k * ex, ey + s * 0.03, s * 0.05, s * 0.06, '#10142a');
      ell(ctx, cx + k * ex - s * 0.03, ey - s * 0.04, s * 0.03, s * 0.035, '#fff');
    });
    /* cejas según ánimo */
    ctx.strokeStyle = '#8c3502'; ctx.lineWidth = s * 0.06; ctx.lineCap = 'round';
    if (mood === 'scared') {
      st(ctx, cx - ex - s * 0.14, ey - s * 0.22, cx - ex, ey - s * 0.34, cx - ex + s * 0.12, ey - s * 0.3, '#8c3502', s * 0.06);
      st(ctx, cx + ex + s * 0.14, ey - s * 0.22, cx + ex, ey - s * 0.34, cx + ex - s * 0.12, ey - s * 0.3, '#8c3502', s * 0.06);
    } else {
      st(ctx, cx - ex - s * 0.14, ey - s * 0.28, cx - ex, ey - s * 0.33, cx - ex + s * 0.13, ey - s * 0.28, '#8c3502', s * 0.06);
      st(ctx, cx + ex + s * 0.14, ey - s * 0.28, cx + ex, ey - s * 0.33, cx + ex - s * 0.13, ey - s * 0.28, '#8c3502', s * 0.06);
    }
    /* pecas */
    ctx.fillStyle = 'rgba(196,131,90,.85)';
    for (let i = 0; i < 7; i++) {
      const fx = cx + (rnd() - 0.5) * s * 0.8;
      const fy = cy + s * 0.22 + (rnd() - 0.5) * s * 0.14;
      ctx.beginPath(); ctx.arc(fx, fy, s * 0.025, 0, 7); ctx.fill();
    }
    /* nariz y boca */
    st(ctx, cx - s * 0.03, cy + s * 0.1, cx + s * 0.03, cy + s * 0.16, cx - s * 0.02, cy + s * 0.2, '#d8a47f', s * 0.05);
    if (mood === 'scared') {
      ell(ctx, cx, cy + s * 0.42, s * 0.1, s * 0.13, '#7a3b2e');
      ell(ctx, cx + s * 0.62, cy - s * 0.3, s * 0.05, s * 0.08, '#9bd1f5');
    } else if (mood === 'brave') {
      st(ctx, cx - s * 0.22, cy + s * 0.38, cx, cy + s * 0.52, cx + s * 0.22, cy + s * 0.38, '#7a3b2e', s * 0.06);
    } else {
      st(ctx, cx - s * 0.15, cy + s * 0.4, cx, cy + s * 0.48, cx + s * 0.15, cy + s * 0.4, '#7a3b2e', s * 0.055);
    }
  };

  function nightBg(ctx, sz, seed, col1, col2) {
    const rnd = G.Art.mulberry(seed);
    const g = ctx.createLinearGradient(0, 0, 0, sz);
    g.addColorStop(0, col1 || '#101c44'); g.addColorStop(1, col2 || '#0b1437');
    ctx.fillStyle = g; ctx.fillRect(0, 0, sz, sz);
    G.Art.strokeField(ctx, 0, 0, sz, sz, ['#1c2c5a', '#27408b', '#16224e'], {
      n: 40, len: sz * 0.16, width: 3, rnd: rnd, alpha: 0.6, jitter: 0.4,
      angleFn: function (x, y) { return Math.atan2(y - sz / 2, x - sz / 2) + 1.57; }
    });
  }

  /* ---------- retratos de compañía ---------- */
  function buildEsli(mood) {
    const sz = 192, c = mk(sz), ctx = c.getContext('2d');
    nightBg(ctx, sz, 5);
    G.Art.star(ctx, sz * 0.82, sz * 0.16, 6, G.Art.mulberry(9));
    /* bufanda verde azulada */
    ell(ctx, sz / 2, sz * 0.98, sz * 0.42, sz * 0.3, '#147a6b');
    ell(ctx, sz / 2 + 26, sz * 0.86, 9, 9, '#f1c40f');
    S.esliFace(ctx, sz / 2, sz * 0.46, sz * 0.26, mood, 21);
    return c;
  }

  function buildAnnie() {
    const sz = 192, c = mk(sz), ctx = c.getContext('2d');
    nightBg(ctx, sz, 8, '#1d3461', '#142a52');
    const rnd = G.Art.mulberry(31);
    /* copos */
    ctx.fillStyle = 'rgba(255,255,255,.8)';
    for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(rnd() * sz, rnd() * sz, 1.6 + rnd() * 1.6, 0, 7); ctx.fill(); }
    /* cuerpo nube */
    const W = '#fdfdf6', W2 = '#ece8da';
    ell(ctx, sz * 0.5, sz * 0.95, sz * 0.4, sz * 0.3, W);
    for (let i = 0; i < 16; i++) {
      ell(ctx, sz * (0.18 + rnd() * 0.64), sz * (0.78 + rnd() * 0.2), 13 + rnd() * 10, 11 + rnd() * 8, rnd() < 0.3 ? W2 : W);
    }
    /* cuello y cabeza */
    ell(ctx, sz * 0.5, sz * 0.62, sz * 0.13, sz * 0.26, W);
    ell(ctx, sz * 0.5, sz * 0.4, sz * 0.2, sz * 0.19, W);
    for (let i = 0; i < 7; i++) { ell(ctx, sz * 0.5 + (rnd() - 0.5) * 36, sz * 0.3 + (rnd() - 0.5) * 12, 8 + rnd() * 6, 7 + rnd() * 5, W); }
    /* orejitas */
    ell(ctx, sz * 0.36, sz * 0.27, 5.5, 11, W2, -0.4);
    ell(ctx, sz * 0.64, sz * 0.27, 5.5, 11, W2, 0.4);
    /* carita */
    ell(ctx, sz * 0.43, sz * 0.41, 3.4, 4.2, '#10142a');
    ell(ctx, sz * 0.57, sz * 0.41, 3.4, 4.2, '#10142a');
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(sz * 0.425, sz * 0.4, 1.1, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(sz * 0.565, sz * 0.4, 1.1, 0, 7); ctx.fill();
    ell(ctx, sz * 0.38, sz * 0.47, 4.5, 3, 'rgba(245,183,177,.75)');
    ell(ctx, sz * 0.62, sz * 0.47, 4.5, 3, 'rgba(245,183,177,.75)');
    st(ctx, sz * 0.47, sz * 0.49, sz * 0.5, sz * 0.52, sz * 0.53, sz * 0.49, '#9a8f7a', 2);
    return c;
  }

  function buildChiquis() {
    const sz = 192, c = mk(sz), ctx = c.getContext('2d');
    nightBg(ctx, sz, 13, '#3d2a10', '#241806');
    const K = '#191919', CR = '#f1dfb2', PK = '#caa3a0';
    /* orejotas */
    ctx.fillStyle = K;
    ctx.beginPath(); ctx.moveTo(sz * 0.2, sz * 0.42); ctx.lineTo(sz * 0.12, sz * 0.06); ctx.lineTo(sz * 0.46, sz * 0.3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(sz * 0.8, sz * 0.42); ctx.lineTo(sz * 0.88, sz * 0.06); ctx.lineTo(sz * 0.54, sz * 0.3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = PK;
    ctx.beginPath(); ctx.moveTo(sz * 0.235, sz * 0.36); ctx.lineTo(sz * 0.175, sz * 0.13); ctx.lineTo(sz * 0.4, sz * 0.3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(sz * 0.765, sz * 0.36); ctx.lineTo(sz * 0.825, sz * 0.13); ctx.lineTo(sz * 0.6, sz * 0.3); ctx.closePath(); ctx.fill();
    /* cabeza negra, hocico y pecho crema */
    ell(ctx, sz * 0.5, sz * 0.52, sz * 0.3, sz * 0.27, K);
    ell(ctx, sz * 0.5, sz * 1, sz * 0.34, sz * 0.26, K);
    ell(ctx, sz * 0.5, sz * 1.02, sz * 0.2, sz * 0.2, CR);
    ell(ctx, sz * 0.5, sz * 0.64, sz * 0.17, sz * 0.13, CR);
    /* cejitas crema (marca clásica) */
    ell(ctx, sz * 0.38, sz * 0.4, 3.8, 3.2, CR);
    ell(ctx, sz * 0.62, sz * 0.4, 3.8, 3.2, CR);
    /* ojazos brillantes */
    [-1, 1].forEach(function (k) {
      ell(ctx, sz * 0.5 + k * sz * 0.12, sz * 0.48, 7.5, 8.5, '#0a0a0a');
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(sz * 0.5 + k * sz * 0.12 - 2.5, sz * 0.455, 2.6, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(sz * 0.5 + k * sz * 0.12 + 2, sz * 0.5, 1.2, 0, 7); ctx.fill();
    });
    ell(ctx, sz * 0.5, sz * 0.6, 4.5, 3.4, '#0a0a0a');
    st(ctx, sz * 0.46, sz * 0.68, sz * 0.5, sz * 0.71, sz * 0.54, sz * 0.68, '#0a0a0a', 2);
    /* paliacate rojo */
    ctx.fillStyle = '#a93226';
    ctx.beginPath(); ctx.moveTo(sz * 0.3, sz * 0.78); ctx.lineTo(sz * 0.7, sz * 0.78); ctx.lineTo(sz * 0.5, sz * 0.94); ctx.closePath(); ctx.fill();
    return c;
  }

  function buildNarrator() {
    const sz = 192, c = mk(sz), ctx = c.getContext('2d');
    nightBg(ctx, sz, 17);
    G.Art.star(ctx, sz * 0.5, sz * 0.32, 10, G.Art.mulberry(3));
    /* pincel */
    ctx.save();
    ctx.translate(sz * 0.5, sz * 0.62); ctx.rotate(-0.5);
    ctx.fillStyle = '#8a5a2b'; ctx.fillRect(-5, -10, 10, 52);
    ctx.fillStyle = '#b5b8c4'; ctx.fillRect(-6, -22, 12, 14);
    ctx.fillStyle = '#e67e22';
    ctx.beginPath(); ctx.moveTo(-6, -22); ctx.quadraticCurveTo(0, -48, 6, -22); ctx.closePath(); ctx.fill();
    ctx.restore();
    return c;
  }

  /* ---------- monstruos ---------- */
  function eyes(ctx, x1, x2, y, r, col) {
    [x1, x2].forEach(function (x) {
      ell(ctx, x, y, r, r * 1.15, col || '#f5d76e');
      ell(ctx, x, y + r * 0.15, r * 0.4, r * 0.5, '#10142a');
    });
  }

  const MA = {
    cuervo: function (ctx, S, r) {
      ell(ctx, S * 0.5, S * 0.58, S * 0.22, S * 0.17, '#15151c');
      for (let i = 0; i < 14; i++) {
        const k = i < 7 ? -1 : 1, t = (i % 7) / 7;
        st(ctx, S * 0.5 + k * S * 0.12, S * 0.52,
          S * 0.5 + k * S * (0.3 + t * 0.12), S * (0.3 + t * 0.1),
          S * 0.5 + k * S * (0.42 + t * 0.05), S * (0.36 + t * 0.18), '#1f1f2e', 7);
      }
      ell(ctx, S * 0.5, S * 0.4, S * 0.11, S * 0.1, '#15151c');
      ctx.fillStyle = '#6b6f7e';
      ctx.beginPath(); ctx.moveTo(S * 0.56, S * 0.4); ctx.lineTo(S * 0.72, S * 0.43); ctx.lineTo(S * 0.56, S * 0.46); ctx.closePath(); ctx.fill();
      ell(ctx, S * 0.46, S * 0.38, S * 0.03, S * 0.035, '#f1c40f');
      ell(ctx, S * 0.46, S * 0.385, S * 0.012, S * 0.016, '#10142a');
      st(ctx, S * 0.3, S * 0.74, S * 0.5, S * 0.8, S * 0.7, S * 0.74, '#1f1f2e', 4);
    },
    marchito: function (ctx, S, r) {
      st(ctx, S * 0.5, S * 0.95, S * 0.4, S * 0.7, S * 0.52, S * 0.5, '#5d6d3a', 8);
      for (let i = 0; i < 12; i++) {
        const a = Math.PI * (0.15 + (i / 12) * 0.7) + Math.PI * 0.6;
        const x0 = S * 0.52 + Math.cos(a) * S * 0.13, y0 = S * 0.42 + Math.sin(a) * S * 0.13;
        st(ctx, x0, y0, x0 + Math.cos(a) * S * 0.1, y0 + Math.sin(a) * S * 0.16 + S * 0.06,
          x0 + Math.cos(a) * S * 0.13, y0 + Math.sin(a) * S * 0.2 + S * 0.12, i % 3 ? '#b7a86b' : '#8a7d4a', 8);
      }
      ell(ctx, S * 0.52, S * 0.42, S * 0.14, S * 0.14, '#4a3520');
      eyes(ctx, S * 0.47, S * 0.57, S * 0.4, S * 0.028, '#d8c690');
      st(ctx, S * 0.47, S * 0.49, S * 0.52, S * 0.46, S * 0.57, S * 0.49, '#2c2008', 3);
      st(ctx, S * 0.74, S * 0.6, S * 0.78, S * 0.7, S * 0.74, S * 0.8, '#b7a86b', 6);
    },
    remolino: function (ctx, S, r) {
      ctx.lineCap = 'round';
      const cols = ['#3f5fa3', '#7da7e8', '#dce6f5', '#27408b'];
      for (let arm = 0; arm < 26; arm++) {
        const a0 = (arm / 26) * 6.28;
        ctx.strokeStyle = cols[arm % 4]; ctx.lineWidth = 6;
        ctx.beginPath();
        for (let t = 0; t < 1; t += 0.2) {
          const a = a0 + t * 2.4, rad = S * 0.06 + t * S * 0.34;
          const x = S * 0.5 + Math.cos(a) * rad, y = S * 0.52 + Math.sin(a) * rad * 0.85;
          t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      eyes(ctx, S * 0.42, S * 0.58, S * 0.5, S * 0.045, '#fff');
      ell(ctx, S * 0.5, S * 0.6, S * 0.03, S * 0.045, '#10142a');
    },
    cobija: function (ctx, S, r) {
      ctx.fillStyle = '#5b3e8c';
      ctx.beginPath();
      ctx.moveTo(S * 0.22, S * 0.85);
      ctx.lineTo(S * 0.22, S * 0.4);
      ctx.quadraticCurveTo(S * 0.5, S * 0.1, S * 0.78, S * 0.4);
      ctx.lineTo(S * 0.78, S * 0.85);
      for (let i = 0; i < 5; i++) ctx.quadraticCurveTo(S * (0.78 - 0.056 - i * 0.112), S * (i % 2 ? 0.8 : 0.92), S * (0.78 - 0.112 - i * 0.112), S * 0.85);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#8e6e9c'; ctx.lineWidth = 3;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(S * (0.22 + i * 0.14), S * 0.32); ctx.lineTo(S * (0.22 + i * 0.14), S * 0.85); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(S * 0.22, S * (0.38 + i * 0.13)); ctx.lineTo(S * 0.78, S * (0.38 + i * 0.13)); ctx.stroke();
      }
      ctx.fillStyle = '#d4ac0d';
      ctx.fillRect(S * 0.58, S * 0.55, S * 0.1, S * 0.08);
      /* ojos dormilones */
      st(ctx, S * 0.38, S * 0.42, S * 0.42, S * 0.46, S * 0.46, S * 0.42, '#10142a', 4);
      st(ctx, S * 0.54, S * 0.42, S * 0.58, S * 0.46, S * 0.62, S * 0.42, '#10142a', 4);
      ell(ctx, S * 0.5, S * 0.52, S * 0.045, S * 0.06, '#2c1c4e');
    },
    murmullo: function (ctx, S, r) {
      [[0.32, 0.5, '#241a3e'], [0.68, 0.5, '#2c2148'], [0.5, 0.42, '#382a5c']].forEach(function (h) {
        ell(ctx, S * h[0], S * h[1], S * 0.17, S * 0.2, h[2]);
      });
      [[0.27, 0.48], [0.37, 0.48], [0.63, 0.48], [0.73, 0.48], [0.45, 0.4], [0.55, 0.4]].forEach(function (e) {
        ell(ctx, S * e[0], S * e[1], S * 0.025, S * 0.012, '#cfd5e8');
      });
      ctx.fillStyle = 'rgba(207,213,232,.7)';
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * 6.28;
        ell(ctx, S * 0.5 + Math.cos(a) * S * 0.33, S * 0.5 + Math.sin(a) * S * 0.3, 2.5, 2.5, 'rgba(207,213,232,.6)');
      }
      st(ctx, S * 0.3, S * 0.72, S * 0.5, S * 0.78, S * 0.7, S * 0.72, 'rgba(207,213,232,.5)', 3);
    },
    espina: function (ctx, S, r) {
      st(ctx, S * 0.5, S * 0.95, S * 0.46, S * 0.7, S * 0.5, S * 0.5, '#1e8449', 7);
      [[-0.08, 0.78], [0.08, 0.68], [-0.07, 0.6]].forEach(function (t) {
        st(ctx, S * (0.5 + t[0] * 0.3), S * t[1], S * (0.5 + t[0]), S * (t[1] - 0.02), S * (0.5 + t[0] * 1.4), S * (t[1] - 0.06), '#145a32', 4);
      });
      for (let i = 0; i < 8; i++) {
        const a = -1.57 + (i - 3.5) * 0.42;
        const x0 = S * 0.5, y0 = S * 0.46;
        st(ctx, x0, y0, x0 + Math.cos(a) * S * 0.12, y0 + Math.sin(a) * S * 0.2,
          x0 + Math.cos(a) * S * 0.17, y0 + Math.sin(a) * S * 0.26, i % 2 ? '#5b3e8c' : '#7d5ba6', 10);
      }
      ell(ctx, S * 0.5, S * 0.44, S * 0.07, S * 0.07, '#2c1c4e');
      ell(ctx, S * 0.5, S * 0.44, S * 0.035, S * 0.045, '#f5d76e');
      ell(ctx, S * 0.5, S * 0.45, S * 0.015, S * 0.02, '#10142a');
    },
    espanta: function (ctx, S, r) {
      ctx.strokeStyle = '#6e4a1f'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(S * 0.5, S * 0.35); ctx.lineTo(S * 0.5, S * 0.92); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(S * 0.24, S * 0.52); ctx.lineTo(S * 0.76, S * 0.52); ctx.stroke();
      ctx.fillStyle = '#3d2a10';
      ell(ctx, S * 0.5, S * 0.62, S * 0.14, S * 0.17, '#4a3318');
      ell(ctx, S * 0.5, S * 0.66, S * 0.07, S * 0.09, '#1a1208');
      ['#d4ac0d', '#b7950b'].forEach(function (col, k) {
        for (let i = 0; i < 5; i++) {
          st(ctx, S * (0.24 + k * 0.52), S * 0.52, S * (0.2 + k * 0.6), S * 0.56,
            S * (0.16 + k * 0.66 + i * 0.008), S * (0.56 + i * 0.02), col, 3);
        }
      });
      ell(ctx, S * 0.5, S * 0.32, S * 0.13, S * 0.14, '#caa45c');
      ctx.strokeStyle = '#5d4a23'; ctx.lineWidth = 3;
      [[-1, 0], [1, 0]].forEach(function (k) {
        const x = S * 0.5 + k[0] * S * 0.05, y = S * 0.3;
        ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke();
      });
      ctx.fillStyle = '#2c2008';
      ctx.beginPath(); ctx.moveTo(S * 0.34, S * 0.22); ctx.lineTo(S * 0.66, S * 0.22); ctx.lineTo(S * 0.58, S * 0.12); ctx.lineTo(S * 0.4, S * 0.14); ctx.closePath(); ctx.fill();
    },
    marea: function (ctx, S, r) {
      ctx.lineCap = 'round';
      const cols = ['#5d6d7e', '#85929e', '#aab7c4', '#2c3e50'];
      for (let i = 0; i < 22; i++) {
        const t = i / 22;
        ctx.strokeStyle = cols[i % 4]; ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(S * 0.15, S * (0.85 - t * 0.3));
        ctx.quadraticCurveTo(S * 0.45, S * (0.5 - t * 0.25), S * (0.62 + t * 0.1), S * (0.3 + t * 0.1));
        ctx.stroke();
      }
      for (let i = 0; i < 6; i++) {
        const a = 2 + i * 0.5;
        st(ctx, S * 0.66, S * 0.32, S * (0.66 + Math.cos(a) * 0.1), S * (0.32 + Math.sin(a) * 0.1),
          S * (0.66 + Math.cos(a) * 0.16), S * (0.32 + Math.sin(a) * 0.14), '#e8ecf2', 5);
      }
      ctx.fillStyle = '#e8ecf2';
      for (let i = 0; i < 5; i++) ell(ctx, S * (0.2 + i * 0.14), S * 0.84, 5, 5, '#dde3ec');
      eyes(ctx, S * 0.52, S * 0.62, S * 0.42, S * 0.03, '#ffb3a0');
    },
    eco: function (ctx, S, r) {
      ctx.strokeStyle = 'rgba(125,91,166,.5)';
      for (let i = 1; i < 5; i++) {
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(S * 0.5, S * 0.5, S * 0.1 * i, -0.6, 0.6); ctx.stroke();
        ctx.beginPath(); ctx.arc(S * 0.5, S * 0.5, S * 0.1 * i, 2.54, 3.74); ctx.stroke();
      }
      ctx.fillStyle = '#222d3d';
      ctx.beginPath();
      ctx.moveTo(S * 0.38, S * 0.85); ctx.lineTo(S * 0.38, S * 0.4);
      ctx.lineTo(S * 0.5, S * 0.18); ctx.lineTo(S * 0.62, S * 0.4); ctx.lineTo(S * 0.62, S * 0.85);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#161d2c';
      ctx.beginPath(); ctx.moveTo(S * 0.5, S * 0.12); ctx.lineTo(S * 0.46, S * 0.24); ctx.lineTo(S * 0.54, S * 0.24); ctx.closePath(); ctx.fill();
      /* ventana-ojo encendida */
      ell(ctx, S * 0.5, S * 0.45, S * 0.05, S * 0.075, '#f5d76e');
      ell(ctx, S * 0.5, S * 0.46, S * 0.02, S * 0.035, '#10142a');
      ctx.fillStyle = '#2c3a52';
      ctx.fillRect(S * 0.44, S * 0.62, S * 0.12, S * 0.23);
    },
    critico: function (ctx, S, r) {
      ctx.fillStyle = '#aab7c4';
      ctx.beginPath();
      ctx.moveTo(S * 0.36, S * 0.2); ctx.lineTo(S * 0.68, S * 0.26); ctx.lineTo(S * 0.74, S * 0.62);
      ctx.lineTo(S * 0.52, S * 0.88); ctx.lineTo(S * 0.3, S * 0.6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#cfd9e4';
      ctx.beginPath(); ctx.moveTo(S * 0.36, S * 0.2); ctx.lineTo(S * 0.56, S * 0.24); ctx.lineTo(S * 0.4, S * 0.56); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#5d6d7e'; ctx.lineWidth = 2.5;
      [[0.52, 0.24, 0.48, 0.86], [0.34, 0.46, 0.72, 0.5]].forEach(function (l) {
        ctx.beginPath(); ctx.moveTo(S * l[0], S * l[1]); ctx.lineTo(S * l[2], S * l[3]); ctx.stroke();
      });
      /* reflejo enojón */
      st(ctx, S * 0.42, S * 0.4, S * 0.46, S * 0.36, S * 0.5, S * 0.4, '#36455c', 4);
      st(ctx, S * 0.54, S * 0.4, S * 0.58, S * 0.36, S * 0.62, S * 0.4, '#36455c', 4);
      ell(ctx, S * 0.46, S * 0.45, S * 0.02, S * 0.03, '#36455c');
      ell(ctx, S * 0.58, S * 0.45, S * 0.02, S * 0.03, '#36455c');
      st(ctx, S * 0.44, S * 0.58, S * 0.52, S * 0.52, S * 0.6, S * 0.58, '#36455c', 4);
      ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(S * 0.3, S * 0.26); ctx.lineTo(S * 0.24, S * 0.2); ctx.lineTo(S * 0.32, S * 0.14); ctx.stroke();
    },
    helada: function (ctx, S, r) {
      ctx.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * 6.28;
        const x1 = S * 0.5 + Math.cos(a) * S * 0.36, y1 = S * 0.5 + Math.sin(a) * S * 0.36;
        st(ctx, S * 0.5, S * 0.5, S * 0.5 + Math.cos(a) * S * 0.2, S * 0.5 + Math.sin(a) * S * 0.2, x1, y1, '#aed6f1', 6);
        st(ctx, x1, y1, x1 + Math.cos(a + 0.5) * S * 0.07, y1 + Math.sin(a + 0.5) * S * 0.07,
          x1 + Math.cos(a + 0.8) * S * 0.09, y1 + Math.sin(a + 0.8) * S * 0.09, '#d6eaf8', 4);
        /* flor de almendro congelada en la punta */
        ell(ctx, x1, y1, 5.5, 5.5, 'rgba(248,200,220,.9)');
        ell(ctx, x1, y1, 2.2, 2.2, '#b03a52');
      }
      ell(ctx, S * 0.5, S * 0.5, S * 0.1, S * 0.1, '#85c1e9');
      st(ctx, S * 0.44, S * 0.47, S * 0.46, S * 0.45, S * 0.48, S * 0.47, '#1a5276', 3);
      st(ctx, S * 0.52, S * 0.47, S * 0.54, S * 0.45, S * 0.56, S * 0.47, '#1a5276', 3);
      st(ctx, S * 0.46, S * 0.55, S * 0.5, S * 0.53, S * 0.54, S * 0.55, '#1a5276', 3);
    },
    niebla: function (ctx, S, r) {
      const rnd = r || G.Art.mulberry(99);
      for (let i = 0; i < 26; i++) {
        ell(ctx, S * (0.2 + rnd() * 0.6), S * (0.3 + rnd() * 0.45),
          S * (0.1 + rnd() * 0.14), S * (0.07 + rnd() * 0.1),
          'rgba(' + (90 + (rnd() * 40 | 0)) + ',' + (90 + (rnd() * 40 | 0)) + ',' + (105 + (rnd() * 40 | 0)) + ',.55)');
      }
      /* tentáculos */
      [[-0.32, 0.75], [0.32, 0.75], [-0.4, 0.55], [0.4, 0.55]].forEach(function (t) {
        st(ctx, S * (0.5 + t[0] * 0.5), S * t[1], S * (0.5 + t[0] * 0.9), S * (t[1] + 0.1),
          S * (0.5 + t[0]), S * (t[1] - 0.06), 'rgba(120,120,140,.6)', 9);
      });
      /* colores robados, apenas visibles */
      ['#c0392b', '#f1c40f', '#27408b', '#1e8449'].forEach(function (col, i) {
        ell(ctx, S * (0.35 + i * 0.1), S * 0.62, 3, 3, col);
        ctx.fillStyle = 'rgba(100,100,115,.75)';
        ctx.fillRect(S * (0.35 + i * 0.1) - 4, S * 0.62 - 4, 8, 8);
      });
      eyes(ctx, S * 0.4, S * 0.6, S * 0.42, S * 0.05, '#e8e3c0');
    }
  };

  S.monster = function (key) {
    const ck = 'm_' + key;
    if (cache[ck]) return cache[ck];
    const sz = 200, c = mk(sz), ctx = c.getContext('2d');
    const rnd = G.Art.mulberry(key.length * 37 + 5);
    /* halo claro tras el monstruo (los oscuros se recortan contra él) */
    const g = ctx.createRadialGradient(sz / 2, sz / 2, 10, sz / 2, sz / 2, sz * 0.55);
    g.addColorStop(0, 'rgba(238,228,195,.42)');
    g.addColorStop(0.7, 'rgba(238,228,195,.18)');
    g.addColorStop(1, 'rgba(238,228,195,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(sz / 2, sz / 2, sz * 0.55, 0, 7); ctx.fill();
    (MA[key] || MA.cuervo)(ctx, sz, rnd);
    cache[ck] = c;
    return c;
  };

  S.portrait = function (who, mood) {
    const ck = 'p_' + who + '_' + (mood || '');
    if (cache[ck]) return cache[ck];
    let c;
    if (who === 'esli') c = buildEsli(mood || 'normal');
    else if (who === 'annie') c = buildAnnie();
    else if (who === 'chiquis') c = buildChiquis();
    else if (who === 'narrador') c = buildNarrator();
    else c = S.monster(who);
    cache[ck] = c;
    return c;
  };

  /* ---------- autorretrato (la imagen del rompecabezas) ---------- */
  S.selfPortrait = function () {
    if (cache.selfp) return cache.selfp;
    const W = 360, H = 480;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    const rnd = G.Art.mulberry(42);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#13205c'); g.addColorStop(1, '#1d3461');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const af = G.Art.vortexAngle([
      { x: W * 0.22, y: H * 0.18, r: 70, s: 1 },
      { x: W * 0.8, y: H * 0.3, r: 60, s: -1 }
    ]);
    G.Art.strokeField(ctx, 0, 0, W, H, ['#27408b', '#3f5fa3', '#5c7fc0', '#16224e', '#f5d76e'],
      { n: 520, len: 24, width: 3.5, angleFn: af, rnd: rnd, alpha: 0.75, jitter: 0.3 });
    G.Art.star(ctx, W * 0.84, H * 0.12, 8, rnd);
    G.Art.star(ctx, W * 0.14, H * 0.08, 6, rnd);
    /* girasoles en la esquina */
    for (let i = 0; i < 3; i++) {
      const fx = 36 + i * 40, fy = H - 36 - (i % 2) * 26;
      st(ctx, fx, H, fx - 6, fy + 30, fx, fy + 12, '#1e8449', 6);
      for (let p = 0; p < 10; p++) {
        const a = (p / 10) * 6.28;
        st(ctx, fx, fy, fx + Math.cos(a) * 10, fy + Math.sin(a) * 10,
          fx + Math.cos(a) * 17, fy + Math.sin(a) * 17, p % 2 ? '#f1c40f' : '#d4ac0d', 6);
      }
      ell(ctx, fx, fy, 7.5, 7.5, '#6e4a1f');
    }
    /* torso: saco verde azulado */
    ctx.fillStyle = '#147a6b';
    ctx.beginPath();
    ctx.moveTo(W * 0.22, H); ctx.quadraticCurveTo(W * 0.24, H * 0.66, W * 0.5, H * 0.62);
    ctx.quadraticCurveTo(W * 0.76, H * 0.66, W * 0.78, H); ctx.closePath(); ctx.fill();
    G.Art.strokeField(ctx, W * 0.24, H * 0.62, W * 0.52, H * 0.38, ['#0f6457', '#1b8e7d', '#117263'],
      { n: 90, len: 20, width: 4, angleFn: function () { return 1.2; }, rnd: rnd, alpha: 0.8, jitter: 0.3 });
    ctx.fillStyle = '#f6d7b8';
    ctx.fillRect(W * 0.45, H * 0.56, W * 0.1, H * 0.1);
    /* brazo con pincel en alto */
    st(ctx, W * 0.74, H * 0.86, W * 0.84, H * 0.72, W * 0.82, H * 0.56, '#147a6b', 16);
    ell(ctx, W * 0.82, H * 0.54, 9, 9, '#f6d7b8');
    ctx.save();
    ctx.translate(W * 0.82, H * 0.54); ctx.rotate(-0.35);
    ctx.fillStyle = '#8a5a2b'; ctx.fillRect(-3, -34, 6, 36);
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.moveTo(-4, -34); ctx.quadraticCurveTo(0, -52, 4, -34); ctx.closePath(); ctx.fill();
    ctx.restore();
    /* pin de estrella */
    ell(ctx, W * 0.38, H * 0.7, 7, 7, '#f1c40f');
    /* cabeza */
    S.esliFace(ctx, W * 0.5, H * 0.42, 64, 'brave', 77);
    return (cache.selfp = c);
  };

  /* textura de niebla para piezas faltantes */
  S.fogTexture = function (w, h, seed) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const rnd = G.Art.mulberry(seed || 7);
    ctx.fillStyle = '#43475a'; ctx.fillRect(0, 0, w, h);
    G.Art.strokeField(ctx, 0, 0, w, h, ['#565d72', '#6a7186', '#3a3e50'], {
      n: Math.max(24, (w * h / 160) | 0), len: w * 0.4, width: 4,
      angleFn: function (x, y) { return Math.sin(y * 0.06) * 0.5; }, rnd: rnd, alpha: 0.7, jitter: 0.4
    });
    ctx.fillStyle = 'rgba(200,205,220,.25)';
    ctx.font = 'italic ' + Math.round(h * 0.4) + 'px Georgia';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('?', w / 2, h / 2);
    return c;
  };
})();
