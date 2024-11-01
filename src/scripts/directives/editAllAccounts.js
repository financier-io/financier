import Drop from "tether-drop";
import editAllAccountsHtml from "./editAllAccounts.html?raw";

angular
  .module("financier")
  .directive("editAllAccounts", ($compile, $timeout, $rootScope) => {
    return {
      restrict: "A",
      bindToController: {
        editAllAccounts: "=",
      },
      controllerAs: "editAllAccountsCtrl",
      controller: function ($scope, $element) {
        $element.on("contextmenu", (e) => {
          e.preventDefault();

          $rootScope.$broadcast("account:deselectTransactions");
          $rootScope.$broadcast("drop:close");

          const template = editAllAccountsHtml;

          const wrap = angular.element("<div></div>").append(template);
          const content = $compile(wrap)($scope);

          content.on("keypress keydown", (e) => {
            if (e.which === 27) {
              dropInstance.close();
            }
          });

          const dropInstance = new Drop({
            target: $element[0],
            content: content[0],
            classes: "drop-theme-arrows-bounce edit-account__positioner",
            position: "left top",
            openOn: "click",
          });

          dropInstance.on("open", () => {
            this.checkNumber = this.editAllAccounts.checkNumber;

            content.find("input")[0].focus();
          });

          dropInstance.on("close", () => {
            $timeout(() => {
              dropInstance.destroy();
            });
          });

          $scope.$on("drop:close", () => {
            dropInstance.close();
          });

          $scope.remove = () => {
            dropInstance.close();
            $scope.onRemove();
          };

          this.submit = () => {
            this.editAllAccounts.checkNumber = this.checkNumber;

            dropInstance.close();
          };

          dropInstance.open();
        });
      },
    };
  });
