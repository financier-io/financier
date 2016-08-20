angular.module('financier').directive('autosuggest', ($timeout, $filter, inputDropSetup) => {
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      items: '=',
      focus: '@',
      template: '=',
      onSubmit: '&',
      customFilter: '&?',
      ngDisabled: '=',
      canSubmitNew: '@'
    },
    template: `<div class="autosuggest">
                 <div class="autosuggest__text">{{autosuggestText}}</div>
                 <input type="text" ng-model="userInput" ng-disabled="ngDisabled" class="autosuggest__input">
               </div>`,
    link: (scope, element, attrs, ngModelCtrl) => {
      const ngFilter = $filter('filter');
      const input = element.find('input');
      scope.submit = submit;

      let pristineInputField = true;

      let items = scope.items;

      const dropSetup = inputDropSetup(scope, input, scope.template);

      scope.$on('focus', () => {
        dropSetup.focus();
      });

      scope.$on('$destroy', () => {
        dropSetup.destroy();
      });

      scope.filterCustomFilterer = item => {
        if (!scope.customFilter) {
          return () => true;
        }

        return scope.customFilter({
          item,
          searchValue: scope.userInput || '',
          pristineInputField
        });
      };

      const runFilter = () => {
        scope.items = ngFilter(items, scope.filterCustomFilterer);
      };

      scope.$on('autosuggest:filter', runFilter);

      ngModelCtrl.$render = () => {
        for (let i = 0; i < scope.items.length; i++) {
          if (scope.items[i] === ngModelCtrl.$modelValue) {
            scope.userInput = scope.items[i].name;
          }
        }
      };

      // If you change date ('Income for July' => 'Income to August')
      scope.$on('autosuggest:updateText', () => {
          scope.userInput = scope.selected.name;
          scope.autosuggestText = scope.selected.name;
      });

      scope.$watch('userInput', (userInput, oldUserInput) => {
        if (userInput !== oldUserInput) {
          pristineInputField = false;
        }

        userInput = userInput || '';

        scope.selected = null;

        runFilter();

        for (let i = 0; i < scope.items.length; i++) {
          if (scope.items[i].name.toLowerCase().indexOf(userInput.toLowerCase()) === 0) {
            scope.selected = scope.items[i];
            break;
          }
        }

        if (scope.canSubmitNew && userInput !== oldUserInput) {
          ngModelCtrl.$setViewValue(userInput);
        }

        if (scope.selected) {
          scope.autosuggestText = userInput + scope.selected.name.slice(userInput.length);
        } else {
          scope.selected = scope.items[0];
          scope.autosuggestText = '';
        }
      });

      input.on('keydown', e => {
        if (e.which === 9) { // tab

          dropSetup.close();

        } else if (e.which === 13) { // enter
          if (scope.selected) {
            submit(scope.selected);

            dropSetup.close();
          }
        } else if (e.which === 40) { // down

          const currentIndex = scope.items.indexOf(scope.selected);
          if (currentIndex === -1) {
            scope.selected = scope.items[0];
            // scope.userInput = scope.items[0].name;
          } else if (currentIndex + 1 < scope.items.length) {
            scope.selected = scope.items[currentIndex + 1];
            // scope.userInput = scope.selected.name;
          }

          e.preventDefault();

        } else if (e.which === 38) { // up

          const currentIndex = scope.items.indexOf(scope.selected);
          if (currentIndex === -1) {
            scope.selected = scope.items[0];
            // scope.userInput = scope.items[0].name;
          } else if (currentIndex - 1 >= 0) {
            scope.selected = scope.items[currentIndex - 1];
            // scope.userInput = scope.selected.name;
          }

          e.preventDefault();

        }

        scope.$apply();
      });

      function submit(value) {
        scope.selected = value;
        scope.userInput = value.name;

        ngModelCtrl.$setViewValue(value);

        scope.onSubmit();

        dropSetup.close();
      }
    }
  };
});
