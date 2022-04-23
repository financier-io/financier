angular.module("financier").filter("removeDots", () => {
  return (str) => str.replace(/\./g, "");
});
