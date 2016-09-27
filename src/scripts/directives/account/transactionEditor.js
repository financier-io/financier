angular.module('financier').directive('transactionEditor', (payee, transaction, $stateParams) => {
  return {
    template: require('./transactionEditor.html'),
    bindToController: {
      transaction: '='
    },
    controllerAs: 'transactionCtrl',
    controller: function($scope) {
      const Payee = payee($stateParams.budgetId);
      const Transaction = transaction($stateParams.budgetId);

      this.account = this.transaction.account;
      this.flag = this.transaction.flag;
      this.date = this.transaction.date;
      this.payee = $scope.dbCtrl.payees[this.transaction.payee];

      if (this.transaction.transfer) {        
         this.payee = $scope.accountCtrl.manager.getAccount(this.transaction.transfer.account);
      }

      this.category = this.transaction.category;
      this.memo = this.transaction.memo;

      this.value = {
        value: this.transaction.value,
        get outflow() {
          if (this.value < 0) {
            return Math.abs(this.value);
          }
        },
        set outflow(v) {
          this.value = -v;
        },
        get inflow() {
          if (this.value > 0) {
            return this.value;
          }
        },
        set inflow(v) {
          this.value = v;
        }
      };

      this.submit = () => {
        const saveFn = this.transaction.fn;
        this.transaction.fn = null;

        if (this.transaction.transfer) {
          this.transaction.transfer.fn = null;
        }

        this.transaction.account = this.account;
        this.transaction.flag = this.flag;
        this.transaction.date = this.date;

        this.transaction.category = this.category;
        this.transaction.memo = this.memo;

        this.transaction.value = this.value.value;

        if (this.payee.constructorName === 'Payee') {

          if (this.payee.id !== this.transaction.payee) {
            addPayee(this.transaction, this.payee);
          }

        } else if (this.payee.constructorName === 'Account') {
          if (this.transaction.payee) {
            removePayee(this.transaction);
          }

          if (this.transaction.transfer) {
            this.transaction.transfer.account = this.payee.id;
          } else {
            // Need to create transfer transaction
            this.transaction.transfer = new Transaction({
              value: -this.value.value,
              date: this.date,
              account: this.payee.id,
              transfer: this.transaction.id,
              category: null
            });

            this.transaction.category = null;
            this.transaction._data.transfer = this.transaction.transfer.id;

            this.transaction.transfer.transfer = this.transaction;

            $scope.accountCtrl.manager.addTransaction(this.transaction.transfer);
          }
        } else if (angular.isString(this.payee)) {
          if (!this.payee) {
            throw new Error('Payee must have a name');
          }

          const newPayee = new Payee({
            name: this.payee
          });

          addPayee(this.transaction, newPayee);

          $scope.dbCtrl.payees[newPayee.id] = newPayee;
          $scope.accountCtrl.myBudget.put(newPayee);
          newPayee.subscribe($scope.accountCtrl.myBudget.put);
        }


        this.transaction.fn = saveFn;
        this.transaction._emitChange();

        if (this.transaction.transfer) {
          this.transaction.transfer.fn = saveFn;
          this.transaction.transfer._emitChange();
        }
      }

      function addPayee(transaction, payee) {
        removeTransfer(transaction);

        if (transaction.payee) {
          removePayee(transaction);
        }

        transaction.payee = payee.id;
      }

      function removePayee(transaction) {
        const transactions = $scope.accountCtrl.manager.allAccounts.transactions;

        for (let i = 0; i < transactions.length; i++) {
          if (transactions[i].payee === transaction.payee &&
              transactions[i] !== transaction) {
            transaction.payee = null;

            return;
          }
        }

        if (!$scope.dbCtrl.payees[transaction.payee].internal) {
          $scope.dbCtrl.payees[transaction.payee].remove();
          delete $scope.dbCtrl.payees[transaction.payee];

          transaction.payee = null;
        }
      }

      function removeTransfer(transaction) {
        if (transaction.transfer) {
          transaction.transfer.transfer = null;

          $scope.accountCtrl.manager.removeTransaction(transaction.transfer);
          transaction.transfer.remove();

          $scope.accountCtrl.myBudget.put(transaction.transfer);

          transaction.transfer = null;
        }

        if (transaction._data.transfer) {
          transaction._data.transfer = null;
        }
      }
    }
  }
})
