angular.module('financier').directive('monthSelector', function() {
  return {
    restrict: 'E',
    templateUrl: 'scripts/directives/monthSelector.html',
    require: 'ngModel',
    scope: {
      ngModel: '=',
      showMonths: '='
    },
    link: function(scope, element, attrs, ngModelCtrl) {
      scope.months = [];
      scope.today = moment().startOf('month');

      scope.$watchCollection(() => [
        ngModelCtrl.$modelValue,
        scope.showMonths
      ], function([newValue, showMonths]) {
        if (angular.isDefined(newValue)) {
          const modelMonth = moment(newValue);

          for (let i = 0; i < 12; i++) {
            const month = moment(newValue).month(i);

            if (!angular.isDefined(scope.months[i])) {
              scope.months[i] = [];
            }
            scope.months[i].date = month;
            scope.months[i].view = modelMonth.diff(month, 'months') > -showMonths &&
                                   modelMonth.diff(month, 'months') <= 0;
          }
        }
      });

      scope.nextMonth = function() {
        scope.ngModel = moment(scope.ngModel).add(1, 'month').toDate();
      };
      scope.previousMonth = function() {
        scope.ngModel = moment(scope.ngModel).subtract(1, 'month').toDate();
      };


      scope.$on('resize', changeHeaderStyle);

      function changeHeaderStyle() {
        if (document.body.clientWidth < 675) {
          scope.limitTo = 1;
        } else {
          scope.limitTo = null;
        }

        if (document.body.clientWidth < 1384) {
          scope.dateFormat = 'MMM';
        } else {
          scope.dateFormat = 'MMMM';
        }
      }

      changeHeaderStyle();

      scope.setMonth = function(date) {
        scope.ngModel = date;
      };
    }
  };
});
