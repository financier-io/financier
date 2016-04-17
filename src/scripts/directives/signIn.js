angular.module('financier').directive('signIn', ($sce, $templateRequest, $templateCache, $compile, $timeout) => {

  function link(scope, element, attrs) {
    element.on('click', () => {
      const templateUrl = $sce.getTrustedResourceUrl('/scripts/directives/signIn.html');

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
          position: 'right middle',
          constrainToWindow: true,
          classes: 'drop-theme-arrows-bounce',
          openOn: 'click',
          tetherOptions: {
            // targetOffset: '0 20px',
            optimizations: {
              moveElement: true
            }
          }
        });

        dropInstance.on('open', () => {
          content.find('input')[0].focus();
        });

        dropInstance.on('close', () => {
          $timeout(() => {
            dropInstance.destroy();
          });
        });

        scope.submit = note => {
          dropInstance.close();
        };


        dropInstance.open();
      });
    });

  }

  return {
    restrict: 'A',
    link
  };
});
