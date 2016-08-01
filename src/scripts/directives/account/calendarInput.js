angular.module('financier').directive('calendarInput', inputDropSetup => {
  return {
    restrict: 'E',
    scope: {
      ngModel: '='
    },
    template: '<input type="text" ng-model="ngModel" date-parser="MM/dd/yy">',
    link: (scope, element, attrs) => {
      const input = element.find('input'),
        templateUrl = '/scripts/directives/account/calendarInput.html';

      const dropSetup = inputDropSetup(scope, input, templateUrl);

      scope.ngModel = new Date(scope.ngModel);
      scope.thisMonth = new Date(scope.ngModel);

      scope.datesAreEqualToMonth = (d1, d2) => {
        return d1 && d2 && (d1.getYear() === d2.getYear()) && (d1.getMonth() === d2.getMonth());
      };

      scope.datesAreEqualToDay = (d1, d2) => {
        return d1 && d2 && (d1.getYear() === d2.getYear()) && (d1.getMonth() === d2.getMonth()) && (d1.getDate() === d2.getDate());
      };

      input.on('keydown', event => {
        if (event.which === 40) { // down
          scope.nextDay();

          event.preventDefault();
        } else if (event.which === 38) { // up
          scope.previousDay();

          event.preventDefault();
        } else if (event.which === 9) { // tab

          dropSetup.close();

        } else if (event.which === 13) { // enter
          dropSetup.close();
        } else {
          return;
        }

        scope.$apply();
      });

      scope.generateMonth = function(date, selectedDate) {
        var d, dateIterator, i, j, month, startingDay, today, week;
        startingDay = (function() {
          var firstDayOfMonth, month, offset, ret, year;
          year = date.getFullYear();
          month = date.getMonth();
          firstDayOfMonth = new Date(year, month, 1);
          ret = new Date(firstDayOfMonth);
          offset = firstDayOfMonth.getDay();
          if (offset === 0) {
            offset = 7;
          }
          ret.setDate(ret.getDate() - offset);
          return ret;
        })();
        today = new Date();
        dateIterator = new Date(startingDay);
        month = [];
        for (i = 0; i <= 5; i++) {
          week = [];
          for (j = 0; j <= 6; j++) {
            d = new Date(dateIterator);
            week.push({
              date: d,
              isSelected: scope.datesAreEqualToDay(d, selectedDate),
              isInMonth: scope.datesAreEqualToMonth(d, date),
              today: scope.datesAreEqualToDay(d, today)
            });
            dateIterator.setDate(dateIterator.getDate() + 1);
          }
          month.push(week);
        }
        return month;
      };

      function update() {
        scope.month = scope.generateMonth(scope.thisMonth, scope.ngModel);
      }

      scope.month = scope.generateMonth(scope.thisMonth, scope.ngModel);
      
      scope.nextMonth = () => {
        scope.thisMonth = nextMonth(scope.thisMonth);
        update();
      };

      scope.previousMonth = () => {
        scope.thisMonth = previousMonth(scope.thisMonth);
        update();
      };

      scope.nextYear = () => {
        scope.thisMonth = nextYear(scope.thisMonth);
        update();
      };

      scope.previousYear = () => {
        scope.thisMonth = previousYear(scope.thisMonth);
        update();
      };

      scope.nextDay = () => {
        scope.ngModel = nextDay(scope.ngModel);
        scope.thisMonth = scope.ngModel;
        update();
      };

      scope.previousDay = () => {
        scope.ngModel = previousDay(scope.ngModel);
        scope.thisMonth = scope.ngModel;
        update();
      };

      scope.select = date => {
        scope.ngModel = date;
        update();
      };

      scope.$on('transaction:date:focus', () => {
        dropSetup.focus();
      });

      scope.$on('transaction:account:submit', () => {
        dropSetup.focus();
      });

      function nextMonth(date) {
        if (date.getMonth() === 11) {
          return new Date(date.getFullYear() + 1, 0);
        } else {
          return new Date(date.getFullYear(), date.getMonth() + 1);
        }
      }

      function nextDay(date) {
        return new Date(date.setDate(date.getDate() + 1));
      }

      function previousDay(date) {
        return new Date(date.setDate(date.getDate() - 1));
      }

      function previousMonth(date) {
        if (date.getMonth() === 0) {
          return new Date(date.getFullYear() - 1, 11);
        } else {
          return new Date(date.getFullYear(), date.getMonth() - 1);
        }
      }

      function nextYear(date) {
        var d;
        d = new Date(date);
        d.setFullYear(d.getFullYear() + 1);
        return d;
      }

      function previousYear(date) {
        var d;
        d = new Date(date);
        d.setFullYear(d.getFullYear() - 1);
        return d;
      }
    }
  };
});
