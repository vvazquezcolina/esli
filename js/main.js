/* main.js — flujo del juego, guardado y sonido */
window.G = window.G || {};
(function () {
  /* ---------- sonido sintetizado (sin archivos) ---------- */
  const Sfx = (G.Sfx = {
    ctx: null, muted: false,
    ensure: function () {
      if (!this.ctx) {
        try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    tone: function (f, dur, type, vol, delay) {
      if (!this.ctx) return;
      const t0 = this.ctx.currentTime + (delay || 0);
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.08, t0 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(t0); o.stop(t0 + dur + 0.05);
    },
    play: function (name, arg) {
      if (this.muted || !this.ctx) return;
      switch (name) {
        case 'match': this.tone(280 + Math.min(arg || 1, 6) * 70, 0.12, 'triangle', 0.07); break;
        case 'bad': this.tone(130, 0.15, 'sawtooth', 0.04); break;
        case 'hit': this.tone(95, 0.2, 'square', 0.06); this.tone(60, 0.25, 'sine', 0.08); break;
        case 'ouch': this.tone(180, 0.25, 'sawtooth', 0.05); this.tone(120, 0.3, 'sine', 0.06, 0.05); break;
        case 'coraje': [392, 494, 587].forEach(function (f, i) { Sfx.tone(f, 0.18, 'triangle', 0.07, i * 0.07); }); break;
        case 'shield': this.tone(520, 0.3, 'sine', 0.06); this.tone(660, 0.35, 'sine', 0.04, 0.08); break;
        case 'bark': this.tone(700, 0.07, 'square', 0.06); this.tone(560, 0.09, 'square', 0.06, 0.09); break;
        case 'win': [392, 494, 587, 784].forEach(function (f, i) { Sfx.tone(f, 0.25, 'triangle', 0.08, i * 0.13); }); break;
        case 'piece': this.tone(880, 0.6, 'sine', 0.06); this.tone(1320, 0.8, 'sine', 0.03, 0.1); break;
      }
    }
  });

  /* ---------- estado y flujo ---------- */
  const KEY = 'esli_save_v1';
  const Game = (G.Game = {});

  Game.save = load() || { unlocked: 0, pieces: [], intro: false, muted: false };

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(Game.save)); } catch (e) {}
  }

  Game.pieceCount = function () {
    let n = 0;
    for (let i = 0; i < 12; i++) if (Game.save.pieces[i]) n++;
    return n;
  };

  Game.toMap = function () {
    G.UI.show('map');
    G.UI.renderMap();
  };

  Game.enterLevel = function (i) {
    if (i > Game.save.unlocked) return;
    const L = G.DATA.LEVELS[i];
    G.UI.setDialogContext(L.monster.key, L.monster.name, 'scared');
    G.UI.dialog(L.pre, function () { G.Battle.start(i); });
  };

  Game.onBattleWin = function (i) {
    const L = G.DATA.LEVELS[i];
    const first = !Game.save.pieces[i];
    Game.save.pieces[i] = true;
    if (i === Game.save.unlocked) Game.save.unlocked++;
    persist();
    G.UI.setDialogContext(L.monster.key, L.monster.name, 'brave');
    G.UI.dialog(L.post, function () {
      if (!first) { Game.toMap(); return; }
      G.Sfx.play('piece');
      const total = Game.pieceCount();
      G.UI.modal({
        html: '<h3>¡Fragmento recuperado!</h3>' +
          '<img class="piece-img" src="' + G.UI.pieceDataUrl(i) + '" alt="pieza del retrato">' +
          '<p>' + total + ' de 12 piezas. Esli se siente un poquito más Esli (+5 de vida máxima).</p>',
        buttons: [{
          label: 'Continuar', cb: function () {
            if (total >= 12) {
              G.UI.showStory(G.DATA.FINAL, function () {
                G.UI.show('puzzle');
                G.UI.renderPuzzle();
              });
            } else Game.toMap();
          }
        }]
      });
    });
  };

  Game.startPressed = function () {
    if (!Game.save.intro) {
      G.UI.showStory(G.DATA.INTRO, function () {
        Game.save.intro = true;
        persist();
        Game.toMap();
      });
    } else Game.toMap();
  };

  /* ---------- arranque ---------- */
  function boot() {
    const $ = function (id) { return document.getElementById(id); };

    Sfx.muted = !!Game.save.muted;
    $('btn-mute').classList.toggle('off', Sfx.muted);
    $('btn-mute').addEventListener('click', function () {
      Sfx.muted = !Sfx.muted;
      Game.save.muted = Sfx.muted;
      persist();
      this.classList.toggle('off', Sfx.muted);
    });
    document.addEventListener('pointerdown', function () { Sfx.ensure(); }, { once: false });

    if (Game.save.intro) {
      $('btn-start').textContent = 'Continuar';
      $('btn-reset').classList.remove('hidden');
    }
    $('btn-start').addEventListener('click', Game.startPressed);
    $('btn-how').addEventListener('click', function () {
      G.UI.modal({ html: G.DATA.HOWTO, buttons: [{ label: '¡A pintar!' }] });
    });
    $('btn-reset').addEventListener('click', function () {
      G.UI.modal({
        html: '<h3>¿Borrar todo?</h3><p>Se perderán las piezas recuperadas y el camino andado.</p>',
        buttons: [
          { label: 'Conservar mi avance', cb: function () {} },
          {
            label: 'Borrar y empezar de cero', ghost: true, cb: function () {
              try { localStorage.removeItem(KEY); } catch (e) {}
              location.reload();
            }
          }
        ]
      });
    });
    $('btn-puzzle').addEventListener('click', function () {
      G.UI.show('puzzle');
      G.UI.renderPuzzle();
    });
    $('btn-puzzle-back').addEventListener('click', Game.toMap);

    $('btn-share').addEventListener('click', function () {
      const n = Game.pieceCount();
      const data = {
        title: 'Esli — Las Piezas de Mí',
        text: n >= 12
          ? 'Armé el retrato completo de Esli, temblando todo el camino. «Hazlo con miedo.»'
          : 'Voy ' + n + ' de 12 piezas del retrato de Esli. «Hazlo con miedo.»',
        url: 'https://esli.vercel.app/'
      };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(data.text + ' ' + data.url);
        G.UI.modal({ html: '<h3>Enlace copiado</h3><p>Pégalo donde quieras. La Niebla odia la publicidad.</p>' });
      }
    });

    if ('serviceWorker' in navigator) {
      try { navigator.serviceWorker.register('sw.js'); } catch (e) {}
    }

    G.UI.show('title');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
