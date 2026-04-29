/**
 * @file
 * Mobile overlay functionality.
 */

(function ($, Drupal, once) {
  Drupal.behaviors.localTasks = {
    attach: function (context, settings) {
      once('localTasks', 'html').forEach(
        function () {
         $('.local-task-trigger').on("click" , function(){
          $('.local-tasks').toggleClass('open-tasks')
         })
        })
    }
  };
})(jQuery, Drupal, once);
