/**
 * @file events-carousel.js
 * Drupal behavior for the 3D events carousel SDC.
 *
 * Events are lazy-loaded in pages: the carousel starts with the first page
 * and fetches the next one (same URL, ?page=n) when the user gets within a
 * few cards of the last loaded event.
 */

(function (Drupal, once) {
  'use strict';

  Drupal.behaviors.eventsCarousel = {
    attach(context) {
      once('events-carousel', '.carousel-section', context)
        .forEach(section => init(section));
    }
  };

  function init(section) {
    // ── Read event data serialised by Twig ──────────────
    const APPS = JSON.parse(section.dataset.events || '[]');
    if (!APPS.length) return;

    // ── Constants ────────────────────────────────────────
    const CARD_WIDTH     = 340;
    const CARD_GAP       = 180;
    const STEP           = CARD_WIDTH + CARD_GAP;
    const VISIBLE_SPREAD = 3;
    const AUTO_SPEED     = 0.00008; // index units per ms
    const TOTAL          = Math.max(parseInt(section.dataset.total || '0', 10), APPS.length);
    const PREFETCH_AHEAD = 5; // start loading when this close to the last loaded card

    // ── State ────────────────────────────────────────────
    let N                = APPS.length;
    let position         = 0;
    let velocity         = 0;
    let isDragging       = false;
    let lastPointerX     = 0;
    let lastFrameTime    = null;
    let lastDisplayIndex = -1;
    let bgActive         = 'A';
    let bgPending        = -1;
    let nextPage         = 1;
    let loadingPage      = false;

    const mousePositions = {};

    // ── DOM refs (scoped inside this section) ────────────
    const stageInner    = section.querySelector('#stageInner');
    const headerCounter = section.querySelector('#headerCounter');
    const dotsContainer = section.querySelector('#dots');
    const btnPrev       = section.querySelector('#btnPrev');
    const btnNext       = section.querySelector('#btnNext');
    const bgBlurA       = section.querySelector('#bgBlurA');
    const bgBlurB       = section.querySelector('#bgBlurB');

    // ── Math helpers ─────────────────────────────────────
    const mod        = (n, m) => ((n % m) + m) % m;
    const lerp       = (a, b, t) => a + (b - a) * t;
    const smoothstep = x => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
    const wrapOff    = (from, to, len) => { const d = mod(to - from, len); return d > len / 2 ? d - len : d; };

    // ── Card factory ─────────────────────────────────────
    function createCard(app, i) {
      mousePositions[i] = { x: 0, y: 0 };

      const root = document.createElement('div');
      root.className = 'card';
      root.setAttribute('role', 'tab');
      root.setAttribute('aria-label', app.name);
      root.style.display = 'none';

      root.innerHTML = `
        <div class="card__inner">
          <img class="card__image" src="${app.image_url}" alt="${app.name}" draggable="false" loading="lazy" />
          <div class="card__glare"></div>
          <div class="card__overlay"></div>
          ${app.is_hot ? '<div class="card__badge">HOT</div>' : ''}
          <div class="card__body">
            <div class="card__category">${app.category}</div>
            <div class="card__title">${app.name}</div>
            <p class="card__desc">${app.description}</p>
            <div class="card__footer">
              <div class="card__attendees">${app.attendees} ${Drupal.t('attendees')}</div>
              <button class="card__btn">${Drupal.t('Show More')}</button>
            </div>
          </div>
          <div class="card__glow-line"></div>
        </div>
        <div class="card__reflection">
          <img src="${app.image_url}" alt="" draggable="false" loading="lazy" />
        </div>`;

      root.addEventListener('click', () => goTo(i));
      // Show More on the focused card navigates to the event detail page.
      const showMoreBtn = root.querySelector('.card__btn');
      showMoreBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (app.url) {
          window.location.href = app.url;
        }
      });
      root.addEventListener('mousemove', e => {
        const r = root.getBoundingClientRect();
        mousePositions[i].x = ((e.clientX - r.left) / r.width  - 0.5) * 2;
        mousePositions[i].y = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      });
      root.addEventListener('mouseleave', () => {
        mousePositions[i].x = 0;
        mousePositions[i].y = 0;
      });

      stageInner.appendChild(root);
      return root;
    }

    function createDot(i) {
      const btn = document.createElement('button');
      btn.className = 'controls__dot';
      btn.style.width = '6px';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', Drupal.t('Go to event @n', { '@n': i + 1 }));
      btn.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(btn);
      return btn;
    }

    const cardEls = APPS.map(createCard);
    const dotEls  = APPS.map((_, i) => createDot(i));

    // ── Lazy page loading ────────────────────────────────
    function loadNextPage() {
      if (loadingPage || APPS.length >= TOTAL) {
        return;
      }
      loadingPage = true;

      const url = new URL(window.location.href);
      url.searchParams.set('page', String(nextPage));

      fetch(url.toString(), { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(response => response.text())
        .then(html => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const source = doc.querySelector('.carousel-section');
          const more = source ? JSON.parse(source.dataset.events || '[]') : [];
          more.forEach(app => {
            const i = APPS.length;
            APPS.push(app);
            cardEls.push(createCard(app, i));
            dotEls.push(createDot(i));
          });
          if (more.length) {
            N = APPS.length;
            nextPage++;
            lastDisplayIndex = -1; // refresh counter/dots on next frame
          }
          loadingPage = false;
        })
        .catch(() => {
          loadingPage = false;
        });
    }

    // ── Background crossfade ─────────────────────────────
    function triggerBg(index) {
      if (bgPending === index) return;
      bgPending = index;
      const incoming = bgActive === 'A' ? bgBlurB : bgBlurA;
      const outgoing  = bgActive === 'A' ? bgBlurA : bgBlurB;
      incoming.querySelector('img').src = APPS[index].image_url;
      incoming.classList.remove('hidden');
      incoming.classList.add('visible');
      outgoing.classList.remove('visible');
      outgoing.classList.add('hidden');
      bgActive = bgActive === 'A' ? 'B' : 'A';
    }

    // ── Per-frame card update ────────────────────────────
    function updateCards(renderPos) {
      const ri = mod(Math.round(renderPos), N);

      if (ri !== lastDisplayIndex) {
        lastDisplayIndex = ri;
        headerCounter.textContent = `${ri + 1} / ${TOTAL}`;
        dotEls.forEach((d, i) => {
          d.classList.toggle('active', i === ri);
          d.style.width = i === ri ? '24px' : '6px';
        });
        triggerBg(ri);

        // Fetch the next page when the user nears the last loaded card.
        if (APPS.length < TOTAL && APPS.length - ri <= PREFETCH_AHEAD) {
          loadNextPage();
        }
      }

      APPS.forEach((_, i) => {
        const raw    = i - renderPos;
        const offset = mod(raw + N / 2, N) - N / 2;
        const absOff = Math.abs(offset);

        if (absOff > VISIBLE_SPREAD) {
          cardEls[i].style.display = 'none';
          return;
        }
        cardEls[i].style.display = '';

        const c  = smoothstep(1 - Math.min(absOff, 1));
        const mx = mousePositions[i].x;
        const my = mousePositions[i].y;

        const shadowYellow = `0 0 0 1px rgba(232,255,87,${(0.25 * c).toFixed(3)}), 0 0 80px rgba(232,255,87,${(0.07 * c).toFixed(3)})`;
        const shadowBase   = `0 ${lerp(20, 60, c).toFixed(1)}px ${lerp(60, 120, c).toFixed(1)}px rgba(0,0,0,${lerp(0.7, 0.9, c).toFixed(3)})`;

        Object.assign(cardEls[i].style, {
          width:         `${CARD_WIDTH}px`,
          marginLeft:    `${-CARD_WIDTH / 2}px`,
          marginTop:     `${-lerp(170, 210, c)}px`,
          transform:     `translateX(${offset * STEP}px) translateZ(${lerp(-absOff * 60 - 20, 80, c)}px) rotateY(${offset * 38 + mx * 10 * c}deg) rotateX(${-my * 8 * c}deg) scale(${Math.max(0.65, 1 - absOff * 0.12)})`,
          opacity:       Math.max(0, 1 - absOff * 0.25),
          zIndex:        absOff < 0.5 ? 20 : VISIBLE_SPREAD + 1 - Math.floor(absOff),
          pointerEvents: absOff > VISIBLE_SPREAD ? 'none' : 'auto',
        });

        cardEls[i].querySelector('.card__inner').style.boxShadow =
          `${shadowBase}, ${shadowYellow}`;

        const img = cardEls[i].querySelector('.card__image');
        img.style.height = `${lerp(340, 420, c)}px`;
        img.style.filter = `brightness(${lerp(0.55, 1, c).toFixed(3)})`;

        cardEls[i].querySelector('.card__glare').style.background =
          `radial-gradient(circle at ${50 + mx * 35}% ${50 + my * 35}%, rgba(232,255,87,${(0.1 * c).toFixed(3)}) 0%, transparent 55%)`;

        cardEls[i].querySelector('.card__title').style.fontSize =
          `${lerp(1.3, 1.75, c).toFixed(3)}rem`;

        const desc = cardEls[i].querySelector('.card__desc');
        desc.style.opacity   = c.toFixed(3);
        desc.style.maxHeight = `${c * 80}px`;

        const btn = cardEls[i].querySelector('.card__btn');
        btn.style.opacity      = c.toFixed(3);
        btn.style.pointerEvents = c > 0.5 ? 'auto' : 'none';

        cardEls[i].querySelector('.card__glow-line').style.opacity =
          c.toFixed(3);
        cardEls[i].querySelector('.card__reflection').style.opacity =
          (0.15 * c).toFixed(3);
      });
    }

    // ── Navigation ───────────────────────────────────────
    function goTo(targetIndex) {
      velocity = wrapOff(position, targetIndex, N) * 0.04;
    }
    function prev() { velocity -= 0.15; }
    function next() { velocity += 0.15; }

    // ── Animation loop ───────────────────────────────────
    function tick(timestamp) {
      const delta = lastFrameTime === null ? 16 : timestamp - lastFrameTime;
      lastFrameTime = timestamp;
      if (!isDragging) {
        velocity *= 0.92;
        position  = mod(position + AUTO_SPEED * delta + velocity, N);
      }
      updateCards(position);
      requestAnimationFrame(tick);
    }

    // ── Pointer drag ─────────────────────────────────────
    section.addEventListener('pointerdown', e => {
      isDragging   = true;
      lastPointerX = e.clientX;
      velocity     = 0;
      section.setPointerCapture(e.pointerId);
      section.classList.add('is-dragging');
    });

    section.addEventListener('pointermove', e => {
      if (!isDragging) return;
      const dx     = e.clientX - lastPointerX;
      lastPointerX = e.clientX;
      const delta  = -dx / STEP;
      position     = mod(position + delta, N);
      velocity     = delta / 16;
    });

    const endDrag = () => {
      isDragging = false;
      section.classList.remove('is-dragging');
    };
    section.addEventListener('pointerup',     endDrag);
    section.addEventListener('pointercancel', endDrag);

    // ── Wheel / trackpad ─────────────────────────────────
    section.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY) * 0.5) return;
      e.preventDefault();
      const delta = (e.deltaX / STEP) * 0.4;
      velocity    = delta;
      position    = mod(position + delta, N);
    }, { passive: false });

    // ── Keyboard ─────────────────────────────────────────
    section.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    });

    // ── Button controls ──────────────────────────────────
    btnPrev.addEventListener('click', prev);
    btnNext.addEventListener('click', next);

    // ── Bootstrap ────────────────────────────────────────
    bgBlurA.querySelector('img').src = APPS[0].image_url;
    requestAnimationFrame(tick);
  }

})(Drupal, once);
