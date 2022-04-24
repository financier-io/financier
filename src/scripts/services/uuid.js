import { v4 as uuidv4 } from "uuid";

// por que no?

angular.module("financier").factory("uuid", function () {
  return uuidv4;
});
