import Drop from 'tether-drop';

angular.module('financier').directive('addCategory', ($compile, $timeout) => {
  return {
    restrict: 'A',
    scope: {
      addCategory: '&',
      addLabel: '@'
    },
    link(scope, element) {
      element.on('click', () => {
        const template = require('./addCategory.html');

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

        scope.$on('drop:close', () => {
          dropInstance.close();
        });

        scope.submit = name => {
          scope.addCategory({ name });

          dropInstance.close();
        };


        dropInstance.open();
      });
    }
  };
});
