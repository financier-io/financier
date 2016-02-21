angular.module('financier').controller('welcomeCtrl', function($scope, $http) {
  $http.get('/api/version').then(res => {
    this.version = res.data;
  });
});
