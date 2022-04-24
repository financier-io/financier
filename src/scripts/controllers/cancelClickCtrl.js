// Super hacky controller to ensure clicking modals does not close stuff

angular.module("financier").controller("cancelClickCtrl", ($element) => {
  $element.on("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  $element.find("button").on("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});
