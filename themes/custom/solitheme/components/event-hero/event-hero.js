(function(e,r){"use strict";e.behaviors.eventHeroBack={attach(t){r("event-hero-back",".event-hero__back[data-back]",t).forEach(n=>{n.addEventListener("click",o=>{window.history.length>1&&document.referrer&&document.referrer.indexOf(window.location.origin)===0&&(o.preventDefault(),window.history.back())})})}}})(Drupal,once);
//# sourceMappingURL=event-hero.js.map
