angular.module('financier').controller('masterCategoryCtrl', function($scope) {
  // TODO improve this -- move calculation to the Month service
  // Doesn't seem to make performance suck at the moment, and O(1) w/
  // growing db size (just the view calc), so I'll keep it for now...

  $scope.$watchCollection(() => {
    let budget = 0;
    let outflow = 0;
    let balance = 0;

    for (let i = 0; i < $scope.masterCategory.categories.length; i++) {
      const catId = $scope.masterCategory.categories[i];

      if ($scope.month.categories[catId]) {
        budget += $scope.month.categories[catId].budget || 0;
      }

      if ($scope.month.categoryCache[catId]) {
        outflow += $scope.month.categoryCache[catId].outflow || 0;
        balance += $scope.month.categoryCache[catId].balance || 0;
      }
    }

    return [budget, outflow, balance];
  }, ([budget, outflow, balance]) => {
    this.budget = budget;
    this.outflow = outflow;
    this.balance = balance;
  });
});
