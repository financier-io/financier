angular.module('financier').directive('resizeCategories', () => {
  const sheet = (function () {
    // Create the <style> tag
    const style = document.createElement('style');

    // Add a media (and/or media query) here if you'd like!
    // style.setAttribute("media", "screen")
    // style.setAttribute("media", "only screen and (max-width : 1024px)")

    // WebKit hack :(
    style.appendChild(document.createTextNode(''));

    // Add the <style> element to the page
    document.head.appendChild(style);

    return style.sheet;
  })();

  let currentSize = +localStorage.budgetCategoryWidth;

  function setSize(x) {
    if (currentSize !== x) {
      localStorage.budgetCategoryWidth = x;
    }

    if (sheet.cssRules.length) {
      sheet.deleteRule(0);
    }
    sheet.insertRule(`.budget__category-label { flex-basis: ${x}px; }`, 0);
  }

  if (angular.isDefined(currentSize)) {
    setSize(currentSize);
  }

  return {
    restrict: 'A',
    link: (scope, element) => {
      const handle = angular.element('<div class="budget__category-resize-handle"></div>');

      handle.on('mousedown', evt => {
        evt.stopPropagation();
        evt.preventDefault();

        const body = angular.element(document.body);

        body.on('mousemove', evt => {
          const pageOffset = element[0].getBoundingClientRect();

          // +10 for CSS box-sizing: content-box; w/ padding. TODO
          var x = evt.pageX - pageOffset.left - 10;

          setSize(x);
         });

        body.one('mouseup', () => {
          body.off('mousemove');
        });
      });

      element.append(handle);
    }
  };
});
