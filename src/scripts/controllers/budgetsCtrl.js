angular.module('financier').controller('budgetsCtrl', function($scope, $http, db, ngDialog) {
  // $http.get('/api/version').then(res => {
  //   this.version = res.data;
  // });

  const getBudgets = () => {
    db.budgets.all().then(res => {
      this.budgets = res;
      $scope.$apply();
    });

  };

  getBudgets();

  $scope.$on('budgets:update', () => {
    getBudgets();
  });

});
