angular.module('financier').controller('dbCtrl', function(account, transaction, db, budgetRecord, data, $stateParams, $scope, $q, month, ngDialog, myBudget) {
  let {manager, categories} = data;
  const budgetId = $stateParams.budgetId;

  const Month = month(budgetId);
  const Account = account(budgetId);

  this.manager = manager;
  this.categories = categories;
  this.accounts = manager.accounts;
  this.budgetRecord = budgetRecord;

  budgetRecord.open();

  this.currentMonth = new Date();
  this.months = getView(this.currentMonth);

  // TODO make a map of categories instead of doing this every $apply
  // god knows how many times (lol)
  this.getCategoryName = (id, transactionDate) => {
    if (id === 'income') {
      return `Income for ${moment(transactionDate).format('MMMM')}`;
    } else if (id === 'incomeNextMonth') {
      return `Income for ${moment(transactionDate).add(1, 'month').format('MMMM')}`;
    }

    for (let i = 0; i < this.categories.length; i++) {
      for (let j = 0; j < this.categories[i].categories.length; j++) {
        if (this.categories[i].categories[j].id === id) {
          return this.categories[i].categories[j].name;
        }
      }
    }
  };
  // TODO make a map of accounts instead of doing this every $apply
  // god knows how many times (lol)
  this.getAccountName = id => {
    for (let i = 0; i < this.accounts.length; i++) {
      if (this.accounts[i].id === id) {
        return this.accounts[i].name;
      }
    }
  };

  $scope.$watch(
    () => this.currentMonth,
    (currentMonth, oldCurrentMonth) => {
      if (angular.isDefined(currentMonth)) {
        this.months = getView(currentMonth.toDate ? currentMonth.toDate() : currentMonth);
      }
    }
  );

  function getView(date) {
    // Make sure that we have the months
    manager.getMonth(date);
    const dateUntil = moment(date).add(5, 'months').toDate();
    manager.getMonth(dateUntil);

    const dateId = Month.createID(date);

    for (let i = manager.months.length - 1; i >= 0; i--) {
      if (manager.months[i].date === dateId) {
        return manager.months.slice(i, i + 5);
      }
    }
    throw new Error('Could not find base month in database!');
  }

  this.editAccount = account => {
    ngDialog.open({
      template: 'views/modal/editAccount.html',
      controller: 'editAccountCtrl',
      controllerAs: 'editAccountCtrl',
      resolve: {
        manager: () => manager,
        myBudg: () => myBudget,
        myAccount: () => account || new Account(),
        editing: () => !!account
      }
    });
  };

  this.stopPropagation = event => {
    event.stopPropagation();

    $scope.$broadcast('drop:close');
  };

  const lastWidth = localStorage.getItem('sidebarWidth');
  if (lastWidth) {
    this.sidebarInitialWidth = +lastWidth;
  }

  $scope.$on('angular-resizable.resizeEnd', (e, { width }) => {
    localStorage.setItem('sidebarWidth', width);
  });
});
