angular.module('financier').controller('editAccountCtrl', function(editing, myAccount, manager, myBudg, transaction, $q, $rootScope, $scope, $stateParams, category, masterCategory, addCategory, masterCategories, MonthCategory, month, currencyDigits, filterAccounts) {
  const Transaction = transaction($stateParams.budgetId);
  const Category = category($stateParams.budgetId);
  const MasterCategory = masterCategory($stateParams.budgetId);
  const Month = month($stateParams.budgetId);

  this.editing = editing;

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
    name: 'Merchant Account',
    key: 'MERCHANT',
    onBudget: false
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
    name: 'Other Loan (Car, Boat, etc)',
    key: 'LOAN',
    onBudget: false
  }];

  this.submit = () => {
    myAccount.type = this.type.key;
    myAccount.onBudget = this.type.onBudget;

    const promises = [
      myBudg.put(myAccount)
    ];

    let transaction;

    if (!this.editing) {
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

        if (myAccount.isCredit()) {
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

      if (myAccount.isCredit()) {
        addCategory(cat);

        cat.subscribe(myBudg.put);
        myBudg.put(cat);

        manager.addMonthCategory(monthCat);
        myBudg.put(monthCat);

        $rootScope.$broadcast('masterCategories:change');
      }

      transaction = new Transaction({
        value: (this.startingBalance || 0) * Math.pow(10, currencyDigits) * (myAccount.isCredit() ? -1 : 1),
        date: this.startingBalanceDate.toISOString(),
        category: myAccount.isCredit() ? cat.id : 'income',
        account: myAccount.id,
        payee: 'initial-balance'
      }, myBudg.put);

      manager.addAccount(myAccount);

      filterAccounts();

      if (transaction) {
        manager.addTransaction(transaction);
      }

      promises.push(myBudg.put(transaction));
    }


    $q.all(promises).then(() => {
      $scope.closeThisDialog();
    });

  };

});
