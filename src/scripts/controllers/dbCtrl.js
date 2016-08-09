import moment from 'moment';

angular.module('financier').controller('dbCtrl', function(monthManager, MonthCategory, category, account, transaction, masterCategory, db, budgetRecord, data, $stateParams, $scope, $q, month, ngDialog, myBudget) {
  let {manager, categories} = data;
  const budgetId = $stateParams.budgetId;

  const Month = month(budgetId);
  const Account = account(budgetId);
  const MasterCategory = masterCategory(budgetId);
  const Category = category(budgetId);
  const MonthManager = monthManager(budgetId);
  const Transaction = transaction(budgetId);

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
      template: require('../../views/modal/editAccount.html'),
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

  this.addMasterCategory = name => {
    const cat = new MasterCategory({
      name
    });

    this.categories.unshift(cat);

    for (let i = 0; i < this.categories.length; i++) {
      this.categories[i].sort = i;
    }

    myBudget.categories.put(cat);
    cat.subscribe(myBudget.categories.put);
  }


  const doChange = {
    masterCategory(change) {
      console.log('doing masterCategory')
      // look through our categories to see if it exists
      for (let i = 0; i < this.categories.length; i++) {
        if (this.categories[i]._id === change.id) {

          if (change.deleted) {
            this.categories.splice(i, 1);
          } else {
            this.categories[i].data = change.doc;
          }

          return;
        }
      }

      // Couldn't find it
      const b = new MasterCategory(change.doc);
      b.subscribe(myBudget.categories.put);

      this.categories.push(b);
    },
    category(change) {
      console.log('doing category')
      for (let i = 0; i < this.categories.length; i++) {
        for (let j = 0; j < this.categories[i].categories[j].length; j++) {
          const cat = this.categories[i].categories[j];

          if (cat._id === change.id) {
            if (change.deleted) {
              this.categories[i].categories.splice(j, 1);
            } else {
              cat.data = change.doc;
            }

            return;
          }
        }
      }

      // Couldn't find it
      // const cat = new Category(change.doc);
      // cat.subscribe(myBudget.transactions.put);

      // todo gotta refactor this so we have a place to store the temporary ref
      // until the master category gets the id...
    },
    month(change) {
      console.log('doing month')
      // TODO
    },
    monthCategory(change) {
      console.log('doing monthCategory')
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
          console.log('adding!')
          moCat.subscribe(myBudget.transactions.put);
          mo.addBudget(moCat);
          mo.startRolling(moCat.categoryId);
        }


      }
    },
    account(change) {
      console.log('doing account')
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
      console.log('doing transaction')
      for (let i = 0; i < manager.allAccounts.transactions.length; i++) {
        const trans = manager.allAccounts.transactions[i];

        if (trans._id === change.id) {
          if (change.deleted) {
            manager.removeTransaction(trans);
          } else {
            trans.data = change.doc;
          }

          return;
        }
      }

      // Couldn't find it
      const trans = new Transaction(change.doc);
      trans.subscribe(myBudget.transactions.put);

      manager.addTransaction(trans);
    }
  };

  $scope.$on('pouchdb:change', (e, change) => {
    console.log('boom', change)
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
