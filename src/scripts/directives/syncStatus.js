angular.module('financier').directive('syncStatus', function() {
  return {
    restrict: 'E',
    template: '{{syncCtrl.textStatus}}',
    bindToController: {
      status: '='
    },
    controllerAs: 'syncCtrl',
    controller: function($scope, $element) {
      $element.addClass('sync-status');

      $scope.$watch(() => this.status, status => {
        if (status.indexOf('sync') === -1) {
          this.textStatus = `Sync ${status}`;
        } else {
          this.textStatus = status.charAt(0).toUpperCase() + status.slice(1);;
        }
      });
      
      $scope.$watch('userCtrl.status', (newStatus, oldStatus) => {
        $element.removeClass(`sync-status--${oldStatus}`);
        $element.addClass(`sync-status--${newStatus}`);
      });

      $element.attr('title', 'The current synchronization status of your local data with the server.');
    }
  };
});
