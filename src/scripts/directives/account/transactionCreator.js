angular.module('financier').directive('transactionCreator', () => {
  return {
    template: require('./transactionCreator.html'),
    bindToController: {
      transaction: '='
    },
    controllerAs: 'transactionCtrl',
    controller: function($scope) {
      this.account = this.transaction.account;
      this.flag = this.transaction.flag;
      this.date = this.transaction.date;
      this.payee = this.transaction.payee;
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
        if (this.account === null || this.category === null) {
          throw new Error('Transaction must belong to an account and category');
        }

        this.transaction.account = this.account;
        this.transaction.flag = this.flag;
        this.transaction.date = this.date;
        // this.transaction.payee = this.payee;
        this.transaction.category = this.category;
        this.transaction.memo = this.memo;

        this.transaction.value = this.value.value;

        $scope.accountCtrl.manager.addTransaction(this.transaction);
        $scope.accountCtrl.myBudget.put(this.transaction);

        // if (this.newTransaction.transfer) {
        //   manager.addTransaction(this.newTransaction.transfer);
        // }
      }

      this.submitAndAddAnother = () => {
        this.submit();

        this.transaction = null;

        $scope.$emit('transaction:create');
      }

      this.cancel = () => {
        this.transaction = null;
      };

      $scope.$on('submit', this.submitAndAddAnother);
    }
  }
})
