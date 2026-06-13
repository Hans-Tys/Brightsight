/**
 * @file event-hero.js
 * Makes the "Back to Events" link return to the previous page when the user
 * arrived from within the site, falling back to the link's href otherwise.
 */

(function (Drupal, once) {
  'use strict';

  Drupal.behaviors.eventHeroBack = {
    attach(context) {
      once('event-hero-back', '.event-hero__back[data-back]', context)
        .forEach(link => {
          link.addEventListener('click', e => {
            // Only intercept if there is in-site history to go back to.
            if (window.history.length > 1 && document.referrer &&
                document.referrer.indexOf(window.location.origin) === 0) {
              e.preventDefault();
              window.history.back();
            }
          });
        });
    }
  };

})(Drupal, once);
