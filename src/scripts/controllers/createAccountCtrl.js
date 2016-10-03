angular.module('financier').controller('createAccountCtrl', function($locale, myAccount, manager, myBudg, transaction, $q, $rootScope, $scope, $stateParams, category, masterCategory, addCategory, masterCategories, MonthCategory, month, currencyDigits, filterAccounts, onBudgetAccounts, offBudgetAccounts) {
  const Transaction = transaction($stateParams.budgetId);
  const Category = category($stateParams.budgetId);
  const MasterCategory = masterCategory($stateParams.budgetId);
  const Month = month($stateParams.budgetId);

  this.DECIMAL_SEP = $locale.NUMBER_FORMATS.DECIMAL_SEP;

  this.account = myAccount;

  this.startingBalanceDate = new Date();

  this.getGroupName = onBudget => onBudget ? 'On Budget' : 'Off Budget';

  this.accountTypes = [{
    name: 'Checking',
    key: 'DEBIT',
    onBudget: true
  },
  {
    name: 'Savings',
    key: 'SAVINGS',
    onBudget: true
  },
  {
    name: 'Credit Card',
    key: 'CREDIT',
    onBudget: true
  },
  {
    name: 'Cash',
    key: 'CASH',
    onBudget: true
  },
  {
    name: 'Line of Credit',
    key: 'OTHERCREDIT',
    onBudget: true
  },
  {
    name: 'Merchant Account',
    key: 'MERCHANT',
    onBudget: true
  },
  {
    name: 'Mortgage',
    key: 'MORTGAGE',
    onBudget: false
  },
  {
    name: 'Investment Account',
    key: 'INVESTMENT',
    onBudget: false
  },
  {
    name: 'Other Asset',
    key: 'ASSET',
    onBudget: false
  },
  {
    name: 'Other Liability',
    key: 'LOAN',
    onBudget: false
  }];

  this.submit = () => {
    myAccount.type = this.type.key;
    myAccount.onBudget = this.type.onBudget;

    myAccount.sort = (myAccount.onBudget ? onBudgetAccounts : offBudgetAccounts).length;

    const promises = [
      myBudg.put(myAccount)
    ];

    let transaction;


    let masterCat, cat;
    for (let id in masterCategories) {
      if (masterCategories.hasOwnProperty(id)) {
        if (masterCategories[id].name === 'Pre-financier debt') {
          masterCat = masterCategories[id];
        }
      }
    }

    if (!masterCat) {
      masterCat = new MasterCategory({
        name: 'Pre-financier debt',
        sort: -1
      });

      if (myAccount.isCredit() && myAccount.onBudget) {
        masterCategories[masterCat.id] = masterCat;

        masterCat.subscribe(myBudg.put);
        myBudg.put(masterCat);
      }
    }

    cat = new Category({
      name: myAccount.name,
      masterCategory: masterCat.id
    });

    const monthCat = new MonthCategory.from($stateParams.budgetId, Month.createID(this.startingBalanceDate), cat.id);
    monthCat.overspending = true;

    if (myAccount.isCredit() && myAccount.onBudget) {
      addCategory(cat);

      cat.subscribe(myBudg.put);
      myBudg.put(cat);

      manager.addMonthCategory(monthCat);
      myBudg.put(monthCat);

      $rootScope.$broadcast('masterCategories:change');
    }

    transaction = new Transaction({
      value: (this.startingBalance || 0) * (myAccount.isCredit() ? -1 : 1),
      date: this.startingBalanceDate.toISOString(),
      category: (myAccount.isCredit() && myAccount.onBudget) ? cat.id : 'income',
      account: myAccount.id,
      payee: 'initial-balance'
    }, myBudg.put);

    manager.addAccount(myAccount);

    filterAccounts();

    if (transaction) {
      manager.addTransaction(transaction);
    }

    promises.push(myBudg.put(transaction));

    $q.all(promises).then(() => {
      $scope.closeThisDialog();
    });

  };

});
