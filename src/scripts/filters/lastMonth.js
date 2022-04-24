import moment from "moment";

// We store currency as int -- $1.50 = 150
// Divide by 100

angular.module("financier").filter("lastMonth", () => {
  return (date) => {
    return moment(date).subtract(1, "month").toDate();
  };
});
