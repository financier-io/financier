angular.module("financier").directive("checkNumberInput", ($rootScope) => {
  return {
    restrict: "A",
    scope: {
      checkNumber: "=",
      transactions: "=",
    },
    compile: () => {
      return {
        pre: (scope, element) => {
          const input = element.find("input");

          scope.$on("transaction:check:focus", () => {
            input[0].focus();
          });

          input.on("keydown", (e) => {
            if (e.which === 13) {
              // enter
              $rootScope.$broadcast("transaction:payee:focus");

              // go next
              $rootScope.$apply();
            } else if (e.which === 38) {
              // up
              let checkNumber = getCurrentCheckNumber();

              if (!isNaN(checkNumber)) {
                scope.checkNumber = ++checkNumber;
              }

              e.preventDefault();

              $rootScope.$apply();
            } else if (e.which === 40) {
              // down
              let checkNumber = getCurrentCheckNumber();

              if (!isNaN(checkNumber)) {
                scope.checkNumber = --checkNumber;
              }

              e.preventDefault();

              $rootScope.$apply();
            }
          });

          function getCurrentCheckNumber() {
            const thisCheckNumber = +scope.checkNumber;

            if (scope.checkNumber != null && !isNaN(thisCheckNumber)) {
              return thisCheckNumber;
            }

            let foundCheckNumber = 0;

            if (scope.transactions) {
              scope.transactions.forEach((transaction) => {
                const checkNumber = +transaction.checkNumber;

                if (!isNaN(checkNumber) && checkNumber > foundCheckNumber) {
                  foundCheckNumber = checkNumber;
                }
              });
            }

            return foundCheckNumber;
          }
        },
      };
    },
  };
});
