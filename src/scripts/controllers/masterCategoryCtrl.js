angular.module('financier').controller('masterCategoryCtrl', function($scope) {
  // TODO improve this -- move calculation to the Month service
  // Doesn't seem to make performance suck at the moment, and O(1) w/
  // growing db size (just the view calc), so I'll keep it for now...

  $scope.$watchCollection(() => {
    let budget = 0;
    let outflow = 0;
    let balance = 0;

    for (let i = 0; i < $scope.masterCategory.categories.length; i++) {
      const cat = $scope.masterCategory.categories[i];

      if ($scope.month.categories[cat.id]) {
        budget += $scope.month.categories[cat.id].budget || 0;
      }

      if ($scope.month.categoryCache[cat.id]) {
        outflow += $scope.month.categoryCache[cat.id].outflow || 0;
        balance += $scope.month.categoryCache[cat.id].balance || 0;
      }
    }

    return [budget, outflow, balance];
  }, ([budget, outflow, balance]) => {
    this.budget = budget;
    this.outflow = outflow;
    this.balance = balance;
  });
});
