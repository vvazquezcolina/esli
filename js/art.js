/* art.js — pinceladas procedurales estilo Van Gogh (sin assets) */
window.G = window.G || {};
(function () {
  const Art = (G.Art = {});

  Art.mulberry = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  /* Campo de pinceladas cortas y curvas. opts: n, len, width, angleFn, rnd, alpha, jitter */
  Art.strokeField = function (ctx, x0, y0, w, h, palette, opts) {
    const rnd = opts.rnd || Math.random;
    const n = opts.n || 300;
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const x = x0 + rnd() * w, y = y0 + rnd() * h;
      const base = opts.angleFn ? opts.angleFn(x, y) : 0;
      const a = base + (rnd() - 0.5) * (opts.jitter == null ? 0.5 : opts.jitter);
      const len = (opts.len || 14) * (0.6 + rnd() * 0.8);
      const ca = Math.cos(a), sa = Math.sin(a);
      ctx.strokeStyle = palette[(rnd() * palette.length) | 0];
      ctx.lineWidth = (opts.width || 3) * (0.6 + rnd() * 0.9);
      ctx.globalAlpha = (opts.alpha == null ? 0.85 : opts.alpha) * (0.7 + rnd() * 0.3);
      const bend = len * 0.16 * (rnd() - 0.5) * 2;
      ctx.beginPath();
      ctx.moveTo(x - ca * len * 0.5, y - sa * len * 0.5);
      ctx.quadraticCurveTo(x - sa * bend, y + ca * bend, x + ca * len * 0.5, y + sa * len * 0.5);
      ctx.stroke();
    }
    ctx.restore();
  };

  /* Ángulo de flujo con vórtices (remolinos de La Noche Estrellada) */
  Art.vortexAngle = function (vorts) {
    return function (x, y) {
      let vx = 1, vy = 0.15;
      for (let i = 0; i < vorts.length; i++) {
        const v = vorts[i];
        const dx = x - v.x, dy = y - v.y;
        const d2 = dx * dx + dy * dy;
        const w = Math.exp(-d2 / (2 * v.r * v.r)) * (v.s || 1) * 3;
        const d = Math.sqrt(d2 + 1);
        vx += (-dy / d) * w;
        vy += (dx / d) * w;
      }
      return Math.atan2(vy, vx);
    };
  };

  /* Estrella con halos de arcos */
  Art.star = function (ctx, x, y, r, rnd) {
    const rr = rnd || Math.random;
    ctx.save();
    for (let ring = 0; ring < 2; ring++) {
      const rad = r * (1.7 + ring * 1.15);
      const n = 8 + ring * 6;
      ctx.strokeStyle = 'rgba(245,215,110,.8)';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5 - 0.18 * ring;
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * Math.PI * 2 + rr() * 0.4;
        ctx.beginPath();
        ctx.arc(x, y, rad, a0, a0 + (Math.PI * 2 / n) * 0.62);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 1.6);
    g.addColorStop(0, '#f9efc0');
    g.addColorStop(1, 'rgba(241,196,15,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, 7); ctx.fill();
    ctx.fillStyle = '#f7e8a0';
    ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, 7); ctx.fill();
    ctx.restore();
  };

  /* Ciprés en llamas verdes */
  Art.cypress = function (ctx, x, baseY, h, rnd) {
    const cols = ['#0b3d20', '#145a32', '#0a2e18', '#1d6b3f'];
    ctx.save();
    ctx.lineCap = 'round';
    const n = Math.max(20, (h / 3) | 0);
    for (let i = 0; i < n; i++) {
      const t = rnd();
      const y = baseY - t * h;
      const w = (1 - t) * h * 0.17 + 2;
      ctx.strokeStyle = cols[(rnd() * cols.length) | 0];
      ctx.lineWidth = 2 + rnd() * 2.5;
      ctx.globalAlpha = 0.92;
      const xx = x + (rnd() - 0.5) * w;
      ctx.beginPath();
      ctx.moveTo(xx, y + 6 + rnd() * 7);
      ctx.quadraticCurveTo(xx + (rnd() - 0.5) * 9, y - 5, x + (rnd() - 0.5) * w * 0.5, y - 9 - rnd() * 9);
      ctx.stroke();
    }
    ctx.restore();
  };

  function paintSky(ctx, w, hor, pal, rnd, nstars) {
    const grad = ctx.createLinearGradient(0, 0, 0, hor);
    grad.addColorStop(0, pal.sky[0]);
    grad.addColorStop(1, pal.sky[1] || pal.sky[0]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, hor);
    const vorts = [
      { x: w * (0.2 + rnd() * 0.2), y: hor * 0.3, r: w * 0.15, s: 1 },
      { x: w * (0.6 + rnd() * 0.25), y: hor * 0.45, r: w * 0.12, s: -1 },
      { x: w * 0.5, y: hor * 0.12, r: w * 0.1, s: 1 }
    ];
    const af = Art.vortexAngle(vorts);
    Art.strokeField(ctx, 0, 0, w, hor, pal.skyStrokes,
      { n: Math.round((w * hor) / 250), len: w * 0.05, width: 3, angleFn: af, rnd: rnd, alpha: 0.8, jitter: 0.35 });
    const ns = nstars == null ? 4 : nstars;
    for (let i = 0; i < ns; i++) {
      Art.star(ctx, w * (0.08 + rnd() * 0.84), hor * (0.08 + rnd() * 0.6), 4 + rnd() * 5, rnd);
    }
  }

  function paintGround(ctx, w, h, hor, pal, rnd) {
    ctx.fillStyle = pal.ground;
    ctx.fillRect(0, hor, w, h - hor);
    Art.strokeField(ctx, 0, hor, w, h - hor, pal.groundStrokes, {
      n: Math.round((w * (h - hor)) / 280), len: w * 0.055, width: 3.5,
      angleFn: function (x, y) { return 0.12 * Math.sin(x * 0.012) + ((y - hor) / (h - hor)) * 0.25; },
      rnd: rnd, alpha: 0.85, jitter: 0.25
    });
  }

  /* Pinta el fondo de una pantalla completa.
     kind: 'title' | 'story' | 'map' | 'battle' | 'puzzle'
     extras: { pal, seed, points (mapa: [{x,y} px]) } */
  Art.paintScreenBg = function (canvas, kind, extras) {
    const ex = extras || {};
    const dpr = Math.min(window.devicePixelRatio || 1, 1.3);
    const w = Math.round(window.innerWidth * dpr);
    const h = Math.round(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const ctx = canvas.getContext('2d');
    const rnd = Art.mulberry(ex.seed == null ? 77 : ex.seed);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (kind === 'title') {
      paintSky(ctx, w, h * 0.8, {
        sky: ['#0b1437', '#1b2a5e'],
        skyStrokes: ['#27408b', '#3f5fa3', '#1f618d', '#f5d76e', '#162a52']
      }, rnd, 6);
      paintGround(ctx, w, h, h * 0.8, {
        ground: '#0e2240', groundStrokes: ['#1a3a5c', '#254e78', '#0d2b45']
      }, rnd);
      Art.cypress(ctx, w * 0.12, h * 0.86, h * 0.42, rnd);
    } else if (kind === 'story') {
      paintSky(ctx, w, h, {
        sky: ['#0a1030', '#141d44'],
        skyStrokes: ['#1c2c5a', '#27408b', '#101c40']
      }, rnd, 3);
    } else if (kind === 'puzzle') {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#3d2f1a'); g.addColorStop(1, '#241a0d');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      Art.strokeField(ctx, 0, 0, w, h, ['#4a3920', '#332715', '#55432a'], {
        n: Math.round((w * h) / 600), len: w * 0.06, width: 4,
        angleFn: function () { return 0.05; }, rnd: rnd, alpha: 0.5, jitter: 0.15
      });
    } else if (kind === 'battle') {
      const pal = ex.pal;
      const hor = h * 0.42;
      paintSky(ctx, w, hor, pal, rnd, 3);
      paintGround(ctx, w, h, hor, pal, rnd);
      ctx.fillStyle = 'rgba(5,7,20,.35)';
      ctx.fillRect(0, 0, w, h);
    } else if (kind === 'map') {
      const hor = h * 0.34;
      paintSky(ctx, w, hor, {
        sky: ['#16224e', '#2e4482'],
        skyStrokes: ['#27408b', '#3f5fa3', '#5c7fc0', '#f5d76e']
      }, rnd, 5);
      paintGround(ctx, w, h, hor, {
        ground: '#a86f08',
        groundStrokes: ['#f1c40f', '#d68910', '#a9690a', '#f7dc6f', '#7d6608']
      }, rnd);
      Art.cypress(ctx, w * 0.92, hor + 14 * dpr, h * 0.2, rnd);
      /* camino que une los cuadros */
      const pts = (ex.points || []).map(function (p) { return { x: p.x * dpr, y: p.y * dpr }; });
      if (pts.length > 1) {
        ctx.save();
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (let pass = 0; pass < 2; pass++) {
          ctx.strokeStyle = pass === 0 ? 'rgba(58,44,18,.8)' : 'rgba(246,236,208,.75)';
          ctx.lineWidth = (pass === 0 ? 15 : 9) * dpr;
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            const mx = (pts[i - 1].x + pts[i].x) / 2, my = (pts[i - 1].y + pts[i].y) / 2;
            ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, mx, my);
          }
          ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
          ctx.stroke();
        }
        ctx.setLineDash([2 * dpr, 9 * dpr]);
        ctx.strokeStyle = 'rgba(168,111,8,.9)';
        ctx.lineWidth = 3 * dpr;
        ctx.stroke();
        ctx.restore();
      }
    }
    /* viñeta general suave */
    const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(4,6,16,.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  };
})();
