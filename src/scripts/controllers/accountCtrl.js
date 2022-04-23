import moment from "moment";

angular
  .module("financier")
  .controller(
    "accountCtrl",
    function (
      $translate,
      $timeout,
      $document,
      $element,
      $scope,
      $rootScope,
      $stateParams,
      data,
      transaction,
      payee,
      myBudget,
      budgetRecord,
      Hotkeys
    ) {
      const that = this;

      const Transaction = transaction($stateParams.budgetId);
      const Payee = payee($stateParams.budgetId);

      const { manager } = data;

      this.accountId = $stateParams.accountId;

      if ($stateParams.accountId) {
        this.account = manager.getAccount($stateParams.accountId);

        Object.defineProperty(this, "checkNumber", {
          get: () => {
            return this.account.checkNumber;
          },
          set: (c) => {
            this.account.checkNumber = c;
          },
        });
      } else {
        this.account = manager.allAccounts;

        Object.defineProperty(this, "checkNumber", {
          get: () => {
            return budgetRecord.checkNumber;
          },
          set: (c) => {
            budgetRecord.checkNumber = c;
          },
        });
      }

      // Filter transactions by account
      this.manager = manager;
      this.myBudget = myBudget;

      this.reconcileCollapsed = true;

      if (this.accountId) {
        $scope.transactions = manager.getAccount(this.accountId).transactions;
      } else {
        $scope.transactions = manager.allAccounts.transactions;
      }

      this.openSplit = (trans, $event) => {
        $event.stopPropagation();

        trans.splitOpen = !trans.splitOpen;

        // TODO: This should be triggered whenever the split height can change
        // (e.g. when other device updates # of splits, etc)
        $rootScope.$broadcast("vsRepeatTrigger");
      };

      this.transactionNeedsCategory = (trans) => {
        if (trans) {
          const tranAcc = manager.getAccount(trans.account);

          if (tranAcc && !tranAcc.onBudget) {
            return false;
          }

          if (trans.transfer) {
            const transferTranAcc = manager.getAccount(trans.transfer.account);

            if (
              tranAcc &&
              tranAcc.onBudget &&
              transferTranAcc &&
              transferTranAcc.onBudget
            ) {
              return false;
            }
          }

          return true;
        }
      };

      // Sort the default order to prevent initial page flash
      $scope.transactions.sort((a, b) => {
        // TODO this sort isn't perfect -- equal dates/values will jump in order
        // Should make order determinable based off persisted UUID or something.
        return b.date.getTime() + b.value - (a.date.getTime() + a.value);
      });

      this.finishReconciliation = () => {
        for (let i = 0; i < this.account.transactions.length; i++) {
          const transaction = this.account.transactions[i];

          if (transaction.cleared) {
            transaction.reconciled = true;
          }
        }

        this.reconcileCollapsed = true;
      };

      this.reconcile = () => {
        let payee = $scope.dbCtrl.payees["reconciled"];

        if (!payee) {
          payee = new Payee({
            name: $translate.instant("RECONCILED_BALANCE_ADJUSTMENT"),
            autosuggest: false,
            internal: true,
            _id: `${Payee.prefix}reconciled`,
          });

          $scope.dbCtrl.payees[payee.id] = payee;

          myBudget.put(payee);
        }

        const trans = new Transaction({
          value: this.reconcileAmount - this.account.cache.clearedBalance,
          cleared: true,
          reconciled: true,
          date: moment().format("YYYY-MM-DD"),
          account: this.accountId,
          payee: payee.id,
          category: "income",
        });

        this.manager.addTransaction(trans);
        myBudget.put(trans);

        this.finishReconciliation();
      };

      that.selectedTransactionIndexes = [];
      that.selectedTransactions = [];

      this.createTransaction = () => {
        this.editingTransaction = null;
        this.selectedTransactions = [];

        const oldTransaction = this.newTransaction;
        this.newTransaction = null;

        const createNew = () => {
          this.newTransaction = new Transaction({
            account: this.accountId || null,
          });
          this.newTransaction.date = oldTransaction
            ? angular.copy(oldTransaction.date)
            : new Date();

          this.newTransaction.addTransaction = (t) =>
            this.manager.addTransaction(t);
          this.newTransaction.removeTransaction = (t) =>
            this.manager.removeTransaction(t);

          $timeout(() => {
            if (this.accountId) {
              $scope.$broadcast("transaction:date:focus");
            } else {
              $scope.$broadcast("transaction:account:focus");
            }
          });

          $rootScope.$broadcast("vsRepeatTrigger");
        };

        if (oldTransaction) {
          $timeout(() => {
            createNew();
          });
        } else {
          createNew();
        }
      };

      $scope.$on("transaction:create", () => {
        this.createTransaction();
      });

      this.setCleared = (event, trans) => {
        $scope.dbCtrl.stopPropagation(event);

        let cleared = trans.cleared;

        if (this.selectedTransactions.indexOf(trans) === -1) {
          that.selectedTransactions = [trans];
        }

        for (let i = 0; i < that.selectedTransactions.length; i++) {
          that.selectedTransactions[i].cleared = !cleared;
        }
      };

      this.toggleCleared = () => {
        // Determine what the majority of selected transactions are
        const amountCleared = that.selectedTransactions.reduce((count, t) => {
          return count + (t.cleared ? 1 : 0);
        }, 0);

        let cleared = true;
        if (amountCleared === that.selectedTransactions.length) {
          cleared = false;
        }

        for (let i = 0; i < that.selectedTransactions.length; i++) {
          that.selectedTransactions[i].cleared = cleared;
        }
      };

      this.selectAll = () => {
        this.selectedTransactions = $scope.displayedTransactions;
      };

      this.isAllSelected = (val) => {
        if (angular.isDefined(val)) {
          if (val) {
            this.selectAll();
          } else {
            this.selectedTransactions = [];
          }
        }

        return (
          this.selectedTransactions.length ===
          ($scope.displayedTransactions || []).length
        );
      };

      const documentClickHandler = () => {
        that.selectedTransactions = [];
        that.selectedTransactionIndexes = [];
        this.editingTransaction = null;
        this.newTransaction = null;

        $rootScope.$broadcast("vsRepeatTrigger");
      };

      $scope.$on("account:deselectTransactions", documentClickHandler);

      const selectAllKeyCombos = ["meta+a", "ctrl+a"];
      $document.bind("click", () => {
        documentClickHandler();
        $scope.$digest();
      });
      const hotkeys = Hotkeys.createHotkey({
        key: selectAllKeyCombos,
        callback: (event) => {
          if (event.target.tagName === "INPUT") {
            return;
          }

          // Stop default behavior => selecting all text
          event.preventDefault();
          event.stopPropagation();

          this.selectAll();
        },
      });
      Hotkeys.registerHotkey(hotkeys);

      // Do before $destroy (since both states can exist at once, 'cause animations)
      $scope.$on("$stateChangeStart", () => {
        $document.unbind("click");

        Hotkeys.deregisterHotkey(hotkeys);
      });

      this.stopEditing = () => {
        if (this.newTransaction) {
          this.newTransaction = null;
        } else {
          this.selectedTransactions = [this.editingTransaction];
          this.editingTransaction = null;

          $rootScope.$broadcast("vsRepeatTrigger");
        }
      };

      this.selectRow = function (event, rowIndex) {
        $scope.dbCtrl.stopPropagation(event);

        this.editingTransaction = null;
        that.newTransaction = null;

        // Cannot select anything when adding a new transaction
        if (that.newTransaction) {
          return;
        }

        that.selectedTransactionIndexes = that.selectedTransactions.map(
          (trans) => {
            for (let i = 0; i < $scope.displayedTransactions.length; i++) {
              if (trans === $scope.displayedTransactions[i]) {
                return i;
              }
            }
          }
        );

        if (
          that.selectedTransactionIndexes.length === 1 &&
          that.selectedTransactionIndexes[0] === rowIndex
        ) {
          that.editingTransaction = $scope.displayedTransactions[rowIndex];
          that.selectedTransactionIndexes = [];

          let [clickFromField, index] = (
            getFocusName(event.target) || ""
          ).split("-");

          if (window.isNaN(+index)) {
            index = undefined;
          } else {
            index = +index;
          }

          $timeout(() => {
            $scope.$broadcast(`transaction:${clickFromField}:focus`, { index });
          });
        } else {
          if (event.ctrlKey || event.metaKey) {
            // mac is metaKey
            changeSelectionStatus(rowIndex);
          } else if (event.shiftKey) {
            selectWithShift(rowIndex);
          } else {
            that.selectedTransactionIndexes = [rowIndex];
          }
        }

        that.selectedTransactions = that.selectedTransactionIndexes.map(
          (i) => $scope.displayedTransactions[i]
        );

        $rootScope.$broadcast("vsRepeatTrigger");
      };

      function getFocusName(el) {
        if (!el || !el.getAttribute) {
          return "";
        }

        const name = el.getAttribute("transaction-field-focus-name");

        if (name) {
          return name;
        }

        return getFocusName(el.parentNode);
      }

      this.isTransactionSelected = function (trans) {
        return that.selectedTransactions.indexOf(trans) > -1;
      };

      function isRowSelected(index) {
        return that.selectedTransactionIndexes.indexOf(index) > -1;
      }

      function selectWithShift(rowIndex) {
        var lastSelectedRowIndexInSelectedRowsList =
          that.selectedTransactionIndexes.length - 1;
        var lastSelectedRowIndex =
          that.selectedTransactionIndexes[
            lastSelectedRowIndexInSelectedRowsList
          ];
        var selectFromIndex = Math.min(rowIndex, lastSelectedRowIndex);
        var selectToIndex = Math.max(rowIndex, lastSelectedRowIndex);
        selectRows(selectFromIndex, selectToIndex);
      }

      function selectRows(selectFromIndex, selectToIndex) {
        for (
          var rowToSelect = selectFromIndex;
          rowToSelect <= selectToIndex;
          rowToSelect++
        ) {
          select(rowToSelect);
        }
      }

      function changeSelectionStatus(rowIndex) {
        if (isRowSelected(rowIndex)) {
          unselect(rowIndex);
        } else {
          select(rowIndex);
        }
      }

      function select(rowIndex) {
        if (!isRowSelected(rowIndex)) {
          that.selectedTransactionIndexes.push(rowIndex);
        }
      }

      function unselect(rowIndex) {
        var rowIndexInSelectedRowsList =
          that.selectedTransactionIndexes.indexOf(rowIndex);
        var unselectOnlyOneRow = 1;
        that.selectedTransactionIndexes.splice(
          rowIndexInSelectedRowsList,
          unselectOnlyOneRow
        );
      }

      this.toggle = (index, event) => {
        $scope.dbCtrl.stopPropagation(event);

        // Cannot select anything when adding a new transaction
        if (that.newTransaction) {
          return;
        }

        that.selectedTransactionIndexes = that.selectedTransactions.map(
          (trans) => {
            for (let i = 0; i < $scope.displayedTransactions.length; i++) {
              if (trans === $scope.displayedTransactions[i]) {
                return i;
              }
            }
          }
        );

        changeSelectionStatus(index);

        that.selectedTransactions = that.selectedTransactionIndexes.map(
          (i) => $scope.displayedTransactions[i]
        );
      };

      that.selectGetterSetter = (trans) => {
        return (val) => {
          if (angular.isUndefined(val)) {
            return that.isTransactionSelected(trans);
          }
        };
      };

      const clearedHotkeys = Hotkeys.createHotkey({
        key: "c",
        callback: () => {
          this.toggleCleared();
        },
      });

      // Register hotkeys object
      Hotkeys.registerHotkey(clearedHotkeys);

      $scope.$on("$destroy", () => {
        Hotkeys.deregisterHotkey(clearedHotkeys);
      });
    }
  );
