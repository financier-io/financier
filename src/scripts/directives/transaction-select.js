angular.module('financier').directive('transactionSelect', function () {
    return {
        require: '^stTable',
        template: '<input type="checkbox"/>',
        scope: {
            transaction: '=transactionSelect'
        },
        link: function (scope, element, attr, ctrl) {

            element.bind('change', function () {
                scope.$apply(function () {
                    ctrl.select(scope.transaction, 'multiple');
                });
            });

            scope.$watch('transaction.isSelected', function (newValue) {
                if (newValue === true) {
                    element.parent().addClass('st-selected');
                } else {
                    element.parent().removeClass('st-selected');
                }
            });
        }
    };
});
