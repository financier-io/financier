import Drop from 'tether-drop';

angular.module('financier').factory('inputDropSetup', ($rootScope, $document, $sce, $compile, $timeout) => {
  return (scope, input, template, onClosed) => {
    let dropInstance,
      accountSuggestClicked = false;

    let showDrop;

    const handleDocumentClick = e => {
      if (!accountSuggestClicked) {
        $document.off('mousedown', handleDocumentClick);
        dropInstance.close();
      }
      accountSuggestClicked = false;

    };


    const wrap = angular.element('<div></div>').append(template);
    const content = $compile(wrap)(scope);


    input.on('focus', () => {
      $rootScope.$broadcast('drop:close');

      showDrop();
    });

    showDrop = function() {
      accountSuggestClicked = false;

      if (!dropInstance) {
        dropInstance = new Drop({
          target: input[0],
          content: content[0],
          classes: 'drop-theme-arrows-bounce drop--wide',
          openOn: null,
          position: 'bottom center',
          constrainToWindow: true,
          constrainToScrollParent: false,
            tetherOptions: {
              constraints: [{
                to: 'scrollParent'
              }, {
                to: 'window',
                attachment: 'together',
                pin: true
              }]
            }
        });

        dropInstance.on('close', () => {
          // Wait for the animation to complete
          $timeout(() => {
            onClosed && onClosed();
          }, 250);
        });
      }

      input[0].select();

      // Remove previous event handler, if exists, to prevent binding multiple
      $document.off('mousedown', handleDocumentClick);
      $document.on('mousedown', handleDocumentClick);
      dropInstance.open();
    };

    // Close on window mousedown except when the popup is clicked
    content.on('mousedown', e => {
      accountSuggestClicked = true;
    });

    content.on('click', e => {
      e.stopPropagation();
    });

    input.on('mousedown', e => {
      accountSuggestClicked = true;
    });

    return {
      destroy() {
        $document.off('mousedown', handleDocumentClick);
        dropInstance && dropInstance.destroy();
      },
      focus() {
        input[0].focus();
        showDrop();
      },
      close() {
        $document.off('mousedown', handleDocumentClick);
        dropInstance.close();
      },
      position() {
        dropInstance && dropInstance.position();
      }
    };
    
  };
});
