angular.module('financier').controller('budgetCtrl', function($rootScope, $scope) {
  $rootScope.$on('budget:columns', function(event, months) {
    $scope.flexMonths = [];
    $scope.flexMonths.length = 3;
  });
});