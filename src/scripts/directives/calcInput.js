angular.module('financier').directive('calcInput', () => {
  return function (scope, element) {
    element.bind('keypress', event => {
      const charCode = event.which || event.keyCode;
      const charTyped = String.fromCharCode(charCode);

      if (charTyped === '+' || charTyped === '-' || charTyped === '*' || charTyped === '/') {
        const input = element;
        const length = input[0].value.length;

        if (input[0].selectionEnd === length) {
          input[0].focus();
          input[0].setSelectionRange(length, length);
        }
      }
    });
  };
});
