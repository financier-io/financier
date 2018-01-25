angular.module('financier').directive('syncStatus', function ($translate) {
  return {
    restrict: 'E',
    template: '{{syncCtrl.textStatus}}',
    bindToController: {
      status: '='
    },
    controllerAs: 'syncCtrl',
    controller: function ($scope, $element) {
      $element.addClass('sync-status');

      $scope.$watch(() => this.status, status => {
        // SYNCING, SYNC_COMPLETE, SYNC_ERROR
        if (angular.isString(status)) {
          if (status.indexOf('sync') === -1) {
            this.textStatus = $translate.instant(`SYNC_${status.toUpperCase()}`);
          } else {
            this.textStatus = $translate.instant(status.toUpperCase());
          }
        }
      });
      
      $scope.$watch('userCtrl.status', (newStatus, oldStatus) => {
        $element.removeClass(`sync-status--${oldStatus}`);
        $element.addClass(`sync-status--${newStatus}`);
      });

      $element.attr('title', $translate.instant('SYNC_STATUS_HELP'));
    }
  };
});
