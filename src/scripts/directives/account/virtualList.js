angular.module('financier')
  .directive('virtualList', function() {
    return {
      restrict: 'E',
      templateUrl: '/scripts/directives/account/virtualList.html',
      scope: false,
      link: function(scope, elem, attrs) {
        var rowHeight = 30;
 
        scope.height = 500;
        scope.scrollTop = 0;
        scope.visibleProvider = [];
        scope.cellsPerPage = 0;
        scope.numberOfCells = 0;
        scope.canvasHeight = {};
 
        // Init
        scope.init = function () {
          elem[0].addEventListener('scroll', scope.onScroll);
          scope.cellsPerPage = Math.round(scope.height / rowHeight);
          scope.numberOfCells = 3 * scope.cellsPerPage;
          scope.canvasHeight = {
            // 40px extra for save/cancel buttons
            height: scope.transactions.length * rowHeight + 'px'
          };
 

          scope.$watch('transactions.length', () => {
            scope.updateDisplayList();
          });
        };
 
        scope.updateDisplayList = function() {

          var firstCell = Math.min(
            Math.max(
              scope.transactions.length - scope.numberOfCells,
              0
            ),
            Math.max(
              Math.floor(scope.scrollTop / rowHeight) - scope.cellsPerPage,
              0
            )
          );

          var cellsToCreate = Math.min(
            scope.numberOfCells,
            scope.transactions.length
          );

          scope.visibleProvider = [];
          for (let i = firstCell; i < firstCell + cellsToCreate; i++) {
            scope.visibleProvider.push({
              i,
              styles: {
                top: (i * rowHeight) + 'px'
              }
            });
          }
        };
 
        scope.onScroll = function(evt) {
          scope.scrollTop = elem.prop('scrollTop');
          scope.updateDisplayList();
 
          scope.$apply();
        };
 
        scope.init();
      }
    };
  });
 
