angular.module('financier').factory('offline', $rootScope => {
  function register() {
    require('offline-plugin/runtime').install({
      onInstalled: () => {
        $rootScope.$broadcast('offlineStatus', 'refresh');
      },
      onUpdateFailed: () => {
        $rootScope.$broadcast('serviceWorker', 'error');
      }
    });
  }

  return {
    register
  };

});
