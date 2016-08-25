angular.module('financier').directive('onEnterGoNext', () => {
  function link(scope, element, attrs) {
    element.on('keypress', e => {
      if (e.which === 13) {
        // enter key

        var els = document.querySelectorAll(`[tabindex='${attrs.tabindex}']`);

        for (var i = 0; i < els.length; i++) {
          if (els[i] === element[0]) {
            els[i + 1] && els[i + 1].focus();
            els[i + 1] && els[i + 1].select();
          }
        }
      }
    });
  }

  return {
    restrict: 'A',
    link
  };
});
