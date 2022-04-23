// Lazy loading of Stripe.js

angular.module("financier").factory("stripeLazyLoader", ($q) => {
  var deferred = $q.defer();

  // Load Google map API script
  function loadScript() {
    // Use global document since Angular's $document is weak
    var script = document.createElement("script");
    script.src = "https://js.stripe.com/v2/";
    script.onload = () => {
      deferred.resolve();
    };

    document.body.appendChild(script);
  }

  loadScript();

  return deferred.promise;
});
