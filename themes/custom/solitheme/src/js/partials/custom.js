/**
 * @file
 * Code for custom js.
 */

(function ($, Drupal, once) {
  Drupal.behaviors.solitheme = {
    attach: function (context, settings) {
      once("solitheme", "html").forEach(
        function () {
          const tobii = new Tobii()

          $('body').addClass('path-' + window.location.pathname.split("/")[1])

          let form = document.querySelector('#block-solitheme-content form')
          if (form) {
            let formElements = form.querySelectorAll('.js-form-item input')
            formElements.forEach(function (_fe_input) {
              let _fe = _fe_input.closest('.js-form-item');
              let _not_empty_class = "not_empty";
              if (_fe_input.value) {
                _fe.classList.add(_not_empty_class);
              } else {
                _fe.classList.remove(_not_empty_class);
              }
              _fe_input.addEventListener("input", function (ev) {
                if (this.value) {
                  _fe.classList.add(_not_empty_class);
                } else {
                  _fe.classList.remove(_not_empty_class);
                }
              });
              _fe_input.addEventListener("focus", function (ev) {
                _fe.classList.add(_not_empty_class);
              });
              _fe_input.addEventListener("blur", function (ev) {
                if (this.value) {
                  _fe.classList.add(_not_empty_class);
                } else {
                  _fe.classList.remove(_not_empty_class);
                }
              });
            })
          }


          const headerDiv = document.querySelector("header > div")
          var currentScrollPos = $(window).scrollTop();
          window.onscroll = function (currentScrollPos) {
            var currentScrollPos = $(window).scrollTop();
            if (currentScrollPos == 0 && headerDiv.classList.contains('moveUp')) {
              headerDiv.classList.remove('moveUp')
            } else {
              headerDiv.classList.add('moveUp')
            }
          };

          var vid = document.getElementById('backgroundMedia');
          //var vid = $('#v0')[0]; // jquery option



          //slider JS
          if ($('.s-slider-image').length != 0) {
            let slideIndex = 1;
            showSlides(slideIndex);

            // Next/previous controls
            function plusSlides(n) {
              showSlides(slideIndex += n);
            }

            // Thumbnail image controls
            function currentSlide(n) {
              showSlides(slideIndex = n);
            }

            function showSlides(n) {
              let i;
              let slides = document.getElementsByClassName("s-slider-image");
              if (n > slides.length) { slideIndex = 1 }
              if (n < 1) { slideIndex = slides.length }
              for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
              }
              slides[slideIndex - 1].style.display = "block";
            }

            $('.next').on('click', function () {

              plusSlides(1)
            })

            $('.previous').on('click', function () {
              plusSlides(-1);
            })
          }
        }
      );
    }
  };
})(jQuery, Drupal, once);
//# sourceMappingURL=navigation-menus.js.map
