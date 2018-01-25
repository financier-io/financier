import Drop from 'tether-drop';

angular.module('financier').directive('quickBudget', ($compile, $timeout) => {
  return {
    restrict: 'A',
    controller: function ($scope, $element) {

      // Get the last month's budget values, and put them into the corresponding
      // current month's categories (but only if their budget value is not set)
      this.lastMonth = () => {
        const lastMonth = this.months[this.months.indexOf(this.month) - 1];

        if (lastMonth) {
          for (let id in this.month.categories) {
            if (this.month.categories.hasOwnProperty(id)) {
              if (!this.month.categories[id].budget && lastMonth.categories[id]) {
                this.month.categories[id].budget = lastMonth.categories[id].budget;
              }
            }
          }
        }
      };

      this.average = () => {
        const averages = {};

        let monthIndex = this.months.indexOf(this.month) - 1;

        for (let i = monthIndex; i >= 0 && i > monthIndex - 3; i--) {
          for (let id in this.months[i].categories) {
            if (this.months[i].categories.hasOwnProperty(id)) {
              averages[id] = averages[id] || 0;
              averages[id] += this.months[i].categories[id].budget;
            }
          }
        }

        for (let id in averages) {
          if (averages.hasOwnProperty(id)) {
            if (!this.month.categories[id].budget) {
              this.month.categories[id].budget = Math.round(averages[id] / 3);
            }
          }
        }
      };

      this.clear = () => {
        for (let id in this.month.categories) {
          if (this.month.categories.hasOwnProperty(id)) {
            this.month.categories[id].budget = 0;
          }
        }
      };

      this.zero = () => {
        for (let id in this.month.categories) {
          if (this.month.categories.hasOwnProperty(id)) {
            this.month.categories[id].budget -= this.month.categoryCache[id].balance;
          }
        }
      };




      $element.on('click', () => {

        const template = require('./quickBudget.html');
        let dropInstance;

        const wrap = angular.element('<div class="tooltip"></div>').append(template);
        const content = $compile(wrap)($scope);

        content.on('click', () => {
          dropInstance.close();
        });

        dropInstance = new Drop({
          target: $element[0],
          content: content[0],
          classes: 'drop-theme-arrows-bounce',
          openOn: 'click',
          position: 'top center',
          tetherOptions: {
            constraints: [{
              to: 'window',
              attachment: 'together',
              pin: true
            }]
          }
        });

        dropInstance.open();

        setTimeout(() => {
          dropInstance.position();
        });

        $scope.$on('drop:close', () => {
          dropInstance.close();
        });

        dropInstance.on('close', () => {
          $timeout(() => {
            dropInstance.destroy();
          });
        });

      });
    },
    controllerAs: 'quickBudgetCtrl',
    bindToController: {
      months: '=',
      month: '='
    }
  };
});
