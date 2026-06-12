/**
 * @file
 * Counts the stat number up from 0 when it enters the viewport.
 */

(function (Drupal, once) {
  Drupal.behaviors.statCounter = {
    attach: function (context) {
      once('statCounter', '.stat-counter', context).forEach(function (counter) {
        var target = parseFloat(counter.dataset.value || '0');
        var duration = parseInt(counter.dataset.duration || '1800', 10);
        var valueEl = counter.querySelector('[data-counter-value]');

        if (!valueEl || !('IntersectionObserver' in window)) {
          return;
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          return;
        }

        valueEl.textContent = '0';

        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
              return;
            }
            observer.disconnect();

            var start = null;
            var step = function (timestamp) {
              if (start === null) {
                start = timestamp;
              }
              var progress = Math.min((timestamp - start) / duration, 1);
              // Ease-out cubic so the count decelerates into the target.
              var eased = 1 - Math.pow(1 - progress, 3);
              valueEl.textContent = Math.round(target * eased).toLocaleString();
              if (progress < 1) {
                window.requestAnimationFrame(step);
              }
            };
            window.requestAnimationFrame(step);
          });
        }, { threshold: 0.4 });

        observer.observe(counter);
      });
    }
  };
})(Drupal, once);
