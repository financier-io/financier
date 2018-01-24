import moment from 'moment';
import { throttle } from 'underscore';

angular.module('financier').directive('monthSelector', function() {
  return {
    restrict: 'E',
    template: require('./monthSelector.html'),
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

      const onResize = throttle(() => {
        changeHeaderStyle();
        scope.$apply();
      }, 250);

      window.addEventListener('resize', onResize, false);

      scope.$on('$destroy', () => {
        window.removeEventListener('resize', onResize, false);
      });

      function changeHeaderStyle() {
        if (document.body.clientWidth < 990) {
          scope.limitTo = 1;
        } else {
          scope.limitTo = null;
        }

        if (document.body.clientWidth < 1484) {
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
