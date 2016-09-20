import Drop from 'tether-drop';

angular.module('financier').directive('reconcileAccount', ($compile, $timeout) => {

  function link(scope, element, attrs, ngModelCtrl) {
    element.on('click', () => {
      const template = require('./reconcileAccount.html');

      const wrap = angular.element('<div></div>').append(template);
      const content = $compile(wrap)(scope);

      content.on('keypress keydown', e => {
        if (e.which === 27) {
          dropInstance.close();
        }
      });
// content.find('input')[0].focus();
      const dropInstance = new Drop({
        target: element[0],
        content: content[0],
        classes: 'drop-theme-arrows-bounce',
        openOn: 'click',
        position: 'bottom right',
        tetherOptions: {
          targetOffset: '0 -45px',
          optimizations: {
            moveElement: true
          }
        }
      });

      dropInstance.on('open', () => {
        scope.screen = 'IS_YOUR_BALANCE';

        scope.reconcileAmount = null;
      });

      dropInstance.on('close', () => {
        scope.val = {
          amount: 0
        };

        $timeout(() => {
          dropInstance.destroy();
        });
      });

      scope.$on('drop:close', () => {
        dropInstance.close();
      });

      dropInstance.open();

      scope.go = {
        reconciled(event) {
          event.stopPropagation();

          for (let i = 0; i < scope.reconcileAccount.transactions.length; i++) {
            const transaction = scope.reconcileAccount.transactions[i];

            if (transaction.cleared) {
              transaction.reconciled = true;
            }
          }

          scope.screen = 'RECONCILED';

          dropInstance.drop.classList.add('drop-theme--success');
        },
        amount(event) {
          event.stopPropagation();

          scope.screen = 'AMOUNT';

        },
        start(event) {
          event.stopPropagation();

          scope.reconcileAmount = scope.val.amount;

          dropInstance.close();
        }
      };

    });


  }

  return {
    restrict: 'A',
    link,
    scope: {
      reconcileAccount: '=',
      reconcileAmount: '='
    }
  };
});
