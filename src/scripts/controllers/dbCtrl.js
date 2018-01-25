import moment from 'moment';

angular.module('financier').controller('dbCtrl', function (exportCsv, monthManager, MonthCategory, category, account, transaction, payee, masterCategory, db, budgetRecord, data, $stateParams, $scope, $q, month, ngDialog, myBudget, budgetOpenedRecord, currencies, $timeout, $state, $translate, $filter, backup) {
  const that = this;

  const dateFilter = $filter('date');

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
  this.categories = categories;

  this.masterCategories = masterCategories;
  this.accounts = manager.accounts;

  this.allMonths = manager.months;

  this.export = () => {
    exportCsv.create({
      transactions: Object.keys(this.manager.transactions).map(id => this.manager.transactions[id]),
      accounts: this.accounts,
      masterCategories: this.masterCategories,
      categories: this.categories,
      payees: this.payees,
      currencySymbol: this.currencySymbol,
      currencyDigits: this.currencyDigits,
      months: this.manager.months,
      budgetName: this.budgetRecord.name
    });
  };

  this.getTransactionHeight = trans => {
    const unitHeight = 30; // one "row" of transaction table
    let rows;

    if (!trans.splitOpen && trans !== this.editingTransaction) {
      rows = 1;
    } else if (trans.splitOpen && trans !== this.editingTransaction) {
      rows = trans.splits.length + 1;
    } else if (trans === this.editingTransaction) {
      rows = trans.splits.length + 2;
    }

    return unitHeight * rows;
  };

  function _removeEmojis(str) {
    if (angular.isString(str)) {
      return str.replace(/([#0-9]\u20E3)|[\xA9\xAE\u203C\u2047-\u2049\u2122\u2139\u3030\u303D\u3297\u3299][\uFE00-\uFEFF]?|[\u2190-\u21FF][\uFE00-\uFEFF]?|[\u2300-\u23FF][\uFE00-\uFEFF]?|[\u2460-\u24FF][\uFE00-\uFEFF]?|[\u25A0-\u25FF][\uFE00-\uFEFF]?|[\u2600-\u27BF][\uFE00-\uFEFF]?|[\u2900-\u297F][\uFE00-\uFEFF]?|[\u2B00-\u2BF0][\uFE00-\uFEFF]?|(?:\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDEFF])[\uFE00-\uFEFF]?/g, '').trim();
    }

    return str;
  }

  this.customSorts = {
    account(transaction) {
      return _removeEmojis(manager.getAccount(transaction.account).name);
    },
    date(transaction) {
      // Sort by date and then value
      return transaction.date.getTime() + transaction.value;
    },
    checkNumber(transaction) {
      return +transaction.checkNumber || transaction.checkNumber;
    },
    category(transaction) {
      return _removeEmojis(that.getCategoryName(transaction.category, transaction.date)) || '';
    },
    payee(transaction) {
      return (transaction.transfer ? _removeEmojis($scope.dbCtrl.getAccountName(transaction.transfer.account)) : _removeEmojis(that.getPayeeName(transaction.payee))) || '';
    },
    cleared(transaction) {
      if (transaction.reconciled) {
        return 2;
      } else if (transaction.cleared) {
        return 1;
      }

      return 0;
    },
    outflow(transaction) {
      return -transaction.value;
    },
    inflow(transaction) {
      return transaction.value;
    },
    flag(transaction) {
      return transaction.flag || '';
    }
  };

  this.filterAccounts = () => {
    const bySort = (a, b) => a.sort - b.sort;

    this.onBudgetAccounts = this.accounts.filter(acc => acc.onBudget && !acc.closed).sort(bySort);
    this.offBudgetAccounts = this.accounts.filter(acc => !acc.onBudget && !acc.closed).sort(bySort);
    this.closedAccounts = this.accounts.filter(acc => acc.closed).sort(bySort);
  };

  this.totalAccountsBalance = accounts => {
    let total = 0;

    for (let i = 0; i < accounts.length; i++) {
      total += accounts[i].balance;
    }

    return total;
  };

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
    };

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
  };

  this.backup = () => {
    return backup.backup(budgetRecord.id);
  };

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
    get monthOverview() {
      return this._monthOverviewCollapsed === 'true';
    },
    set monthOverview(s) {
      localStorage.setItem('monthOverviewCollapsed', s);
      this._monthOverviewCollapsed = localStorage.getItem('monthOverviewCollapsed');
    }
  };

  this.collapsed._onBudgetAccountsCollapsed = false;
  this.collapsed._offBudgetAccountsCollapsed = localStorage.getItem('offBudgetAccountsCollapsed');
  this.collapsed._closedAccountsCollapsed = localStorage.getItem('closedAccountsCollapsed');
  this.collapsed._monthOverviewCollapsed = localStorage.getItem('monthOverviewCollapsed');

  this.filterAccounts();

  this.budgetRecord = budgetRecord;
  this.payees = payees;

  budgetOpenedRecord.open();

  const lastMonth = localStorage.getItem(`lastBudgetMonth_${$stateParams.budgetId}`);

  if (lastMonth) {
    this.currentMonth = new Date(lastMonth);
  } else {
    this.currentMonth = new Date();
  }

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
      return $translate.instant('INCOME_FOR', { month: dateFilter(moment(transactionDate).toDate(), 'MMMM') });
    } else if (id === 'incomeNextMonth') {
      return $translate.instant('INCOME_FOR', { month: dateFilter(moment(transactionDate).add(1, 'month').toDate(), 'MMMM') });
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

  this.getSplitPayeeName = trans => {
    var payee = this.getPayeeName(trans.payee);

    if (trans.constructorName === 'SplitTransaction') {
      if (payee !== trans.payee && payee) {
        payee = ` : ${payee}`;
      }

      payee = `[Split] ${this.getPayeeName(trans.transaction.payee)}${payee || ''}`;
    }

    return payee;
  };

  $scope.$watch(
    () => this.currentMonth,
    currentMonth => {
      if (angular.isDefined(currentMonth)) {
        this.months = getView(currentMonth.toDate ? currentMonth.toDate() : currentMonth);

        localStorage.setItem(
          `lastBudgetMonth_${$stateParams.budgetId}`,
          currentMonth.toDate ? currentMonth.toDate() : currentMonth
        );
      }
    }
  );

  this.removeCategory = cat => {
    delete this.categories[cat.id];

    this.masterCategories[cat.masterCategory].removeCategory(cat);
  };

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

  };

  for (let id in this.categories) {
    if (this.categories.hasOwnProperty(id)) {
      this.addCategory(this.categories[id]);
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

  const doChange = {
    masterCategory(change) {
      // look through our categories to see if it exists

      const cat = that.masterCategories[getId(change.id)];

      if (change.deleted) {
        if (cat) {
          delete that.masterCategories[getId(change.id)];

          $scope.$broadcast('masterCategories:change');
        }
      } else {
        if (cat) {
          cat.data = change.doc;
        } else {
          // Couldn't find it
          const b = new MasterCategory(change.doc);
          b.subscribe(myBudget.put);

          that.masterCategories[b.id] = b;

          // Add back any categories
          for (let id in that.categories) {
            if (that.categories.hasOwnProperty(id)) {
              if (that.categories[id].masterCategory === b.id) {
                b.addCategory(that.categories[id]);
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
    month() {
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
          mo.categories[moCat.categoryId].data = change.doc;
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
