import moment from "moment";

angular
  .module("financier")
  .directive(
    "transactionEditor",
    (
      $timeout,
      $rootScope,
      payee,
      transaction,
      $stateParams,
      splitTransaction,
      ngDialog,
      Hotkeys
    ) => {
      return {
        template: require("./transactionEditor.html").default,
        bindToController: {
          transaction: "=",
        },
        controllerAs: "transactionCtrl",
        controller: function ($scope) {
          const Payee = payee($stateParams.budgetId);
          const Transaction = transaction($stateParams.budgetId);
          const SplitTransaction = splitTransaction($stateParams.budgetId);

          this.$onInit = function () {
            // Make completely new copy of split transactions for editing
            this.splits = this.transaction.splits.map((s) =>
              initializeSplitEditor(s)
            );

            this.account = this.transaction.account;
            this.flag = this.transaction.flag;
            this.date = this.transaction.date;
            this.cleared = this.transaction.cleared;
            this.checkNumber = this.transaction.checkNumber;
            this.payee = $scope.dbCtrl.payees[this.transaction.payee];

            $scope.$watch(
              () => this.account,
              (newAccount) => {
                this.accountRecord =
                  $scope.accountCtrl.manager.getAccount(newAccount);
              }
            );
            if (this.transaction.transfer) {
              this.payee = $scope.accountCtrl.manager.getAccount(
                this.transaction.transfer.account
              );
            }

            this.category = this.transaction.category;

            $scope.$watch(
              () => this.payee,
              (payee, oldPayee) => {
                if (payee !== oldPayee) {
                  if (payee && payee.constructorName === "Payee") {
                    if (!this.category) {
                      this.category = payee.categorySuggest;
                    }
                  }
                }
              }
            );

            $scope.$watch(
              () => this.category,
              (newCat, oldCat) => {
                if (newCat !== oldCat) {
                  if (newCat === "split" && !this.splits.length) {
                    this.splits = [
                      new SplitTransaction(this.transaction).toJSON(),
                      new SplitTransaction(this.transaction).toJSON(),
                    ];
                    this.splits[0].value = createValueGetterSetter(
                      this.splits[0].value
                    );
                    this.splits[1].value = createValueGetterSetter(
                      this.splits[1].value
                    );
                  } else {
                    this.splits = [];
                  }
                }
              }
            );

            this.memo = this.transaction.memo;

            this.value = createValueGetterSetter(this.transaction.value);

            this.submit = () => {
              if (
                this.splits.length &&
                !validateSplits(this.value.value, this.splits)
              ) {
                ngDialog.open({
                  template: require("../../../views/modal/splitNotEqual.html")
                    .default,
                  controller: "cancelClickCtrl",
                });

                throw new Error("Splits do not add up");
              }

              if (
                this.transaction.transfer &&
                this.transaction.transfer.constructorName === "SplitTransaction"
              ) {
                if (this.value.value !== this.transaction.value) {
                  ngDialog.open({
                    template:
                      require("../../../views/modal/noChangeValueSplitTransfer.html")
                        .default,
                    controller: "cancelClickCtrl",
                  });

                  throw new Error("Split transfer value change attempt");
                }

                if (this.payee.id !== this.transaction.transfer.account) {
                  ngDialog.open({
                    template:
                      require("../../../views/modal/noChangePayeeSplitTransfer.html")
                        .default,
                    controller: "cancelClickCtrl",
                  });

                  throw new Error("Split transfer payee change attempt");
                }
              }

              if (this.splits.length) {
                if (this.payee.constructorName === "Account") {
                  ngDialog.open({
                    template:
                      require("../../../views/modal/noTransferAndSplit.html")
                        .default,
                    controller: "cancelClickCtrl",
                  });

                  throw new Error("Split transaction cannot also be transfer");
                }
              }

              // Attempt reference to account and transferAccount
              const account = $scope.accountCtrl.manager.getAccount(
                this.account
              );
              const transferAccount = $scope.accountCtrl.manager.getAccount(
                this.payee.id
              );

              // Remove the emit change handle to prevent 409 conflicts
              const saveFn =
                this.transaction.fn || $scope.accountCtrl.manager.saveFn;
              this.transaction.fn = null;

              if (this.transaction.transfer) {
                this.transaction.transfer.fn = null;
              }

              this.transaction.splits.forEach((s) => {
                if (s.transfer) {
                  s.transfer.fn = null;
                }
              });

              // Save all relevant data
              this.transaction.account = this.account;
              this.transaction.flag = this.flag;
              this.transaction.date = this.date;

              saveCategory(
                this.transaction,
                this.category,
                account,
                transferAccount
              );

              this.transaction.memo = this.memo;

              this.transaction.cleared = this.cleared;
              this.transaction.checkNumber = this.checkNumber;
              this.transaction.value = this.value.value || 0;

              savePayee(this.transaction, this.payee, account, transferAccount);

              this.transaction.splits = this.splits.map((s) => {
                return createSplitTransaction(
                  new SplitTransaction(this.transaction),
                  s
                );
              });

              if (
                !$scope.accountCtrl.manager.transactions[this.transaction.id]
              ) {
                $scope.accountCtrl.manager.addTransaction(this.transaction);
              }

              // Save transaction
              this.transaction.fn = saveFn;
              this.transaction._emitChange();

              // Save transaction's transfer, if exists
              if (this.transaction.transfer) {
                this.transaction.transfer.fn = saveFn;
                this.transaction.transfer._emitChange();
              }

              for (let i = 0; i < this.transaction.splits.length; i++) {
                // Save transaction splits's transfer(s), if exists
                if (this.transaction.splits[i].transfer) {
                  this.transaction.splits[i].transfer.fn = saveFn;
                  this.transaction.splits[i].transfer._emitChange();
                }
              }
            };

            this.addSplit = () => {
              const split = new SplitTransaction(this.transaction).toJSON();
              this.splits.push(split);
              split.value = createValueGetterSetter(split.value);

              $timeout(() => {
                $rootScope.$broadcast("split:new");
              });
            };

            this.removeSplit = (split) => {
              const index = this.splits.indexOf(split);

              if (split !== -1) {
                this.splits.splice(index, 1);
              }

              if (!this.splits.length) {
                this.category = null;
              }
            };

            function saveCategory(
              transaction,
              category,
              account,
              transferAccount
            ) {
              if (!account || account.onBudget) {
                if (transferAccount && transferAccount.onBudget) {
                  transaction.category = null;
                } else {
                  transaction.category = category;
                }
              } else {
                transaction.category = null;
              }
            }

            function validateSplits(value, splits) {
              return (
                value ===
                splits.reduce((prev, curr) => prev + curr.value.value, 0)
              );
            }

            function savePayee(transaction, payee, account, transferAccount) {
              if (payee.constructorName === "Payee") {
                if (payee.id !== transaction.payee) {
                  addPayee(transaction, payee);
                }
              } else if (payee.constructorName === "Account") {
                if (transaction.payee) {
                  removePayee(transaction);
                }

                if (transaction.transfer) {
                  transaction.transfer.account = payee.id;
                } else {
                  // Need to create transfer transaction
                  transaction.transfer = new Transaction({
                    value: -transaction.value,
                    date: moment(transaction.date).format("YYYY-MM-DD"),
                    account: payee.id,
                    transfer: transaction.id,
                    memo: transaction.memo,
                    category: null,
                  });

                  if (!transferAccount || transferAccount.onBudget) {
                    if (account && account.onBudget) {
                      transaction.transfer.category = null;
                    } else {
                      transaction.transfer.category = transaction.category;
                    }
                  } else {
                    transaction.transfer.category = null;
                  }

                  transaction._data.transfer = transaction.transfer.id;

                  transaction.transfer.transfer = transaction;

                  $scope.accountCtrl.manager.addTransaction(
                    transaction.transfer
                  );
                }
              } else if (!payee) {
                removeTransfer(transaction);

                if (transaction.payee) {
                  removePayee(transaction);
                }

                transaction.payee = null;
              } else if (angular.isString(payee)) {
                // Find existing in use case where using same payee name for multiple split
                // transactions on one that doesn't currently exist

                const existingPayee = findPayeeByName(payee);

                if (existingPayee) {
                  // One already exists
                  if (existingPayee.id !== transaction.payee) {
                    addPayee(transaction, existingPayee);
                  }
                } else {
                  // Does not exist
                  const newPayee = new Payee({
                    name: payee,
                    categorySuggest: transaction.category,
                  });

                  addPayee(transaction, newPayee);

                  $scope.dbCtrl.payees[newPayee.id] = newPayee;
                  $scope.accountCtrl.myBudget.put(newPayee);
                  newPayee.subscribe($scope.accountCtrl.myBudget.put);
                }
              }
            }

            function findPayeeByName(payeeName) {
              for (let id in $scope.dbCtrl.payees) {
                if ($scope.dbCtrl.payees[id].name === payeeName) {
                  return $scope.dbCtrl.payees[id];
                }
              }
            }

            function initializeSplitEditor(split) {
              const data = angular.copy(split.toJSON());

              data.value = createValueGetterSetter(split.value);

              data.payee = $scope.dbCtrl.payees[split.payee];
              data.oldPayee = split.payee;

              if (split.transfer) {
                data.payee = $scope.accountCtrl.manager.getAccount(
                  split.transfer.account
                );
              }

              return data;
            }

            function createSplitTransaction(split, data) {
              split.data.id = data.id;
              split.id = data.id;
              split.payee = data.oldPayee;

              split.transfer =
                $scope.accountCtrl.manager.transactions[data.transfer];
              split.data.transfer = data.transfer;
              if (split.transfer) {
                split.transfer.fn = null;
              }

              split.memo = data.memo;
              split.value = data.value.value || 0;

              // Attempt reference to account and transferAccount
              const account = $scope.accountCtrl.manager.getAccount(
                split.account
              );
              const transferAccount = $scope.accountCtrl.manager.getAccount(
                data.payee.id
              );

              saveCategory(split, data.category, account, transferAccount);
              savePayee(split, data.payee, account, transferAccount);

              return split;
            }

            function addPayee(transaction, payee) {
              removeTransfer(transaction);

              if (transaction.payee) {
                removePayee(transaction);
              }

              transaction.payee = payee.id;

              payee.categorySuggest = transaction.category;
            }

            function removePayee(transaction) {
              const transactions = Object.keys(
                $scope.accountCtrl.manager.transactions
              ).map((k) => {
                return $scope.accountCtrl.manager.transactions[k];
              });

              for (let i = 0; i < transactions.length; i++) {
                if (
                  transactions[i].payee === transaction.payee &&
                  transactions[i].id !== transaction.id
                ) {
                  transaction.payee = null;

                  return;
                }
              }

              if (
                $scope.dbCtrl.payees[transaction.payee] &&
                !$scope.dbCtrl.payees[transaction.payee].internal
              ) {
                $scope.dbCtrl.payees[transaction.payee].remove();
                delete $scope.dbCtrl.payees[transaction.payee];

                transaction.payee = null;
              }
            }

            function removeTransfer(transaction) {
              if (transaction.transfer) {
                transaction.transfer.transfer = null;

                $scope.accountCtrl.manager.removeTransaction(
                  transaction.transfer
                );
                transaction.transfer.remove();

                $scope.accountCtrl.myBudget.put(transaction.transfer);

                transaction.transfer = null;
              }

              if (transaction._data.transfer) {
                transaction._data.transfer = null;
              }
            }

            function createValueGetterSetter(initialValue) {
              return {
                value: initialValue,
                get outflow() {
                  if (this.value < 0) {
                    return Math.abs(this.value);
                  }

                  return undefined;
                },
                set outflow(v) {
                  this.value = -v;
                },
                get inflow() {
                  if (this.value > 0) {
                    return this.value;
                  }

                  return undefined;
                },
                set inflow(v) {
                  this.value = v;
                },
              };
            }

            this.submitAndAddAnother = () => {
              this.submit();
              $rootScope.$broadcast("transaction:create");
            };

            $scope.$on("submit", this.submitAndAddAnother);

            const hotkeys = Hotkeys.createHotkey({
              key: "escape",
              callback: () => {
                $scope.accountCtrl.stopEditing();
              },
            });

            // Register hotkeys object
            Hotkeys.registerHotkey(hotkeys);

            $scope.$on("$destroy", () => {
              Hotkeys.deregisterHotkey(hotkeys);
            });
          };
        },
      };
    }
  );
