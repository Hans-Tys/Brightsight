(function (Drupal) {
  Drupal.behaviors.timeline = {
    attach() {
      // Always query from document — position:fixed elements
      // are outside the context subtree Drupal passes in.
      const track = document.getElementById('timeline-track');
      const prev  = document.getElementById('timeline-prev');
      const next  = document.getElementById('timeline-next');
      const line  = document.getElementById('timeline-line');

      // Guard: stop if elements are missing or already initialised.
      if (!track || !prev || !next) return;
      if (track._tlInit) return;
      track._tlInit = true;

      // Scroll by one item width (based on first real item).
      function getScrollAmount() {
        const item = track.querySelector('.timeline-item');
        return item ? item.offsetWidth : Math.round(window.innerWidth * 0.3);
      }

      // Stretch the line div and toggle button disabled state.
      function update() {
        if (line) {
          line.style.width = track.scrollWidth + 'px';
        }

        const maxScroll = track.scrollWidth - track.clientWidth;
        prev.disabled = track.scrollLeft <= 0;
        next.disabled = track.scrollLeft >= maxScroll - 1;
      }

      prev.addEventListener('click', function () {
        track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
      });

      next.addEventListener('click', function () {
        track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
      });

      track.addEventListener('scroll', update, { passive: true });

      // Re-run on resize so the line and disabled states stay correct.
      window.addEventListener('resize', update, { passive: true });

      // Run immediately and again after all assets (images) have loaded,
      // because images affect scrollWidth.
      update();
      window.addEventListener('load', update);
    }
  };
})(Drupal);