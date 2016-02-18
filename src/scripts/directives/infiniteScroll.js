angular.module('financier').directive('infiniteScroll', () => {
    return {
        link: (scope, element, attrs) => {
            element.on('scroll', () => {
                if (element[0].scrollTop + element[0].clientHeight === element[0].scrollHeight) {
                    scope.$eval(attrs.infiniteScroll);
                    scope.$apply();
                }
            });
        }
    };
});
