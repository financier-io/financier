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
        if (this.account === null) {
          throw new Error('Transaction must belong to an account');
        }

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

        if (this.payee.constructor.name === 'Payee') {

          addPayee(this.transaction, this.payee);

        } else if (this.payee.constructor.name === 'Account') {
          this.transaction.payee = null;

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
            $scope.accountCtrl.myBudget.put(this.transaction.transfer);
          }
        } else if (angular.isString(this.payee)) {

          const newPayee = new Payee({
            name: this.payee
          });

          addPayee(this.transaction, newPayee);

          $scope.dbCtrl.payees[newPayee.id] = newPayee;
          $scope.accountCtrl.myBudget.put(newPayee);
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

        transaction.payee = payee.id;
      }

      function removeTransfer(transaction) {
        if (transaction.transfer) {
          transaction.transfer.transfer = null;

          transaction.transfer.remove();
          $scope.accountCtrl.manager.removeTransaction(transaction.transfer);

          transaction.transfer = null;
        }

        if (transaction._data.transfer) {
          transaction._data.transfer = null;
        }
      }
    }
  }
})
