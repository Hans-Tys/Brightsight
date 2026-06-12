/**
 * @file
 * Soft synthesized key click for tactile buttons.
 *
 * One shared AudioContext; click on press, slightly higher and quieter
 * tick on release. Silent for users preferring reduced motion.
 */

(function (Drupal, once) {
  var audioCtx = null;
  var STORAGE_KEY = 'bsKeySoundMuted';

  function isMuted() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    }
    catch (e) {
      return false;
    }
  }

  function setMuted(muted) {
    try {
      localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
    }
    catch (e) {
      // Private browsing — state just won't persist.
    }
  }

  function getContext() {
    if (!audioCtx) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) {
        return null;
      }
      audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function click(down) {
    if (isMuted() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    var ctx = getContext();
    if (!ctx) {
      return;
    }
    var t = ctx.currentTime;
    var duration = 0.016;

    var buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    var source = ctx.createBufferSource();
    source.buffer = buffer;

    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = down ? 2800 : 3800;
    filter.Q.value = 2;

    var gain = ctx.createGain();
    gain.gain.setValueAtTime(down ? 0.12 : 0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(t);
  }

  var ICON_ON = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M2 6h3l4-3.5v11L5 10H2z" fill="currentColor"/><path d="M11 5.5a3.4 3.4 0 0 1 0 5M13 4a5.6 5.6 0 0 1 0 8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
  var ICON_OFF = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M2 6h3l4-3.5v11L5 10H2z" fill="currentColor"/><path d="M11 5.5l4 5M15 5.5l-4 5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';

  function buildToggle() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bs-sound-toggle';
    var sync = function () {
      var muted = isMuted();
      btn.innerHTML = (muted ? ICON_OFF : ICON_ON) + '<span class="bs-sound-toggle__label">' + (muted ? Drupal.t('Sound off') : Drupal.t('Sound on')) + '</span>';
      btn.setAttribute('aria-pressed', String(muted));
      btn.setAttribute('aria-label', muted ? Drupal.t('Unmute interface sounds') : Drupal.t('Mute interface sounds'));
      btn.classList.toggle('is-muted', muted);
    };
    btn.addEventListener('click', function () {
      setMuted(!isMuted());
      sync();
      if (!isMuted()) {
        click(true);
        window.setTimeout(function () { click(false); }, 80);
      }
    });
    sync();
    return btn;
  }

  Drupal.behaviors.bsKeySound = {
    attach: function (context) {
      var selector = '.bs-button:not(.bs-button--flat), .light-console__key, .light-console__swatch';

      // Mount the mute toggle once per page, only when sound-capable
      // elements exist.
      if ((context === document || context.nodeType === 9 || document.body.contains(context)) &&
          document.querySelector(selector) &&
          once('bsSoundToggle', 'body').length) {
        document.body.appendChild(buildToggle());
      }

      once('bsKeySound', selector, context).forEach(function (el) {
        var isDown = false;
        el.addEventListener('pointerdown', function () {
          isDown = true;
          click(true);
        });
        var release = function () {
          if (!isDown) {
            return;
          }
          isDown = false;
          click(false);
        };
        el.addEventListener('pointerup', release);
        el.addEventListener('pointerleave', release);
        el.addEventListener('keydown', function (e) {
          if ((e.key === ' ' || e.key === 'Enter') && !isDown) {
            isDown = true;
            click(true);
          }
        });
        el.addEventListener('keyup', function (e) {
          if (e.key === ' ' || e.key === 'Enter') {
            release();
          }
        });
      });
    }
  };
})(Drupal, once);
