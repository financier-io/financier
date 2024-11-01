// http://stackoverflow.com/a/12791228

angular.module("financier").directive("scrollIntoViewIf", () => {
  const SCROLL_SPEED = 100; // ms

  return {
    restrict: "A",
    scope: false,
    require: "^scrollContainer",
    link: (scope, element, attributes, scrollContainerCtrl) => {
      const container = scrollContainerCtrl.element;

      scope.$watch(
        () => {
          return scope.$eval(attributes.scrollIntoViewIf);
        },
        (val) => {
          if (val) {
            // Timeout to scroll into view the first time it's loaded
            setTimeout(takeIntoView);
          }
        },
      );

      function takeIntoView() {
        // Cancel existing scroll animation
        scrollContainerCtrl.scroller && scrollContainerCtrl.scroller.cancel();

        if (element[0].offsetTop < container.scrollTop) {
          // Out of view above (needs to scroll up)
          scrollContainerCtrl.scroller = scrollTo(
            container,
            element[0].offsetTop,
            SCROLL_SPEED,
          );
        } else if (
          element[0].offsetTop + element[0].offsetHeight >
          container.scrollTop + container.offsetHeight
        ) {
          // Out of view below (needs to scroll down)
          scrollContainerCtrl.scroller = scrollTo(
            container,
            element[0].offsetTop +
              element[0].offsetHeight -
              container.offsetHeight,
            SCROLL_SPEED,
          );
        }
      }
    },
  };
});

// helper functions from:
// https://stackoverflow.com/questions/8917921/cross-browser-javascript-not-jquery-scroll-to-top-animation

function scrollTo(element, to, duration) {
  var start = element.scrollTop,
    change = to - start,
    currentTime = 0,
    increment = 20,
    cancelled = false;

  const animateScroll = () => {
    if (cancelled) {
      return;
    }

    currentTime += increment;
    var val = easeInOutQuad(currentTime, start, change, duration);
    element.scrollTop = val;
    if (currentTime < duration) {
      setTimeout(animateScroll, increment);
    }
  };
  animateScroll();

  return {
    cancel() {
      cancelled = true;
    },
  };
}

//t = current time
//b = start value
//c = change in value
//d = duration
function easeInOutQuad(t, b, c, d) {
  t /= d / 2;
  if (t < 1) {
    return (c / 2) * t * t + b;
  }
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
}
