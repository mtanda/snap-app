"use strict";

System.register([], function (_export, _context) {
  var _createClass, SnapDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export("SnapDatasource", SnapDatasource = function () {
        function SnapDatasource(instanceSettings, backendSrv, $q) {
          _classCallCheck(this, SnapDatasource);

          this.instanceSettings = instanceSettings;
          this.backendSrv = backendSrv;
          this.$q = $q;
        }

        _createClass(SnapDatasource, [{
          key: "query",
          value: function query(options) {}
        }]);

        return SnapDatasource;
      }());

      _export("SnapDatasource", SnapDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
