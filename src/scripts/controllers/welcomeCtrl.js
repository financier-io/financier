angular.module('financier').controller('welcomeCtrl', function($timeout, $state) {
  $timeout(() => {
    $state.go('app.budget');
  }, 2000);
});