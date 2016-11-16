angular.module('financier').controller('importBudgetCtrl', function($rootScope, $scope, backup) {
  this.submit = file => {
    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (theFile => {
      return e => {
        backup.restore(JSON.parse(e.target.result))
        .then(() => {
          $scope.closeThisDialog();

          $rootScope.$broadcast('reset');
        });
      };
    })(file);

    // Read in the image file as a data URL.
    reader.readAsText(file);
  };

});
