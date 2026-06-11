/* driver.js — smoke test: recorre pantallas y simula jugadas (solo con ?smoke=) */
(function () {
  function $(id) { return document.getElementById(id); }
  function click(el) { if (el) el.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  var target = (location.search.match(/smoke=(\w+)/) || [])[1] || 'title';
  window.addEventListener('error', function (e) {
    document.title = 'ERR: ' + e.message;
    console.error('SMOKE-ERROR', e.message, e.filename, e.lineno);
  });
  var lvl = parseInt((location.search.match(/lvl=(\d+)/) || [])[1] || '0', 10);
  var adv = parseInt((location.search.match(/adv=(\d+)/) || [])[1] || '0', 10);
  function seedSave(n) {
    G.Game.save.intro = true;
    G.Game.save.unlocked = n;
    G.Game.save.pieces = [];
    for (var i = 0; i < n; i++) G.Game.save.pieces[i] = true;
  }
  setTimeout(function () {
    if (target === 'title') return;
    if (target === 'puzzle') {
      seedSave(/full=1/.test(location.search) ? 12 : 5);
      click($('btn-start'));
      setTimeout(function () { click($('btn-puzzle')); }, 250);
      return;
    }
    if (lvl) seedSave(lvl);
    click($('btn-start'));
    setTimeout(function () {
      click($('btn-story-next'));
      if (target === 'map') return;
      setTimeout(function () {
        click(document.querySelector('.node.current'));
        if (target === 'dialog') {
          /* avanza 'adv' entradas (par de clics: completa texto + avanza) */
          var dlgEl = $('dialog'), k = 0;
          if (adv) {
            var ivd = setInterval(function () {
              click(dlgEl);
              setTimeout(function () { click(dlgEl); }, 80);
              if (++k >= adv) clearInterval(ivd);
            }, 900);
          }
          return;
        }
        var dlg = $('dialog');
        var n = 0;
        var iv = setInterval(function () {
          if (dlg.classList.contains('hidden')) { clearInterval(iv); play(); return; }
          click(dlg);
          if (++n > 40) clearInterval(iv);
        }, 120);
        function play() {
          var board = $('board');
          var rect = board.getBoundingClientRect();
          var cell = rect.width / 7;
          var tries = 0;
          var iv2 = setInterval(function () {
            if (++tries > 16) { clearInterval(iv2); console.log('SMOKE-DONE swaps simulados'); return; }
            var r = (Math.random() * 7) | 0, c = (Math.random() * 6) | 0;
            var x = rect.left + cell * (c + 0.5), y = rect.top + cell * (r + 0.5);
            function pe(type, xx, yy) {
              board.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: xx, clientY: yy, pointerId: 1 }));
            }
            pe('pointerdown', x, y);
            pe('pointermove', x + cell, y);
            pe('pointerup', x + cell, y);
          }, 750);
        }
      }, 250);
    }, 250);
  }, 350);
})();
