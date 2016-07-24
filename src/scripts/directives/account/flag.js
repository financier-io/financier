angular.module('financier').directive('flag', ($sce, $templateRequest, $templateCache, $compile, $timeout) => {

  function link(scope, element, attrs, ngModelCtrl) {
    element.on('click', () => {
      const templateUrl = $sce.getTrustedResourceUrl('/scripts/directives/account/flag.html');

      $templateRequest(templateUrl).then(template => {
        const wrap = angular.element('<div></div>').append(template);
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
          constrainToWindow: true,
          constrainToScrollParent: false,
          tetherOptions: {
            targetOffset: '0 -15px',
            optimizations: {
              moveElement: true
            }
          }
        });

        dropInstance.on('open', () => {
          scope.flag = ngModelCtrl.$viewValue;
        });

        dropInstance.on('close', () => {
          scope.flag = ngModelCtrl.$viewValue;

          $timeout(() => {
            dropInstance.destroy();
          });
        });

        scope.submit = flag => {
          ngModelCtrl.$setViewValue(flag);

          dropInstance.close();
        };


        dropInstance.open();
      });
    });

  }

  return {
    restrict: 'A',
    require: 'ngModel',
    controller: 'flagCtrl as flagCtrl',
    link
  };
});
