import Drop from 'tether-drop';

angular.module('financier').directive('quickBudgetOne', ($compile, $timeout) => {
  return {
    restrict: 'A',
    controller: function($scope, $element, $attrs) {

      // Get the last month's budget values, and put them into the corresponding
      // current month's categories (but only if their budget value is not set)
      this.lastMonth = () => {
        const lastMonth = this.months[this.months.indexOf(this.month) - 1];

        if (lastMonth) {
          this.month.categories[this.catId].budget = lastMonth.categories[this.catId].budget;
        } else {
          this.month.categories[this.catId].budget = 0;
        }
      }

      this.average = () => {
        let accumulator = 0;

        let monthIndex = this.months.indexOf(this.month) - 1;

        for (let i = monthIndex; i >= 0 && i > monthIndex - 3; i--) {
          accumulator += this.months[i].categories[this.catId].budget;
        }

        this.month.categories[this.catId].budget = Math.round(accumulator / 3);
      }

      this.clear = () => {
        this.month.categories[this.catId].budget = 0; 
      }

      this.zero = () => {
        this.month.categories[this.catId].budget -= this.month.categoryCache[this.catId].balance;
      }

      $element.on('mousedown', () => {
        $element.addClass('budget__auto-suggest--open');
      });

      $element.on('click', () => {
        const template = require('./quickBudgetOne.html');
        let dropInstance;

        const wrap = angular.element('<div class="tooltip"></div>').append(template);
        const content = $compile(wrap)($scope);

        content.on('click', e => {
          dropInstance.close();
        });

        dropInstance = new Drop({
          target: $element[0],
          content: content[0],
          classes: 'drop-theme-arrows-bounce',
          openOn: 'click',
          position: 'bottom center',
          tetherOptions: {
            optimizations: {
              moveElement: true
            }
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
            $element.removeClass('budget__auto-suggest--open');
          });
        });

      });
    },
    controllerAs: 'quickBudgetOneCtrl',
    bindToController: {
      months: '=',
      month: '=',
      catId: '='
    }
  };
});
