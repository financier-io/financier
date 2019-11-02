import Drop from 'tether-drop';

angular.module('financier').directive('editAccount', ($compile, $timeout, $rootScope) => {
  return {
    restrict: 'A',
    bindToController: {
      editAccount: '=',
      onAccountChange: '&',
      onRemoveAccount: '&'
    },
    controllerAs: 'editAccountCtrl',
    controller: function ($scope, $element) {
      var pressTimer;

      $element.on('mouseup', () => {
        clearTimeout(pressTimer);
        // Clear timeout
        return false;
      }).on('mousedown', e => {
        // Set timeout
        pressTimer = window.setTimeout(() => {
          open(e);
        },1000);
        return false;
      });

      $element.on('contextmenu', open);

      function open(e) {
        e.preventDefault();

        $rootScope.$broadcast('account:deselectTransactions');
        $rootScope.$broadcast('drop:close');

        const template = require('./editAccount.html');

        const wrap = angular.element('<div></div>').append(template);
        const content = $compile(wrap)($scope);

        content.on('keypress keydown', e => {
          if (e.which === 27) {
            dropInstance.close();
          }
        });

        const dropInstance = new Drop({
          target: $element[0],
          content: content[0],
          classes: 'drop-theme-arrows-bounce edit-account__positioner',
          position: 'left top',
          openOn: 'click'
        });

        dropInstance.on('open', () => {
          this.name = this.editAccount.name;
          this.note = this.editAccount.note;
          this.checkNumber = this.editAccount.checkNumber;

          content.find('input')[0].focus();
        });

        dropInstance.on('close', () => {
          $timeout(() => {
            dropInstance.destroy();
          });
        });

        $scope.$on('drop:close', () => {
          dropInstance.close();
        });

        $scope.remove = () => {
          dropInstance.close();
          $scope.onRemove();
        };

        this.submit = () => {
          const saveFn = this.editAccount.fn;
          this.editAccount.fn = null;

          this.editAccount.name = this.name;
          this.editAccount.note = this.note;
          this.editAccount.checkNumber = this.checkNumber;

          this.editAccount.fn = saveFn;
          this.editAccount.emitChange();

          dropInstance.close();
        };

        this.close = () => {
          this.editAccount.closed = true;

          this.onAccountChange();
          dropInstance.close();
        };

        this.open = () => {
          this.editAccount.closed = false;

          this.onAccountChange();
          dropInstance.close();
        };

        this.remove = () => {
          this.onRemoveAccount({ account: this.editAccount });

          dropInstance.close();
        };


        dropInstance.open();

        return false;
      }

    }
  };
});
