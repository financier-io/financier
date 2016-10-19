import moment from 'moment';

angular.module('financier').controller('dbCtrl', function(monthManager, MonthCategory, category, account, transaction, payee, masterCategory, db, budgetRecord, data, $stateParams, $scope, $q, month, ngDialog, myBudget, budgetOpenedRecord, currencies, $timeout, $state, $translate) {
  let {manager, categories, masterCategories, payees} = data;
  const budgetId = $stateParams.budgetId;

  const Month = month(budgetId);
  const Account = account(budgetId);
  const MasterCategory = masterCategory(budgetId);
  const Category = category(budgetId);
  const MonthManager = monthManager(budgetId);
  const Transaction = transaction(budgetId);
  const Payee = payee(budgetId);

  this.manager = manager;
  this.categories = [];

  this.masterCategories = masterCategories;
  this.accounts = manager.accounts;

  this.filterAccounts = () => {
    const bySort = (a, b) => a.sort - b.sort;

    this.onBudgetAccounts = this.accounts.filter(acc => acc.onBudget && !acc.closed).sort(bySort);
    this.offBudgetAccounts = this.accounts.filter(acc => !acc.onBudget && !acc.closed).sort(bySort);
    this.closedAccounts = this.accounts.filter(acc => acc.closed).sort(bySort);
  }

  this.totalAccountsBalance = accounts => {
    let total = 0;

    for (let i = 0; i < accounts.length; i++) {
      total += accounts[i].balance;
    }

    return total;
  }

  this.removeAccount = account => {
    // require all transactions in account to first be removed
    if (account.transactions.length) {
      const s = $scope.$new({});
      s.totalTransactions = account.transactions.length;

      ngDialog.open({
        template: require('../../views/modal/accountRemoveHasTransactions.html'),
        scope: s
      });

      return;
    }

    const remove = () => {
      manager.removeAccount(account);
      this.filterAccounts();

      account.remove();

      account.subscribe(null);
    }

    if ($state.includes('user.app.manager.view.account', {
      accountId: account.id
    })) {
      $state.go('user.app.manager.view.account', {
        accountId: null
      })
      .then(remove);
    } else {
      remove();
    }
  }

  this.collapsed = {
    get onBudgetAccounts() {
      return this._onBudgetAccountsCollapsed;
    },
    set onBudgetAccounts(s) {
      this._onBudgetAccountsCollapsed = s;
    },
    get offBudgetAccounts() {
      return this._offBudgetAccountsCollapsed === 'true';
    },
    set offBudgetAccounts(s) {
      localStorage.setItem('offBudgetAccountsCollapsed', s);
      this._offBudgetAccountsCollapsed = localStorage.getItem('offBudgetAccountsCollapsed');
    },
    get closedAccounts() {
      return this._closedAccountsCollapsed === 'true';
    },
    set closedAccounts(s) {
      localStorage.setItem('closedAccountsCollapsed', s);
      this._closedAccountsCollapsed = localStorage.getItem('closedAccountsCollapsed');
    },
  };

  this.collapsed._onBudgetAccountsCollapsed = false;
  this.collapsed._offBudgetAccountsCollapsed = localStorage.getItem('offBudgetAccountsCollapsed');
  this.collapsed._closedAccountsCollapsed = localStorage.getItem('closedAccountsCollapsed');

  this.filterAccounts();

  this.budgetRecord = budgetRecord;
  this.payees = payees;

  budgetOpenedRecord.open();

  this.currentMonth = new Date();
  this.months = getView(this.currentMonth);

  this.currencySymbol = currencies[budgetRecord.currency].symbol_native;
  this.currencyDigits = currencies[budgetRecord.currency].decimal_digits;

  this.accountSortable = {
    animation: 200,
    ghostClass: 'app-view__account--ghost',
    onSort: e => {
      // wait for the array to update
      $timeout(() => {
        for (let i = 0; i < e.models.length; i++) {
          e.models[i].sort = i;
        }
      });
    },
    onStart: () => {
      $scope.$broadcast('drop:close');
    }
  };

  this.getCategoryName = (id, transactionDate) => {
    if (id === 'income') {
      return `Income for ${moment(transactionDate).format('MMMM')}`;
    } else if (id === 'incomeNextMonth') {
      return `Income for ${moment(transactionDate).add(1, 'month').format('MMMM')}`;
    } else if (id === 'split') {
      return $translate.instant('MULTIPLE_CATEGORIES');
    }

    return this.categories[id] && this.categories[id].name;
  };

  this.getAccountName = id => {
    for (let i = 0; i < this.accounts.length; i++) {
      if (this.accounts[i].id === id) {
        return this.accounts[i].name;
      }
    }

    return id;
  };

  this.getPayeeName = id => {
    return (payees[id] && payees[id].name) || id;
  };

  $scope.$watch(
    () => this.currentMonth,
    (currentMonth, oldCurrentMonth) => {
      if (angular.isDefined(currentMonth)) {
        this.months = getView(currentMonth.toDate ? currentMonth.toDate() : currentMonth);
      }
    }
  );

  this.removeCategory = cat => {
    delete this.categories[cat.id];

    this.masterCategories[cat.masterCategory].removeCategory(cat);
  }

  this.addCategory = cat => {
    this.categories[cat.id] = cat;

    cat.subscribeMasterCategoryChange(cat => {
      this.removeCategory(cat);
    }, cat => {
      this.addCategory(cat);
    });

    let masterCat, sort;

    // THIS BLOCK IS FOR BACKWARDS COMPATIBILITY 09/20/2016
    if (!cat.masterCategory) {
      Object.keys(this.masterCategories).forEach(catId => {
        const index = this.masterCategories[catId]._data.categories.indexOf(cat.id);
        if (this.masterCategories[catId]._data.categories &&
            index !== -1) {
          masterCat = this.masterCategories[catId];
          sort = index;
        }
      });
    }

    if (!masterCat) {
      masterCat = this.masterCategories[cat.masterCategory];
    }

    // if (!masterCat) {
    //   let tmpMasterCat, currentSort = 99999;

    //   Object.keys(this.masterCategories).forEach(catId => {
    //     if (this.masterCategories[catId].sort < currentSort) {
    //       tmpMasterCat = this.masterCategories[catId];
    //       currentSort = this.masterCategories[catId].sort;
    //     }
    //   });

    //   masterCat = tmpMasterCat;
    // }

    if (angular.isDefined(sort)) {
      cat.setMasterAndSort(masterCat.id, sort);
    } else {
      if (masterCat) {
        cat.masterCategory = masterCat.id;
      } else {
        console.log(`Couldn't find master category with ID ${cat.masterCategory}!`);
      }
    }

    if (masterCat) {
      masterCat.addCategory(cat);
    } else {
      console.log(`Couldn't find master category with ID ${cat.masterCategory}!`);
    }

  }

  for (let id in categories) {
    if (categories.hasOwnProperty(id)) {
      this.addCategory(categories[id]);
    }
  }

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

  this.createAccount = account => {
    ngDialog.open({
      template: require('../../views/modal/createAccount.html'),
      controller: 'createAccountCtrl',
      controllerAs: 'createAccountCtrl',
      resolve: {
        manager: () => manager,
        myBudg: () => myBudget,
        myAccount: () => account || new Account(),
        addCategory: () => this.addCategory,
        masterCategories: () => masterCategories,
        currencyDigits: () => this.currencyDigits,
        filterAccounts: () => this.filterAccounts,
        onBudgetAccounts: () => this.onBudgetAccounts,
        offBudgetAccounts: () => this.offBudgetAccounts
      },
      scope: $scope
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

  const that = this;

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
          b.subscribe(myBudget.put);

          masterCategories[b.id] = b;

          // Add back any categories
          for (let id in categories) {
            if (categories.hasOwnProperty(id)) {
              if (categories[id].masterCategory === b.id) {
                b.categories.push(categories[id]);
              }
            }
          }
        }

        $scope.$broadcast('masterCategories:change');
      }
    },
    category(change) {
      // look through our categories to see if it exists

      const cat = that.categories[getId(change.id)];

      if (change.deleted) {
        if (cat) {
          that.removeCategory(cat);
        }
      } else {
        if (cat) {
          cat.data = change.doc;
        } else {
          // Couldn't find it
          const b = new Category(change.doc);
          b.subscribe(myBudget.put);

          that.addCategory(b);
          // categories[b.id] = b;
        }
      }
    },
    payee(change) {
      // look through our categories to see if it exists

      const myPayee = payees[getId(change.id)];

      if (change.deleted) {
        if (myPayee) {
          delete payees[getId(change.id)];
        }
      } else {
        if (myPayee) {
          myPayee.data = change.doc;
        } else {
          // Couldn't find it
          const p = new Payee(change.doc);
          p.subscribe(myBudget.put);

          payees[p.id] = p;
        }
      }
    },
    month(change) {
      // TODO
    },
    monthCategory(change) {
      if (change.deleted) {
        const moCat = new MonthCategory(change.doc);
        const mo = manager.getMonth(MonthManager._dateIDToDate(moCat.monthId));

        if (mo.categories[moCat.categoryId]) {
          mo.removeBudget(mo.categories[moCat.categoryId]);
          mo.startRolling(moCat.categoryId);
        }
      } else {
        const moCat = new MonthCategory(change.doc);
        const mo = manager.getMonth(MonthManager._dateIDToDate(moCat.monthId));

        if (mo.categories[moCat.categoryId]) {
          const oldBudget = mo.categories[moCat.categoryId].budget;
          mo.categories[moCat.categoryId].data = change.doc;

          mo.categories[moCat.categoryId]._emitBudgetChange(mo.categories[moCat.categoryId].budget - oldBudget);
        } else {
          moCat.subscribe(myBudget.put);
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

          that.filterAccounts();

          return;
        }
      }

      if (!change.deleted) {
        // Couldn't find it
        const acc = new Account(change.doc);
        acc.subscribe(myBudget.put);

        manager.addAccount(acc);

        that.filterAccounts();
      }

    },
    transaction(change) {
      let trans = manager.transactions[getId(change.id)];

      if (trans) {
        if (change.deleted) {
          manager.removeTransaction(trans);
        } else {
          if (trans.data.transfer) {
            trans.transfer = manager.transactions[trans.data.transfer];

            if (trans.transfer) {
              trans.transfer.transfer = trans;
            }
          }

          trans.data = change.doc;

          trans.splits.forEach(split => {
            split.transfer = manager.transactions[split.data.transfer];

            if (split.transfer) {
              split.transfer.transfer = split;
            }
          });
        }

        return;
      }

      if (!change.deleted) {
        // Couldn't find it
        trans = new Transaction(change.doc);
        trans.subscribe(myBudget.put);

        manager.addTransaction(trans);

        if (trans.data.transfer) {
          trans.transfer = manager.transactions[trans.data.transfer];

          if (trans.transfer) {
            trans.transfer.transfer = trans;
          }
        }

        trans.splits.forEach(split => {
          split.transfer = manager.transactions[split.data.transfer];

          if (split.transfer) {
            split.transfer.transfer = split;
          }
        });

        trans.splits.forEach(split => {
          manager.addTransaction(split);
        });
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
    } else if (Payee.contains(change.id)) {
      doChange.payee(change);
    }
  });
});
