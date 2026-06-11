/* board.js — lógica pura del match-3 (sin DOM, testeable en Node) */
(function () {
  const root = typeof window !== 'undefined' ? window : globalThis;
  root.G = root.G || {};
  const Board = (root.G.Board = {});

  let nextId = 1;
  function mkTile(c) { return { id: nextId++, c: c, special: 0, fog: false }; }
  function mkFog() { return { id: nextId++, c: -1, special: 0, fog: true }; }
  function rnd(n) { return (Math.random() * n) | 0; }
  function key(r, c) { return r * 16 + c; }

  Board.create = function (cols, rows, ncolors) {
    const b = { cols: cols, rows: rows, n: ncolors, g: [] };
    for (let r = 0; r < rows; r++) {
      b.g.push([]);
      for (let c = 0; c < cols; c++) b.g[r].push(null);
    }
    fillNoMatch(b);
    if (!Board.hasMoves(b)) Board.reshuffle(b);
    return b;
  };

  function fillNoMatch(b) {
    for (let r = 0; r < b.rows; r++) {
      for (let c = 0; c < b.cols; c++) {
        let col;
        do { col = rnd(b.n); } while (
          (c >= 2 && b.g[r][c - 1] && b.g[r][c - 1].c === col && b.g[r][c - 2] && b.g[r][c - 2].c === col) ||
          (r >= 2 && b.g[r - 1][c] && b.g[r - 1][c].c === col && b.g[r - 2][c] && b.g[r - 2][c].c === col)
        );
        b.g[r][c] = mkTile(col);
      }
    }
  }

  function findRuns(b) {
    const runs = [];
    for (let r = 0; r < b.rows; r++) {
      let c = 0;
      while (c < b.cols) {
        const t = b.g[r][c];
        if (!t || t.fog) { c++; continue; }
        let e = c + 1;
        while (e < b.cols && b.g[r][e] && !b.g[r][e].fog && b.g[r][e].c === t.c) e++;
        if (e - c >= 3) {
          const cells = [];
          for (let i = c; i < e; i++) cells.push({ r: r, c: i });
          runs.push(cells);
        }
        c = e;
      }
    }
    for (let c = 0; c < b.cols; c++) {
      let r = 0;
      while (r < b.rows) {
        const t = b.g[r][c];
        if (!t || t.fog) { r++; continue; }
        let e = r + 1;
        while (e < b.rows && b.g[e][c] && !b.g[e][c].fog && b.g[e][c].c === t.c) e++;
        if (e - r >= 3) {
          const cells = [];
          for (let i = r; i < e; i++) cells.push({ r: i, c: c });
          runs.push(cells);
        }
        r = e;
      }
    }
    return runs;
  }
  Board.findRuns = findRuns;

  function swapCells(b, p1, p2) {
    const t = b.g[p1.r][p1.c];
    b.g[p1.r][p1.c] = b.g[p2.r][p2.c];
    b.g[p2.r][p2.c] = t;
  }

  Board.trySwap = function (b, p1, p2) {
    if (Math.abs(p1.r - p2.r) + Math.abs(p1.c - p2.c) !== 1) return { valid: false };
    const t1 = b.g[p1.r] && b.g[p1.r][p1.c];
    const t2 = b.g[p2.r] && b.g[p2.r][p2.c];
    if (!t1 || !t2 || t1.fog || t2.fog) return { valid: false };
    swapCells(b, p1, p2);
    if (findRuns(b).length === 0) {
      swapCells(b, p1, p2);
      return { valid: false };
    }
    return { valid: true, steps: resolveAll(b, [p1, p2]) };
  };

  function resolveAll(b, swapped) {
    const steps = [];
    let chain = 0;
    let guard = 0;
    while (guard++ < 40) {
      const runs = findRuns(b);
      if (!runs.length) break;
      chain++;
      const remove = new Set();
      const makeSpecial = [];
      for (let i = 0; i < runs.length; i++) {
        const cells = runs[i];
        if (cells.length >= 4) {
          let spec = null;
          if (swapped) {
            spec = cells.find(function (p) {
              return swapped.some(function (s) { return s.r === p.r && s.c === p.c; });
            });
          }
          if (!spec) spec = cells[(cells.length / 2) | 0];
          makeSpecial.push(spec);
        }
        for (let j = 0; j < cells.length; j++) remove.add(key(cells[j].r, cells[j].c));
      }
      /* las celdas que se vuelven ✦ no se eliminan ni explotan al crearse */
      for (let i = 0; i < makeSpecial.length; i++) remove.delete(key(makeSpecial[i].r, makeSpecial[i].c));
      /* fichas ✦ dentro del set limpian fila y columna (en cadena) */
      let added = true;
      while (added) {
        added = false;
        const arr = Array.from(remove);
        for (let i = 0; i < arr.length; i++) {
          const r = arr[i] >> 4, c = arr[i] & 15;
          const t = b.g[r][c];
          if (t && t.special && !t._boom) {
            t._boom = true;
            for (let x = 0; x < b.cols; x++) if (b.g[r][x] && !remove.has(key(r, x))) { remove.add(key(r, x)); added = true; }
            for (let y = 0; y < b.rows; y++) if (b.g[y][c] && !remove.has(key(y, c))) { remove.add(key(y, c)); added = true; }
          }
        }
      }
      /* la niebla pegada a una eliminación también se limpia */
      const base = Array.from(remove);
      for (let i = 0; i < base.length; i++) {
        const r = base[i] >> 4, c = base[i] & 15;
        const t = b.g[r][c];
        if (!t || t.fog) continue;
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (let d = 0; d < 4; d++) {
          const rr = r + dirs[d][0], cc = c + dirs[d][1];
          if (rr < 0 || cc < 0 || rr >= b.rows || cc >= b.cols) continue;
          const ft = b.g[rr][cc];
          if (ft && ft.fog) remove.add(key(rr, cc));
        }
      }
      /* eliminar y contar */
      const counts = {};
      let fogN = 0;
      const removedCells = [];
      remove.forEach(function (k) {
        const r = k >> 4, c = k & 15;
        const t = b.g[r][c];
        if (!t) return;
        removedCells.push({ r: r, c: c, id: t.id });
        if (t.fog) fogN++;
        else counts[t.c] = (counts[t.c] || 0) + 1;
        b.g[r][c] = null;
      });
      const specials = [];
      for (let i = 0; i < makeSpecial.length; i++) {
        const t = b.g[makeSpecial[i].r][makeSpecial[i].c];
        if (t) { t.special = 1; specials.push({ id: t.id }); }
      }
      /* gravedad + nuevas fichas */
      const falls = [];
      for (let c = 0; c < b.cols; c++) {
        let write = b.rows - 1;
        for (let r = b.rows - 1; r >= 0; r--) {
          const t = b.g[r][c];
          if (t) {
            if (write !== r) {
              b.g[write][c] = t; b.g[r][c] = null;
              falls.push({ id: t.id, to: { r: write, c: c } });
            }
            write--;
          }
        }
        let si = 0;
        for (let r = write; r >= 0; r--) {
          const t = mkTile(rnd(b.n));
          b.g[r][c] = t;
          falls.push({ id: t.id, spawn: true, to: { r: r, c: c }, color: t.c, drop: ++si });
        }
      }
      steps.push({ chain: chain, removed: removedCells, counts: counts, fog: fogN, specials: specials, falls: falls });
      swapped = null;
    }
    if (!Board.hasMoves(b)) {
      Board.reshuffle(b);
      steps.push({ shuffle: true, grid: Board.snapshot(b) });
    }
    return steps;
  }

  Board.hasMoves = function (b) {
    for (let r = 0; r < b.rows; r++) {
      for (let c = 0; c < b.cols; c++) {
        const dirs = [[0, 1], [1, 0]];
        for (let d = 0; d < 2; d++) {
          const r2 = r + dirs[d][0], c2 = c + dirs[d][1];
          if (r2 >= b.rows || c2 >= b.cols) continue;
          const t1 = b.g[r][c], t2 = b.g[r2][c2];
          if (!t1 || !t2 || t1.fog || t2.fog) continue;
          swapCells(b, { r: r, c: c }, { r: r2, c: c2 });
          const ok = findRuns(b).length > 0;
          swapCells(b, { r: r, c: c }, { r: r2, c: c2 });
          if (ok) return true;
        }
      }
    }
    return false;
  };

  Board.reshuffle = function (b) {
    const tiles = [];
    for (let r = 0; r < b.rows; r++) for (let c = 0; c < b.cols; c++) {
      const t = b.g[r][c];
      if (t && !t.fog) tiles.push(t);
    }
    let tries = 0;
    do {
      for (let i = tiles.length - 1; i > 0; i--) {
        const j = rnd(i + 1);
        const tmp = tiles[i].c; tiles[i].c = tiles[j].c; tiles[j].c = tmp;
      }
      tries++;
    } while (tries < 80 && (findRuns(b).length > 0 || !Board.hasMoves(b)));
    if (findRuns(b).length > 0 || !Board.hasMoves(b)) {
      /* plan B: rellenar de cero (la niebla se disipa, qué amable) */
      for (let r = 0; r < b.rows; r++) for (let c = 0; c < b.cols; c++) b.g[r][c] = null;
      fillNoMatch(b);
      if (!Board.hasMoves(b)) Board.reshuffle(b);
    }
  };

  Board.snapshot = function (b) {
    return b.g.map(function (row) {
      return row.map(function (t) {
        return t ? { id: t.id, c: t.c, special: t.special, fog: t.fog } : null;
      });
    });
  };

  /* la Niebla agrega bloqueos grises */
  Board.addFog = function (b, n, max) {
    let cur = 0;
    const free = [];
    for (let r = 0; r < b.rows; r++) for (let c = 0; c < b.cols; c++) {
      const t = b.g[r][c];
      if (!t) continue;
      if (t.fog) cur++;
      else if (!t.special) free.push({ r: r, c: c });
    }
    const out = [];
    let k = Math.min(n, Math.max(0, max - cur), free.length);
    while (k-- > 0) {
      const i = rnd(free.length);
      const p = free.splice(i, 1)[0];
      const old = b.g[p.r][p.c];
      const f = mkFog();
      b.g[p.r][p.c] = f;
      out.push({ r: p.r, c: p.c, id: f.id, oldId: old.id });
    }
    return out;
  };

  /* la Helada repinta fichas de un color (sin crear cascadas gratis) */
  Board.repaint = function (b, n) {
    const out = [];
    let guard = 0;
    while (out.length < n && guard++ < 30) {
      const r = rnd(b.rows), c = rnd(b.cols);
      const t = b.g[r][c];
      if (!t || t.fog || t.special) continue;
      const col = rnd(b.n);
      if (col === t.c) continue;
      const prev = t.c;
      t.c = col;
      if (findRuns(b).length > 0) { t.c = prev; continue; }
      out.push({ id: t.id, color: col });
    }
    return out;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Board;
})();
