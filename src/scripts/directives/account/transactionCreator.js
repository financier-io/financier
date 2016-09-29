angular.module('financier').directive('transactionCreator', (payee, transaction, $stateParams, $timeout, $rootScope) => {
  return {
    template: require('./transactionCreator.html'),
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
      this.payee = this.transaction.payee;
      this.category = this.transaction.category;
      this.memo = this.transaction.memo;
      this.cleared = this.transaction.cleared;

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
        const account = $scope.accountCtrl.manager.getAccount(this.account);
        const transferAccount = $scope.accountCtrl.manager.getAccount(this.payee.id);

        this.transaction.account = this.account;
        this.transaction.flag = this.flag;
        this.transaction.date = this.date;

        if (!account || account.onBudget) {
          if (transferAccount && transferAccount.onBudget) {
            this.transaction.category = null;
          } else {
            this.transaction.category = this.category;
          }
        } else {
          this.transaction.category = null;
        }

        this.transaction.memo = this.memo;
        this.transaction.cleared = this.cleared;

        this.transaction.value = this.value.value;


        if (this.payee.constructorName === 'Payee') {

          addPayee(this.transaction, this.payee);

        } else if (this.payee.constructorName === 'Account') {
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
              memo: this.memo,
              category: null
            });

            if (!transferAccount || transferAccount.onBudget) {
              if (account && account.onBudget) {
                this.transaction.transfer.category = null;
              } else {
                this.transaction.transfer.category = this.category;
              }
            } else {
              this.transaction.transfer.category = null;
            }

            this.transaction._data.transfer = this.transaction.transfer.id;

            this.transaction.transfer.transfer = this.transaction;

            $scope.accountCtrl.manager.addTransaction(this.transaction.transfer);
            $scope.accountCtrl.myBudget.put(this.transaction.transfer);
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

        $scope.accountCtrl.manager.addTransaction(this.transaction);
        $scope.accountCtrl.myBudget.put(this.transaction);

        // if (this.newTransaction.transfer) {
        //   manager.addTransaction(this.newTransaction.transfer);
        // }

        $scope.accountCtrl.newTransaction = null;
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

      this.submitAndAddAnother = () => {
        this.submit();

        $timeout(() => {
          $rootScope.$broadcast('transaction:create');
        });
      }

      this.cancel = () => {
        this.transaction = null;
      };

      $scope.$on('submit', this.submitAndAddAnother);
    }
  }
})
