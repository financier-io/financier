angular.module('financier').controller('budgetCtrl', function($rootScope) {
  $rootScope.$on('budget:columns', function(event, months) {
    console.log(months)
  });
});