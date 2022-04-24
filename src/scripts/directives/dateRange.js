import Drop from "tether-drop";
import moment from "moment";

angular
  .module("financier")
  .directive("dateRange", ($filter, $compile, $timeout) => {
    const dateFilter = $filter("date");

    return {
      restrict: "E",
      template: `<div ng-if="all">All dates</div>
               <div ng-if="!all">{{start}} - {{end}}</div>`,
      scope: {
        startDate: "=",
        endDate: "=",
      },
      link: (scope, element) => {
        scope.$watch("startDate", (startDate) => {
          scope.all = !isFinite(startDate);
          scope.start = dateFilter(startDate, "MMM yy");
        });
        scope.$watch("endDate", (endDate) => {
          scope.all = !isFinite(endDate);
          scope.end = dateFilter(endDate, "MMM yy");
        });

        scope.select = {
          everything() {
            scope.startDate = -Infinity;
            scope.endDate = Infinity;
          },
          last12() {
            scope.startDate = moment()
              .subtract(1, "year")
              .endOf("month")
              .toDate();
            scope.endDate = new Date();
          },
          last3() {
            scope.startDate = moment()
              .subtract(3, "months")
              .endOf("month")
              .toDate();
            scope.endDate = new Date();
          },
          thisYear() {
            scope.startDate = moment().startOf("year").toDate();
            scope.endDate = new Date();
          },
          lastYear() {
            scope.startDate = moment()
              .subtract(1, "year")
              .startOf("year")
              .toDate();
            scope.endDate = moment().subtract(1, "year").endOf("year").toDate();
          },
        };

        element.on("click", () => {
          const template = require("./dateRange.html").default;

          const wrap = angular.element("<div></div>").append(template);
          const content = $compile(wrap)(scope);

          content.on("keypress keydown", (e) => {
            if (e.which === 27) {
              dropInstance.close();
            } else if (e.which === 13 && (e.ctrlKey || e.metaKey)) {
              scope.submit();

              dropInstance.close();
            }
          });

          const dropInstance = new Drop({
            target: element[0],
            content: content[0],
            classes: "drop-theme-arrows-bounce",
            openOn: "click",
            tetherOptions: {
              targetOffset: "0 -19px",
              optimizations: {
                moveElement: true,
              },
            },
          });

          dropInstance.on("open", () => {
            // scope.myNote = ngModelCtrl.$viewValue;
            // scope.canDelete = ngModelCtrl.$viewValue &&
            //                   ngModelCtrl.$viewValue.length;

            content.find("textarea")[0].focus();
          });

          dropInstance.on("close", () => {
            // scope.myNote = ngModelCtrl.$viewValue;

            $timeout(() => {
              dropInstance.destroy();
            });
          });

          scope.$on("drop:close", () => {
            dropInstance.close();
          });

          scope.submit = () => {
            // ngModelCtrl.$setViewValue(note);

            dropInstance.close();
          };

          dropInstance.open();
        });
      },
    };
  });
