/**
 * @file
 * Interactive light table: faders and buttons drive beam color, intensity,
 * tilt, strobe and chase on the stage viewport.
 */

(function (Drupal, once) {
  Drupal.behaviors.lightConsole = {
    attach: function (context) {
      once('lightConsole', '.light-console', context).forEach(function (root) {
        var fixtureCount = Math.min(Math.max(parseInt(root.dataset.fixtures || '6', 10), 2), 8);
        var palette = JSON.parse(root.dataset.colors || '[]');
        if (!palette.length) {
          palette = ['#ff9500', '#ff3d9a', '#00c8ff', '#bf5fff', '#39ff14', '#ffffff'];
        }

        var stage = root.querySelector('[data-stage]');
        var channelsEl = root.querySelector('[data-channels]');
        var readout = root.querySelector('[data-readout]');
        var masterFader = root.querySelector('[data-master]');
        var tiltFader = root.querySelector('[data-tilt]');

        var state = {
          master: parseInt(masterFader.value, 10) / 100,
          tilt: parseInt(tiltFader.value, 10),
          blackout: false,
          strobe: false,
          chase: false,
          strobeOn: true,
          chaseStep: 0,
          fixtures: []
        };

        // --- Build fixtures (beam + head on stage, fader strip on desk). ---
        for (var i = 0; i < fixtureCount; i++) {
          var color = palette[i % palette.length];
          var level = [80, 55, 70, 45, 65, 50, 60, 40][i] || 60;

          var beam = document.createElement('div');
          beam.className = 'light-console__beam';
          var head = document.createElement('div');
          head.className = 'light-console__head';
          var glow = document.createElement('div');
          glow.className = 'light-console__glow';
          var x = ((i + 0.5) / fixtureCount) * 100;
          beam.style.left = x + '%';
          head.style.left = x + '%';
          glow.style.left = x + '%';
          stage.appendChild(beam);
          stage.appendChild(head);
          stage.appendChild(glow);

          var strip = document.createElement('div');
          strip.className = 'light-console__channel';
          strip.innerHTML =
            '<span class="light-console__channel-no">' + String(i + 1).padStart(2, '0') + '</span>' +
            '<button type="button" class="light-console__swatch" aria-label="' + Drupal.t('Change color of fixture @n', { '@n': i + 1 }) + '"></button>' +
            '<span class="light-console__fader-frame"><input type="range" class="light-console__fader" min="0" max="100" value="' + level + '" aria-label="' + Drupal.t('Fixture @n intensity', { '@n': i + 1 }) + '" /></span>' +
            '<button type="button" class="light-console__key light-console__key--mini" aria-label="' + Drupal.t('Flash fixture @n', { '@n': i + 1 }) + '">GO</button>';
          channelsEl.appendChild(strip);

          state.fixtures.push({
            color: color,
            colorIndex: i % palette.length,
            level: level / 100,
            flash: false,
            beam: beam,
            head: head,
            glow: glow,
            swatch: strip.querySelector('.light-console__swatch'),
            fader: strip.querySelector('.light-console__fader'),
            go: strip.querySelector('.light-console__key--mini')
          });
        }

        function say(message) {
          readout.textContent = message;
        }

        function render() {
          state.fixtures.forEach(function (f, i) {
            var level = f.level * state.master;
            if (state.blackout) {
              level = 0;
            }
            if (state.strobe && !state.strobeOn) {
              level = 0;
            }
            if (state.chase && state.chaseStep !== i) {
              level *= 0.12;
            }
            if (f.flash) {
              level = 1;
            }
            var angle = state.tilt * (i / (state.fixtures.length - 1) - 0.5) * 2;
            f.beam.style.setProperty('--beam-color', f.color);
            f.beam.style.opacity = (level * 0.85).toFixed(3);
            f.beam.style.transform = 'translateX(-50%) rotate(' + angle.toFixed(1) + 'deg)';
            f.glow.style.setProperty('--beam-color', f.color);
            f.glow.style.opacity = (level * 0.7).toFixed(3);
            // Beam + head pivot at y=20px (the head mount); the floor pool sits
            // under the beam tip. Tip horizontal offset = -sin(angle) * length,
            // negative because CSS rotate() is clockwise.
            var rad = angle * Math.PI / 180;
            var beamLength = (stage.clientHeight || 420) - 20;
            var floorShift = -Math.sin(rad) * beamLength;
            f.glow.style.marginLeft = floorShift.toFixed(1) + 'px';
            f.head.style.setProperty('--beam-color', f.color);
            f.head.style.transform = 'translateX(-50%) rotate(' + angle.toFixed(1) + 'deg)';
            f.head.classList.toggle('is-on', level > 0.02);
            f.swatch.style.background = f.color;
            f.swatch.style.boxShadow = level > 0.02 ? '0 0 10px ' + f.color : 'none';
          });
        }

        // --- Channel controls. ---
        state.fixtures.forEach(function (f, i) {
          f.fader.addEventListener('input', function () {
            f.level = parseInt(f.fader.value, 10) / 100;
            say('CH ' + String(i + 1).padStart(2, '0') + ' @ ' + f.fader.value + '%');
            render();
          });
          f.swatch.addEventListener('click', function () {
            f.colorIndex = (f.colorIndex + 1) % palette.length;
            f.color = palette[f.colorIndex];
            say('CH ' + String(i + 1).padStart(2, '0') + ' COLOR ' + f.color.toUpperCase());
            render();
          });
          var pressGo = function (on) {
            return function (e) {
              e.preventDefault();
              f.flash = on;
              render();
            };
          };
          f.go.addEventListener('pointerdown', pressGo(true));
          f.go.addEventListener('pointerup', pressGo(false));
          f.go.addEventListener('pointerleave', pressGo(false));
        });

        // --- Master controls. ---
        masterFader.addEventListener('input', function () {
          state.master = parseInt(masterFader.value, 10) / 100;
          say('GRAND MASTER @ ' + masterFader.value + '%');
          render();
        });
        tiltFader.addEventListener('input', function () {
          state.tilt = parseInt(tiltFader.value, 10);
          say('TILT ' + (state.tilt > 0 ? '+' : '') + state.tilt + '°');
          render();
        });

        var flashBtn = root.querySelector('[data-flash]');
        var pressFlash = function (on) {
          return function (e) {
            e.preventDefault();
            state.fixtures.forEach(function (f) { f.flash = on; });
            say(on ? 'FLASH!' : 'READY');
            render();
          };
        };
        flashBtn.addEventListener('pointerdown', pressFlash(true));
        flashBtn.addEventListener('pointerup', pressFlash(false));
        flashBtn.addEventListener('pointerleave', pressFlash(false));

        var strobeBtn = root.querySelector('[data-strobe]');
        var strobeTimer = null;
        strobeBtn.addEventListener('click', function () {
          state.strobe = !state.strobe;
          strobeBtn.setAttribute('aria-pressed', String(state.strobe));
          strobeBtn.classList.toggle('is-active', state.strobe);
          if (state.strobe && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            strobeTimer = window.setInterval(function () {
              state.strobeOn = !state.strobeOn;
              render();
            }, 70);
            say('STROBE ON');
          }
          else {
            window.clearInterval(strobeTimer);
            state.strobe = false;
            state.strobeOn = true;
            strobeBtn.setAttribute('aria-pressed', 'false');
            strobeBtn.classList.remove('is-active');
            say('STROBE OFF');
          }
          render();
        });

        var chaseBtn = root.querySelector('[data-chase]');
        var chaseTimer = null;
        chaseBtn.addEventListener('click', function () {
          state.chase = !state.chase;
          chaseBtn.setAttribute('aria-pressed', String(state.chase));
          chaseBtn.classList.toggle('is-active', state.chase);
          if (state.chase) {
            chaseTimer = window.setInterval(function () {
              state.chaseStep = (state.chaseStep + 1) % state.fixtures.length;
              render();
            }, 220);
            say('CHASE RUNNING');
          }
          else {
            window.clearInterval(chaseTimer);
            say('CHASE STOPPED');
          }
          render();
        });

        var blackoutBtn = root.querySelector('[data-blackout]');
        blackoutBtn.addEventListener('click', function () {
          state.blackout = !state.blackout;
          blackoutBtn.setAttribute('aria-pressed', String(state.blackout));
          blackoutBtn.classList.toggle('is-active', state.blackout);
          say(state.blackout ? 'BLACKOUT' : 'RESTORED');
          render();
        });

        render();
      });
    }
  };
})(Drupal, once);
