angular.module('financier').controller('budgetCtrl', function ($filter, $stateParams, $rootScope, $timeout, $scope, month, masterCategory, category, myBudget, ngDialog) {
  const Month = month($stateParams.budgetId);
  const MasterCategory = masterCategory($stateParams.budgetId);
  const Category = category($stateParams.budgetId);

  this.showMonths = 0;
  $rootScope.$on('budget:columns', (event, months) => {
    this.showMonths = (months >= 5 ? 5 : months) || 1;
  });

  $scope.styles = {}; // for resize-categories directive

  const updateCategories = () => {
    this.masterCategoriesArray = [];

    for (let id in $scope.dbCtrl.masterCategories) {
      if ($scope.dbCtrl.masterCategories.hasOwnProperty(id)) {
        this.masterCategoriesArray.push($scope.dbCtrl.masterCategories[id]);
      }
    }

    this.masterCategoriesArray.sort((a, b) => a.sort - b.sort);
  };

  $scope.$on('masterCategories:change', updateCategories);
  updateCategories(); // run to start


  $scope.categorySortable = {
    animation: 200,
    group: 'categories',
    ghostClass: 'budget__month-row--ghost',
    onSort: e => {
      // wait for the array to update
      $timeout(() => {
        for (let i = 0; i < e.models.length; i++) {
          e.models[i].setMasterAndSort(e.models.masterCategory.id, i);
        }
      });
    },
    onStart: () => {
      $scope.$broadcast('drop:close');
    }
  };

  $scope.masterCategorySortable = {
    animation: 200,
    ghostClass: 'budget__month-row--ghost',
    onSort: e => {
      for (let i = 0; i < e.models.length; i++) {
        e.models[i].sort = i;
      }
    },
    onStart: () => {
      $scope.$broadcast('drop:close');
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
  };

  this.addCategory = (name, masterCategory) => {
    let sort = masterCategory.categories[masterCategory.categories.length - 1] ?
               masterCategory.categories[masterCategory.categories.length - 1].sort + 1 :
               0;

    const cat = new Category({
      name,
      masterCategory: masterCategory.id,
      sort
    });

    // $scope.dbCtrl.categories[cat.id] = cat;
    $scope.dbCtrl.addCategory(cat);

    myBudget.categories.put(cat);
    cat.subscribe(myBudget.categories.put);
  };

  this.removeCategory = id => {
    removeConfirm($scope.dbCtrl.categories[id].name)
    .then(() => {
      return remove();
    });

    function remove() {
      const cat = $scope.dbCtrl.categories[id];

      $scope.dbCtrl.removeCategory(cat);

      $scope.dbCtrl.manager.months.forEach(month => {
        const monthCat = month.categories[id];

        if (monthCat) {
          month.removeBudget(monthCat);

          if (monthCat.data._rev) { // if exists
            monthCat.remove();
          }
        }
      });

      $scope.dbCtrl.manager.months[0].startRolling(id);

      return cat.remove();
    }
  };

  this.removeMasterCategory = masterCategory => {
    removeConfirm(masterCategory.name)
    .then(() => {
      return remove();
    });

    function remove() {
      const cats = masterCategory.categories.slice(0);

      cats.forEach(cat => {
        $scope.dbCtrl.removeCategory(cat);

        $scope.dbCtrl.manager.months.forEach(month => {
          const monthCat = month.categories[cat.id];

          if (monthCat) {
            month.removeBudget(monthCat);

            if (monthCat.data._rev) { // if exists
              monthCat.remove();
            }
          }
        });

        $scope.dbCtrl.manager.months[0].startRolling(cat.id);

        if (cat) {
          cat.remove();
        }
      });

      delete $scope.dbCtrl.masterCategories[masterCategory.id];
      updateCategories();
      masterCategory.remove();
    }
  };

  function removeConfirm(name) {
    const scope = $scope.$new({});

    scope.category = name;

    return ngDialog.openConfirm({
      template: require('../../views/modal/removeCategory.html'),
      scope,
      className: 'ngdialog-theme-default ngdialog-theme-default--danger modal'
    });
  }
});
