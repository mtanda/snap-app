'use strict';

System.register(['./config.html!text'], function (_export, _context) {
  var configTemplate, SnapConfigCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_configHtmlText) {
      configTemplate = _configHtmlText.default;
    }],
    execute: function () {
      _export('ConfigCtrl', SnapConfigCtrl = function SnapConfigCtrl() {
        _classCallCheck(this, SnapConfigCtrl);
      });

      SnapConfigCtrl.template = configTemplate;

      _export('ConfigCtrl', SnapConfigCtrl);
    }
  };
});
//# sourceMappingURL=config.js.map
