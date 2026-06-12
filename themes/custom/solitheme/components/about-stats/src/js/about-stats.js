/**
 * @file
 * Animates the sys-panel sliders into view and ticks the UTC clock.
 */

(function (Drupal, once) {
  Drupal.behaviors.aboutStats = {
    attach: function (context) {
      once('aboutStats', '[data-sys-panel]', context).forEach(function (panel) {
        var fills = panel.querySelectorAll('.about-stats__slider-fill');
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        var setWidths = function () {
          fills.forEach(function (fill) {
            fill.style.width = fill.dataset.percent + '%';
          });
        };

        if (reduced || !('IntersectionObserver' in window)) {
          setWidths();
        } else {
          fills.forEach(function (fill) {
            fill.style.width = '0%';
          });
          var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                observer.disconnect();
                setWidths();
              }
            });
          }, { threshold: 0.3 });
          observer.observe(panel);
        }

        var clock = panel.querySelector('[data-sys-clock]');
        if (clock) {
          var tick = function () {
            clock.textContent = new Date().toISOString().slice(11, 19) + ' UTC';
          };
          tick();
          window.setInterval(tick, 1000);
        }
      });
    }
  };
})(Drupal, once);
