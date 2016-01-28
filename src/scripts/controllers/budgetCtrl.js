angular.module('financier').controller('budgetCtrl', function($rootScope, $scope) {
  $rootScope.$on('budget:columns', function(event, months) {
    console.log(months)
  });
});