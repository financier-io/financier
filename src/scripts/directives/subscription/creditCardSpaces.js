angular.module("financier").directive("creditCardSpaces", () => {
  return {
    restrict: "A",
    scope: {
      creditCardSpaces: "=",
      cardChanged: "=",
    },
    link: (scope, element) => {
      element.on("input", function () {
        scope.cardChanged = true;

        var newValue = this.value.split(" ").join("");

        if (newValue.length > 0) {
          newValue = newValue.match(new RegExp(".{1,4}", "g")).join(" ");
        }

        this.value = newValue;

        scope.creditCardSpaces = this.value;
      });

      element.on("blur", () => {
        scope.cardChanged = true;
      });
    },
  };
});
