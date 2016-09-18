angular.module('financier').directive('onEnterGoNext', () => {
  function link(scope, element, attrs) {
    element.on('keypress', e => {
      if (e.which === 13) {
        // enter key

        var els = document.querySelectorAll(`[tabindex='${attrs.tabindex}']`);

        for (var i = 0; i < els.length; i++) {
          if (els[i] === element[0]) {
            if (els.length - 1 === i) {
              choose(els[0]);
            } else {
              choose(els[i + 1]);
            }
          }
        }
      }
    });

    function choose(el) {
      el.focus();
      el.select();
    }
  }

  return {
    restrict: 'A',
    link
  };
});
