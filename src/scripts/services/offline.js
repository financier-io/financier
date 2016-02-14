angular.module('financier').factory('offline', $q => {
  if ('serviceWorker' in navigator) {
    return $q.when(navigator.serviceWorker.register('/service-worker.js'));
  }
  return null;

});
