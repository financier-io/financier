angular.module('financier').directive('note', ($sce, $templateRequest, $templateCache, $compile) => {

  function link(scope, element, attrs) {
    scope.myNote = scope.note;

    const templateUrl = $sce.getTrustedResourceUrl('/scripts/directives/note.html');

    $templateRequest(templateUrl).then(template => {
      var content = $compile(template)(scope);

      content.on('keypress keydown', e => {
        if (e.which === 27) {
          dropInstance.close();
        }
      });

      const dropInstance = new Drop({
        target: element[0],
        content: content[0],
        classes: 'drop-theme-arrows-bounce',
        openOn: 'click',
        tetherOptions: {
          targetOffset: '0 -19px'
        }
      });

      dropInstance.on('open', () => {
        content.find('textarea')[0].focus();
      });

      dropInstance.on('close', () => {
        scope.myNote = scope.note;
      });

      scope.submit = note => {
        scope.note = note;

        dropInstance.close();
      };

      scope.$on('$destroy', () => {
        dropInstance.destroy();
      });
    });
  }

  return {
    restrict: 'A',
    link,
    scope: {
      note: '='
    }
  };
});
