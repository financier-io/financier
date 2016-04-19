angular.module('financier').directive('syncStatus', function() {
  return {
    restrict: 'E',
    scope: true,
    template: `{{userCtrl.status}}`,
    controller: function($scope, $element) {
      $element.addClass('sync-status');
      
      $scope.$watch('userCtrl.status', (newStatus, oldStatus) => {
        $element.removeClass(`sync-status--${oldStatus}`);
        $element.addClass(`sync-status--${newStatus}`);
      });

      $element.attr('title', 'The current synchronization status of your local data with the server.');
    }
  };
});
