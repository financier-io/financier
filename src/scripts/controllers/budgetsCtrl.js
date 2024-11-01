import editBudgetHtml from "../../views/modal/editBudget.html?raw";

angular
  .module("financier")
  .controller(
    "budgetsCtrl",
    function (
      $q,
      Budget,
      BudgetOpened,
      myBudgets,
      myBudgetsOpened,
      $scope,
      $http,
      db,
      ngDialog,
    ) {
      this.budgets = myBudgets;
      this.budgetsOpened = myBudgetsOpened;

      const getBudgets = () => {
        $q.all([db.budgets.all(), db.budgetsOpened.all()]).then(
          ([budgets, budgetsOpened]) => {
            this.budgets = budgets;
            this.budgetsOpened = budgetsOpened;
          },
        );
      };

      this.budgetOrder = (budget) =>
        this.budgetsOpened[budget.id]
          ? this.budgetsOpened[budget.id].opened
          : 0;

      function getId(_id) {
        return _id.slice(_id.lastIndexOf("_") + 1);
      }

      $scope.$on("reset", () => {
        getBudgets();
      });

      $scope.$on("pouchdb:change", (e, change) => {
        // if it's a Budget
        if (Budget.contains(change.id)) {
          // look through our budgets to see if it exists
          for (let i = 0; i < this.budgets.length; i++) {
            if (this.budgets[i]._id === change.id) {
              if (change.deleted) {
                this.budgets.splice(i, 1);
              } else {
                this.budgets[i].data = change.doc;
              }

              return;
            }
          }

          if (!change.deleted) {
            // Couldn't find it
            const b = new Budget(change.doc);
            b.subscribe(db.budgets.put);

            this.budgets.push(b);
          }
        } else if (BudgetOpened.contains(change.id)) {
          const id = getId(change.id);

          // look through our budgets to see if it exists
          if (this.budgetsOpened[id]) {
            if (change.deleted) {
              delete this.budgetsOpened[id];
            } else {
              this.budgetsOpened[id].data = change.doc;
            }

            return;
          }

          if (!change.deleted) {
            // Couldn't find it
            const b = new BudgetOpened(change.doc);
            b.subscribe(db.budgetsOpened.put);

            this.budgetsOpened[b.id] = b;
          }
        }
      });

      let removingBudget;

      this.isRemoving = (budget) => budget === removingBudget;

      this.removing = (budget, e) => {
        e.preventDefault();
        e.stopPropagation();

        removingBudget = budget;
      };

      this.remove = (budget) => {
        const recordsToRemove = [db.budget(budget.id).remove()];

        if (this.budgetsOpened[budget.id]) {
          recordsToRemove.push(this.budgetsOpened[budget.id].remove());
        }

        $q.all(recordsToRemove)
          .then(() => {
            return budget.remove();
          })
          .then(() => {
            // TODO might not need to be done due to _changes work
            getBudgets();
          });
      };

      this.edit = (budget, e) => {
        e.preventDefault();
        e.stopPropagation();

        ngDialog.open({
          template: editBudgetHtml,
          controller: "editBudgetCtrl as editBudgetCtrl",
          resolve: {
            budgetRecord: () => budget,
          },
        });
      };
    },
  );
