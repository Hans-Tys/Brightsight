// components/local-tasks/src/js/local-tasks.js
(function($, Drupal2, once2) {
  Drupal2.behaviors.localTasks = {
    attach: function(context, settings) {
      once2("localTasks", "html").forEach(
        function() {
          $(".local-task-trigger").on("click", function() {
            $(".local-tasks").toggleClass("open-tasks");
          });
        }
      );
    }
  };
})(jQuery, Drupal, once);
//# sourceMappingURL=local-tasks.js.map
