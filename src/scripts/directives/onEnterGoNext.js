angular.module("financier").directive("onEnterGoNext", () => {
  function link(scope, element, attrs) {
    element.on("keydown", (e) => {
      const els = document.querySelectorAll(`[tabindex='${attrs.tabindex}']`);

      if (e.which === 13 || e.which === 40) {
        // enter key, down key
        e.preventDefault();

        for (let i = 0; i < els.length; i++) {
          if (els[i] === element[0]) {
            return findNext(els, i, i);
          }
        }
      } else if (e.which === 38) {
        // up key
        e.preventDefault();

        for (let i = 0; i < els.length; i++) {
          if (els[i] === element[0]) {
            return findPrevious(els, i, i);
          }
        }
      }
    });

    function findNext(els, originalI, nextI) {
      const newI = (nextI + 1) % els.length;

      if (originalI === newI) {
        els[originalI].blur();

        return;
      }

      if (isVisible(els[newI])) {
        choose(els[newI]);
      } else {
        findNext(els, originalI, newI);
      }
    }

    function findPrevious(els, originalI, nextI) {
      const newI = nextI - 1 < 0 ? els.length - 1 : nextI - 1;

      if (originalI === newI) {
        els[originalI].blur();

        return;
      }

      if (isVisible(els[newI])) {
        choose(els[newI]);
      } else {
        findPrevious(els, originalI, newI);
      }
    }

    function isVisible(el) {
      /* offsetParent would be null if display 'none' is set.
       However Chrome, IE and MS Edge returns offsetParent as null for elements
       with CSS position 'fixed'. So check whether the dimensions are zero.

       This check would be inaccurate if position is 'fixed' AND dimensions were
       intentionally set to zero. But..it is good enough for most cases.*/
      if (!el.offsetParent && el.offsetWidth === 0 && el.offsetHeight === 0) {
        return false;
      }
      return true;
    }

    function choose(el) {
      el.focus();
      el.select();
    }
  }

  return {
    restrict: "A",
    link,
  };
});
