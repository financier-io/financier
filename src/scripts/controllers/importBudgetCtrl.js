angular.module('financier').controller('importBudgetCtrl', function($rootScope, $scope, backup) {
  this.submit = file => {
    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (theFile => {
      return e => {
        let docs;

        try {
          docs = JSON.parse(e.target.result);
        } catch(e) {
          this.error = e;
          throw e; // rethrow for debugging
        }

        backup.restore(docs)
        .then(() => {
          $scope.closeThisDialog();

          $rootScope.$broadcast('reset');
        })
        .catch(e => {
          this.error = e;
        });
      };
    })(file);

    // Read in the image file as a data URL.
    reader.readAsText(file);
  };

});
