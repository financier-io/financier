angular.module('financier').directive('syncStatus', function() {
  return {
    restrict: 'E',
    template: `{{syncStatusCtrl.status}}`,
    controllerAs: 'syncStatusCtrl',
    controller: function($scope, $element) {

      $element.addClass('sync-status');
      
      $scope.$watch(() => this.status, (newStatus, oldStatus) => {
        $element.removeClass(`sync-status--${oldStatus}`);
        $element.addClass(`sync-status--${newStatus}`);
      });

      this.status = 'offline';

      $scope.$on('syncStatus:update', (e, status) => {
        this.status = status;
        $scope.$digest();
      });
    }
  };
});
