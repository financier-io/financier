angular.module('financier').directive('outflowHelper', ($sce, $templateRequest, $templateCache, $compile, $timeout) => {

  function link(scope, element, attrs, ngModelCtrl) {

    element.on('click', () => {
      if (scope.outflowSetting) {

        const templateUrl = $sce.getTrustedResourceUrl('/scripts/directives/outflowHelper.html');
        let dropInstance;

        $templateRequest(templateUrl).then(template => {
          const wrap = angular.element('<div class="tooltip"></div>').append(template);
          const content = $compile(wrap)(scope);

          content.on('keypress keydown', e => {
            if (e.which === 27) {
              dropInstance.close();
            }
          });

          const dropInstance = new Drop({
            target: element[0],
            content: content[0],
            classes: 'drop-theme-arrows-bounce',
            openOn: 'click',
            position: 'bottom center'
          });

          dropInstance.open();

          dropInstance.on('close', () => {
            $timeout(() => {
              dropInstance.destroy();
            });
          });

        });
      }

    });
  }

  return {
    restrict: 'A',
    scope: {
      outflowDate: '=',
      outflowCategory: '=',
      outflowSetting: '='
    },
    link
  };
});
