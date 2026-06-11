/* Prueba de invariantes del motor match-3 (node test/board.test.js) */
const Board = require('../js/board.js');

function gridFull(b) {
  for (let r = 0; r < b.rows; r++) for (let c = 0; c < b.cols; c++) {
    if (!b.g[r][c]) return false;
  }
  return true;
}
function assert(cond, msg) {
  if (!cond) { console.error('FALLO:', msg); process.exit(1); }
}

let totalSwaps = 0, totalSteps = 0, specialsMade = 0;

for (let trial = 0; trial < 30; trial++) {
  const nc = 4 + (trial % 3);
  const b = Board.create(7, 7, nc);
  assert(gridFull(b), 'tablero inicial lleno');
  assert(Board.findRuns(b).length === 0, 'sin combinaciones al inicio');
  assert(Board.hasMoves(b), 'hay jugadas al inicio');

  /* simula niebla y repintado ocasional */
  if (trial % 3 === 0) Board.addFog(b, 2, 6);
  if (trial % 4 === 0) Board.repaint(b, 3);
  assert(Board.findRuns(b).length === 0, 'repaint no crea combinaciones');

  /* juega 60 movimientos válidos por tablero */
  for (let mv = 0; mv < 60; mv++) {
    let done = false;
    outer:
    for (let r = 0; r < 7 && !done; r++) {
      for (let c = 0; c < 7 && !done; c++) {
        const dirs = [[0, 1], [1, 0]];
        for (let d = 0; d < 2; d++) {
          const p1 = { r: r, c: c }, p2 = { r: r + dirs[d][0], c: c + dirs[d][1] };
          if (p2.r >= 7 || p2.c >= 7) continue;
          const res = Board.trySwap(b, p1, p2);
          if (res.valid) {
            totalSwaps++;
            totalSteps += res.steps.length;
            res.steps.forEach(s => { if (s.specials) specialsMade += s.specials.length; });
            done = true;
            break outer;
          }
        }
      }
    }
    assert(done, 'siempre existe una jugada válida (reshuffle funciona)');
    assert(gridFull(b), 'tablero lleno tras resolver');
    assert(Board.findRuns(b).length === 0, 'tablero en reposo sin combinaciones');
    assert(Board.hasMoves(b), 'quedan jugadas tras resolver');
  }
}

console.log('OK ✓  swaps:', totalSwaps, '| pasos de cascada:', totalSteps, '| fichas ✦ creadas:', specialsMade);
