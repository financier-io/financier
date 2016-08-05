angular.module('financier').directive('overspendingSelect', ($sce, $templateRequest, $templateCache, $compile, $timeout) => {

  function link(scope, element, attrs, ngModelCtrl) {

    element.on('click', () => {
      if (!scope.overspendingDisabled) {

        const templateUrl = $sce.getTrustedResourceUrl('/scripts/directives/overspendingSelect.html');
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
console.log(scope.propagatedModel)
          scope.overspending = (ngModelCtrl.$viewValue || scope.propagatedModel) ? 'allow' : 'deny';

          dropInstance.open();

          scope.close = () => {
            dropInstance.close();
          };

          scope.submit = value => {
            ngModelCtrl.$setViewValue(value === 'allow');

            dropInstance.close();
          };

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
    require: 'ngModel',
    scope: {
      overspendingDisabled: '=',
      propagatedModel: '='
    },
    link
  };
});
