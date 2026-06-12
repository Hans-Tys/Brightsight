/**
 * @file
 * Switches the featured project when a nav item is clicked.
 */

(function (Drupal, once) {
  Drupal.behaviors.projectsShowcase = {
    attach: function (context) {
      once('projectsShowcase', '.projects-showcase', context).forEach(function (section) {
        var projects;
        try {
          projects = JSON.parse(section.dataset.projects || '[]');
        } catch (e) {
          return;
        }

        var featured = section.querySelector('[data-showcase-featured]');
        var image = section.querySelector('[data-showcase-image]');
        var title = section.querySelector('[data-showcase-title]');
        var stats = section.querySelector('[data-showcase-stats]');
        var items = section.querySelectorAll('.project-nav-item[data-index]');

        items.forEach(function (item) {
          item.addEventListener('click', function () {
            var project = projects[parseInt(item.dataset.index, 10)];
            if (!project) {
              return;
            }

            items.forEach(function (other) {
              other.classList.remove('is-active');
              other.removeAttribute('aria-current');
            });
            item.classList.add('is-active');
            item.setAttribute('aria-current', 'true');

            featured.style.setProperty('--projects-showcase-accent', project.accent || '#ff9500');
            featured.classList.add('is-switching');

            window.setTimeout(function () {
              if (image && project.image) {
                image.src = project.image;
                image.alt = project.title || '';
              }
              if (title) {
                title.textContent = project.title || '';
              }
              if (stats) {
                stats.innerHTML = '';
                (project.stats || []).forEach(function (stat) {
                  var wrap = document.createElement('div');
                  wrap.className = 'projects-showcase__stat';
                  var dt = document.createElement('dt');
                  dt.className = 'projects-showcase__stat-label';
                  dt.textContent = stat.label;
                  var dd = document.createElement('dd');
                  dd.className = 'projects-showcase__stat-value';
                  dd.textContent = stat.value;
                  wrap.append(dt, dd);
                  stats.append(wrap);
                });
              }
              featured.classList.remove('is-switching');
            }, 150);
          });
        });
      });
    }
  };
})(Drupal, once);
