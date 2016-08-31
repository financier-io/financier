angular.module('financier').controller('editAccountCtrl', function(editing, myAccount, manager, myBudg, transaction, $q, $rootScope, $scope, $stateParams, category, masterCategory, categories, masterCategories, MonthCategory, month) {
  const Transaction = transaction($stateParams.budgetId);
  const Category = category($stateParams.budgetId);
  const MasterCategory = masterCategory($stateParams.budgetId);
  const Month = month($stateParams.budgetId);

  this.editing = editing;

  this.account = myAccount;

  this.startingBalanceDate = new Date();

  this.submit = () => {
    const promises = [
      myBudg.put(myAccount)
    ];

    let transaction;

    if (!this.editing) {
      const cat = new Category({
        name: myAccount.name
      });

      let masterCat;
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
          categories: [cat.id],
          sort: -1
        });

        if (myAccount.isCredit()) {
          masterCategories[masterCat.id] = masterCat;

          myBudg.put(masterCat);
        }
      } else {
        if (myAccount.isCredit()) {
          masterCat.categories.push(cat.id);
          
          myBudg.put(masterCat);
        }
      }


      const monthCat = new MonthCategory.from($stateParams.budgetId, Month.createID(this.startingBalanceDate), cat.id);
      monthCat.overspending = true;

      if (myAccount.isCredit()) {
        categories[cat.id] = cat;

        myBudg.put(cat);

        manager.addMonthCategory(monthCat);
        myBudg.put(monthCat);

        $rootScope.$broadcast('masterCategories:change');
      }

      transaction = new Transaction({
        value: (this.startingBalance || 0) * 100 * (myAccount.isCredit() ? -1 : 1),
        date: this.startingBalanceDate.toISOString(),
        category: myAccount.isCredit() ? cat.id : 'income',
        account: myAccount.id,
        payee: 'initial-balance'
      }, myBudg.put);

      manager.addAccount(myAccount);

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
