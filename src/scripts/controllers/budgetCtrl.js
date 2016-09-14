angular.module('financier').controller('budgetCtrl', function($filter, $stateParams, $rootScope, $timeout, $scope, month, masterCategory, category, myBudget) {
  const Month = month($stateParams.budgetId);
  const MasterCategory = masterCategory($stateParams.budgetId);
  const Category = category($stateParams.budgetId);

  this.showMonths = 0;
  $rootScope.$on('budget:columns', (event, months) => {
    this.showMonths = (months >= 5 ? 5 : months) || 1;
  });

  const updateCategories = () => {
    this.masterCategoriesArray = [];

    for (let id in $scope.dbCtrl.masterCategories) {
      if ($scope.dbCtrl.masterCategories.hasOwnProperty(id)) {
        this.masterCategoriesArray.push($scope.dbCtrl.masterCategories[id]);
      }
    }

    this.masterCategoriesArray.sort((a, b) => a.sort - b.sort);
  }

  $scope.$on('masterCategories:change', updateCategories);
  updateCategories(); // run to start


  $scope.categorySortable = {
    animation: 200,
    group: 'categories',
    ghostClass: 'budget__month-row--ghost',
    onSort: e => {
      // wait for the array to update
      $timeout(() => {
        e.models.update();
      });
    }
  };

  $scope.masterCategorySortable = {
    animation: 200,
    ghostClass: 'budget__month-row--ghost',
    onSort: e => {
      for (let i = 0; i < e.models.length; i++) {
        e.models[i].sort = i;
      }
    }
  };

  this.currentMonth = Month.createID(new Date());

  const lastMonthFilter = $filter('lastMonth'),
    dateFilter = $filter('date');

  this.translationPayloads = {
    currentMonth(date) {
      return {
        month: dateFilter(date, 'MMM')
      };
    },
    lastMonth(date) {
      return {
        month: dateFilter(lastMonthFilter(date), 'MMM')
      };
    }
  };

  this.addMasterCategory = name => {
    const cat = new MasterCategory({
      name
    });

    this.masterCategoriesArray.unshift(cat);

    for (let i = 0; i < this.masterCategoriesArray.length; i++) {
      this.masterCategoriesArray[i].sort = i;
    }

    $scope.dbCtrl.masterCategories[cat.id] = cat;

    myBudget.masterCategories.put(cat);
    cat.subscribe(myBudget.masterCategories.put);
  }

  this.addCategory = (name, masterCategory) => {
    const cat = new Category({
      name
    });

    masterCategory.categories.unshift(cat.id);

    $scope.dbCtrl.categories[cat.id] = cat;

    myBudget.masterCategories.put(masterCategory);
    myBudget.categories.put(cat);
    cat.subscribe(myBudget.categories.put);
  }

  this.removeCategory = (id, masterCategory) => {
    const index = masterCategory.categories.indexOf(id);

    if (index === -1) {
      throw new Error('Could not find category in masterCategory');
    }

    masterCategory.categories.splice(index, 1);

    const cat = $scope.dbCtrl.categories[id];

    delete $scope.dbCtrl.categories[id];

    $scope.dbCtrl.manager.months.forEach(month => {
      const monthCat = month.categories[id];

      if (monthCat) {
        month.removeBudget(monthCat);
        monthCat.remove();
      }
    });

    $scope.dbCtrl.manager.months[0].startRolling(id);

    return cat.remove().then(() => {
      return myBudget.masterCategories.put(masterCategory);
    });
  }

  this.removeMasterCategory = masterCategory => {
    masterCategory.categories.forEach(catId => {
      const cat = $scope.dbCtrl.categories[catId];
      delete $scope.dbCtrl.categories[catId];

      $scope.dbCtrl.manager.months.forEach(month => {
        const monthCat = month.categories[catId];

        if (monthCat) {
          month.removeBudget(monthCat);
          monthCat.remove();
        }
      });

      $scope.dbCtrl.manager.months[0].startRolling(catId);

      cat.remove();
    });

    delete $scope.dbCtrl.masterCategories[masterCategory.id];
    updateCategories();
    masterCategory.remove();
  }
});
