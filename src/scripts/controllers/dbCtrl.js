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

  const lastWidth = localStorage.getItem('sidebarWidth');
  if (lastWidth) {
    this.sidebarInitialWidth = +lastWidth;
  }

  $scope.$on('angular-resizable.resizeEnd', (e, { width }) => {
    localStorage.setItem('sidebarWidth', width);
  });
});
