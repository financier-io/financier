import moment from 'moment';

angular.module('financier').directive('calendarInput', ($rootScope, $locale, inputDropSetup) => {
  let FIRSTDAYOFWEEK = $locale.DATETIME_FORMATS.FIRSTDAYOFWEEK;
  const shortDate = $locale.DATETIME_FORMATS.shortDate,
    plusMinusEnabled = shortDate.indexOf('-') === -1 && shortDate.indexOf('+') === -1;

  // plusMinusEnabled disables + and - to switch date if the locale requires
  // that as the shortDate separator, e.g. 'MM-dd-y'

  if ($locale.id === 'en-au') {
    FIRSTDAYOFWEEK = 0;
  }

  return {
    restrict: 'A',
    bindToController: {
      ngModel: '='
    },
    controllerAs: 'calendarCtrl',
    controller: function($scope, $element) {
      const input = $element,
        template = require('./calendarInput.html');

      const dropSetup = inputDropSetup($scope, input, template);

      $scope.thisMonth = new Date();

      $scope.$watch((() => this.ngModel), m => {
        if (m) {
          $scope.thisMonth = m;
          $scope.month = $scope.generateMonth(m, m);
        }
      });

      $scope.datesAreEqualToMonth = (d1, d2) => {
        return d1 && d2 && (d1.getYear() === d2.getYear()) && (d1.getMonth() === d2.getMonth());
      };

      $scope.datesAreEqualToDay = (d1, d2) => {
        return d1 && d2 && (d1.getYear() === d2.getYear()) && (d1.getMonth() === d2.getMonth()) && (d1.getDate() === d2.getDate());
      };

      input.on('keydown', event => {
        if (event.which === 38 || (plusMinusEnabled && ((event.which === 187 && event.shiftKey) || event.which === 107))) { // down OR (= AND SHIFT (basically + on keyboard or numpad))
          $scope.nextDay();

          event.preventDefault();
        } else if (event.which === 40 || (plusMinusEnabled && ((event.which === 189 && !event.shiftKey) || event.which === 109))) { // up OR (- (on keyboard or numpad) AND NOT SHIFT)
          $scope.previousDay();

          event.preventDefault();
        } else if (event.which === 9) { // tab

          dropSetup.close();

        } else if (event.which === 13) { // enter
          dropSetup.close();
          focusNextField();
        } else if (event.which === 34) { // pageDown
          this.ngModel = moment(this.ngModel).add(-1, 'month').toDate();

          event.preventDefault();
        } else if (event.which === 33) { // pageUp
          this.ngModel = moment(this.ngModel).add(1, 'month').toDate();

          event.preventDefault();
        } else if (event.which === 84) { // 't'
          this.ngModel = new Date();

          event.preventDefault();
        } else {
          return;
        }

        $scope.$apply();
      });

      $scope.generateMonth = function(date, selectedDate) {
        var d, dateIterator, i, j, month, startingDay, today, week;
        startingDay = (function() {
          var firstDayOfMonth, month, offset, ret, year;

          year = date.getFullYear();
          month = date.getMonth();

          firstDayOfMonth = new Date(year, month, 1);
          ret = new Date(firstDayOfMonth);

          // minus one since FIRSTDAYOFWEEK starts monday, and getDay() starts Sunday
          offset = firstDayOfMonth.getDay() - 1 - (FIRSTDAYOFWEEK - 7);

          offset = offset % 7;

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
              isSelected: $scope.datesAreEqualToDay(d, selectedDate),
              isInMonth: $scope.datesAreEqualToMonth(d, date),
              today: $scope.datesAreEqualToDay(d, today)
            });
            dateIterator.setDate(dateIterator.getDate() + 1);
          }
          month.push(week);
        }
        return month;
      };

      const update = () => {
        $scope.month = $scope.generateMonth($scope.thisMonth, this.ngModel);
      }

      // $scope.month = $scope.generateMonth($scope.thisMonth, this.ngModel);
      
      $scope.nextMonth = () => {
        $scope.thisMonth = nextMonth($scope.thisMonth);
        update();
      };

      $scope.previousMonth = () => {
        $scope.thisMonth = previousMonth($scope.thisMonth);
        update();
      };

      $scope.nextYear = () => {
        $scope.thisMonth = nextYear($scope.thisMonth);
        update();
      };

      $scope.previousYear = () => {
        $scope.thisMonth = previousYear($scope.thisMonth);
        update();
      };

      $scope.nextDay = () => {
        const val = nextDay(this.ngModel);

        $scope.thisMonth = val;
        this.ngModel = val;
        update();
      };

      $scope.previousDay = () => {
        const val = previousDay(this.ngModel);

        $scope.thisMonth = val;
        this.ngModel = val;
        update();
      };

      $scope.select = date => {
        this.ngModel = date;
        update();

        dropSetup.close();

        focusNextField();
      };

      $scope.$on('transaction:date:focus', () => {
        dropSetup.focus();
      });

      function focusNextField() {
        if ($scope.$parent.accountCtrl.checkNumber) {
          $rootScope.$broadcast('transaction:check:focus');
        } else {
          $rootScope.$broadcast('transaction:payee:focus');
        }
      }

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
