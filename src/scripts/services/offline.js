angular.module('financier').factory('offline', $rootScope => {
  function install() {
    if ('serviceWorker' in navigator) {
      $rootScope.$broadcast('serviceWorker', 'installing');

      // Your service-worker.js *must* be located at the top-level directory relative to your site.
      // It won't be able to control pages unless it's located at the same level or higher than them.
      // *Don't* register service worker file in, e.g., a scripts/ sub-directory!
      // See https://github.com/slightlyoff/ServiceWorker/issues/468
      navigator.serviceWorker.register('service-worker.js').then(function(reg) {

        $rootScope.$broadcast('serviceWorker', 'installed');

        // updatefound is fired if service-worker.js changes.
        reg.onupdatefound = function() {

          // The updatefound event implies that reg.installing is set; see
          // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
          var installingWorker = reg.installing;

          installingWorker.onstatechange = function() {
            switch (installingWorker.state) {
              case 'installed':
                if (navigator.serviceWorker.controller) {
                  // At this point, the old content will have been purged and the fresh content will
                  // have been added to the cache.
                  // It's the perfect time to display a "New content is available; please refresh."
                  // message in the page's interface.
                  $rootScope.$broadcast('serviceWorker', 'refresh');
                  console.log('New or updated content is available.');
                } else {
                  // At this point, everything has been precached.
                  // It's the perfect time to display a "Content is cached for offline use." message.
                  console.log('Content is now available offline!');
                }
                break;

              case 'redundant':
                $rootScope.$broadcast('serviceWorker', 'error');
                console.error('The installing service worker became redundant.');
                break;
            }
          };
        };
      }).catch(function(e) {
        console.error('Error during service worker registration:', e);

        $rootScope.$broadcast('serviceWorker', 'error', e);
      });
    } else {
      $rootScope.$broadcast('serviceWorker', 'unsupported');
    }
  }

  return {
    install
  };

});
