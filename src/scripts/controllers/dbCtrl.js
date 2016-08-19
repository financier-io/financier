import moment from 'moment';

angular.module('financier').controller('dbCtrl', function(monthManager, MonthCategory, category, account, transaction, masterCategory, db, budgetRecord, data, $stateParams, $scope, $q, month, ngDialog, myBudget) {
  let {manager, categories, masterCategories} = data;
  const budgetId = $stateParams.budgetId;

  const Month = month(budgetId);
  const Account = account(budgetId);
  const MasterCategory = masterCategory(budgetId);
  const Category = category(budgetId);
  const MonthManager = monthManager(budgetId);
  const Transaction = transaction(budgetId);

  this.manager = manager;
  this.categories = categories;
  this.masterCategories = masterCategories;
  this.accounts = manager.accounts;
  this.budgetRecord = budgetRecord;

  budgetRecord.open();

  this.currentMonth = new Date();
  this.months = getView(this.currentMonth);

  this.openAccountsPredicate = acc => !acc.closed;
  this.closedAccountsPredicate = acc => acc.closed;


  this.getCategoryName = (id, transactionDate) => {
    if (id === 'income') {
      return `Income for ${moment(transactionDate).format('MMMM')}`;
    } else if (id === 'incomeNextMonth') {
      return `Income for ${moment(transactionDate).add(1, 'month').format('MMMM')}`;
    }

    return this.categories[id] && this.categories[id].name;
  };

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
      template: require('../../views/modal/editAccount.html'),
      controller: 'editAccountCtrl',
      controllerAs: 'editAccountCtrl',
      resolve: {
        manager: () => manager,
        myBudg: () => myBudget,
        myAccount: () => account || new Account(),
        editing: () => !!account,
        categories: () => categories,
        masterCategories: () => masterCategories
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


  function getId(_id) {
    return _id.slice(_id.lastIndexOf('_') + 1);
  }


  const doChange = {
    masterCategory(change) {
      // look through our categories to see if it exists

      const cat = masterCategories[getId(change.id)];

      if (change.deleted) {
        if (cat) {
          delete masterCategories[getId(change.id)];

          $scope.$broadcast('masterCategories:change');
        }
      } else {
        if (cat) {
          cat.data = change.doc;
        } else {
          // Couldn't find it
          const b = new MasterCategory(change.doc);
          b.subscribe(myBudget.masterCategories.put);

          masterCategories[b.id] = b;

          $scope.$broadcast('masterCategories:change');
        }
      }
    },
    category(change) {
      // look through our categories to see if it exists

      const cat = categories[getId(change.id)];

      if (change.deleted) {
        if (cat) {
          delete categories[getId(change.id)];
        }
      } else {
        if (cat) {
          cat.data = change.doc;
        } else {
          // Couldn't find it
          const b = new Category(change.doc);
          b.subscribe(myBudget.categories.put);

          categories[b.id] = b;
        }
      }
    },
    month(change) {
      // TODO
    },
    monthCategory(change) {
      if (change.deleted) {
        // todo
        // mo.removeBudget()
      } else {
        const moCat = new MonthCategory(change.doc);
        const mo = manager.getMonth(MonthManager._dateIDToDate(moCat.monthId));

        if (mo.categories[moCat.categoryId]) {
          const oldBudget = mo.categories[moCat.categoryId].budget;
          mo.categories[moCat.categoryId].data = change.doc;

          mo.categories[moCat.categoryId]._emitBudgetChange(mo.categories[moCat.categoryId].budget - oldBudget);
        } else {
          moCat.subscribe(myBudget.transactions.put);
          mo.addBudget(moCat);
          mo.startRolling(moCat.categoryId);
        }

      }
    },
    account(change) {
      for (let i = 0; i < manager.accounts.length; i++) {
        if (manager.accounts[i]._id === change.id) {
          if (change.deleted) {
            manager.removeAccount(manager.accounts[i]);
          } else {
            manager.accounts[i].data = change.doc;
          }

          return;
        }
      }

      // Couldn't find it
      const acc = new Account(change.doc);
      acc.subscribe(myBudget.accounts.put);

      manager.addAccount(acc);
    },
    transaction(change) {
      let trans = manager.transactions[getId(change.id)];

      if (trans) {
        if (change.deleted) {
          manager.removeTransaction(trans);
        } else {
          if (trans.data.transferId) {
            trans.transfer = manager.transactions[trans.data.transferId];

            if (trans.transfer) {
              trans.transfer.transfer = trans;
            }
          }

          trans.data = change.doc;
        }

        return;
      }

      if (!change.deleted) {
        // Couldn't find it
        trans = new Transaction(change.doc);
        trans.subscribe(myBudget.transactions.put);

        manager.addTransaction(trans);
      }

    }
  };

  $scope.$on('pouchdb:change', (e, change) => {
    if (MasterCategory.contains(change.id)) {
      doChange.masterCategory(change);
    } else if (Category.contains(change.id)) {
      doChange.category(change);
    } else if (Month.contains(change.id)) {
      doChange.month(change);
    } else if (MonthCategory.contains(budgetId, change.id)) {
      doChange.monthCategory(change);
    } else if (Account.contains(change.id)) {
      doChange.account(change);
    } else if (Transaction.contains(change.id)) {
      doChange.transaction(change);
    }
  });
});
