'use strict';

System.register(['./datasource', './config', './query_editor'], function (_export, _context) {
  var SnapDatasource, ConfigCtrl, SnapQueryCtrl;
  return {
    setters: [function (_datasource) {
      SnapDatasource = _datasource.SnapDatasource;
    }, function (_config) {
      ConfigCtrl = _config.ConfigCtrl;
    }, function (_query_editor) {
      SnapQueryCtrl = _query_editor.SnapQueryCtrl;
    }],
    execute: function () {
      _export('Datasource', SnapDatasource);

      _export('ConfigCtrl', ConfigCtrl);

      _export('QueryCtrl', SnapQueryCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
