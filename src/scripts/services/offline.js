angular.module("financier").factory("offline", ($rootScope) => {
  // Hack to avoid running jest unit test clutter
  if (typeof jest !== "undefined")
    return { install: () => {}, applyUpdate: () => {} };

  const runtime = require("@lcdp/offline-plugin/runtime");

  function install() {
    runtime.install({
      onInstalled: () => {
        $rootScope.$broadcast("offlineStatus", "refresh");
      },
      onUpdateFailed: () => {
        $rootScope.$broadcast("serviceWorker", "error");
      },
      onUpdateReady: () => {
        $rootScope.$broadcast("serviceWorker:updateReady");
      },
      onUpdated: () => {
        $rootScope.$broadcast("serviceWorker:updated");
      },
    });
  }

  return {
    install,
    applyUpdate: runtime.applyUpdate,
  };
});
