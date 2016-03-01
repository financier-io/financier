angular.module('financier').controller('budgetsCtrl', function($scope, $http) {
  $http.get('/api/version').then(res => {
    this.version = res.data;
  });
});
