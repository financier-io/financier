import Drop from 'tether-drop';

angular.module('financier').directive('addMasterCategory', ($compile, $timeout) => {
  return {
    restrict: 'A',
    scope: {
      addMasterCategory: '='
    },
    link(scope, element, attrs) {
      element.on('click', () => {
        const template = require('./addMasterCategory.html');

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
          tetherOptions: {
            targetOffset: '0 -18px',
            optimizations: {
              moveElement: true
            }
          }
        });

        dropInstance.on('open', () => {
          content.find('input')[0].focus();
        });

        dropInstance.on('close', () => {
          scope.name = null;

          $timeout(() => {
            dropInstance.destroy();
          });
        });

        scope.submit = name => {
          scope.addMasterCategory(name);

          dropInstance.close();
        };


        dropInstance.open();
      });
    }
  };
});
