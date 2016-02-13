angular.module('financier').controller('masterCategoryCtrl', function($scope) {
  // TODO improve this -- move calculation to the Month service
  // Doesn't seem to make performance suck at the moment, and O(1) w/
  // growing db size (just the view calc), so I'll keep it for now...

  $scope.$watchCollection(() => {
    let budget = 0;
    let balance = 0;
    for (let i = 0; i < $scope.masterCategory.categories.length; i++) {
      const cat = $scope.masterCategory.categories[i];

      budget += $scope.month.data.categories[cat._id].budget || 0;
      balance += $scope.month.categoryCache[cat._id].balance || 0;
    }

    return [budget, balance];
  }, ([budget, balance]) => {
    this.budget = budget;
    this.balance = balance;
  });
});
