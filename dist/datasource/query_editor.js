'use strict';

System.register(['app/plugins/sdk'], function (_export, _context) {
  var QueryCtrl, _createClass, SnapQueryCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      QueryCtrl = _appPluginsSdk.QueryCtrl;
    }],
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

      _export('SnapQueryCtrl', SnapQueryCtrl = function (_QueryCtrl) {
        _inherits(SnapQueryCtrl, _QueryCtrl);

        function SnapQueryCtrl($scope, $injector, uiSegmentSrv) {
          _classCallCheck(this, SnapQueryCtrl);

          var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SnapQueryCtrl).call(this, $scope, $injector));

          _this.uiSegmentSrv = uiSegmentSrv;
          _this.target.task = _this.target.task || { name: 'select task', id: '' };
          _this.taskSegment = uiSegmentSrv.newSegment({
            value: _this.target.task.name
          });

          if (_this.target.task.name === 'select task') {
            _this.taskSegment.fake = true;
          }
          return _this;
        }

        _createClass(SnapQueryCtrl, [{
          key: 'getTasks',
          value: function getTasks() {
            var _this2 = this;

            return this.datasource.getTasks().then(function (tasks) {
              _this2.taskMap = {};

              return tasks.map(function (task) {
                _this2.taskMap[task.name] = task;

                return _this2.uiSegmentSrv.newSegment({ value: task.name });
              });
            });
          }
        }, {
          key: 'taskChanged',
          value: function taskChanged() {
            var task = this.taskMap[this.taskSegment.value];
            this.target.task.name = task.name;
            this.target.task.id = task.id;
            this.panelCtrl.refresh();
          }
        }]);

        return SnapQueryCtrl;
      }(QueryCtrl));

      SnapQueryCtrl.templateUrl = 'datasource/query_editor.html';

      _export('SnapQueryCtrl', SnapQueryCtrl);
    }
  };
});
//# sourceMappingURL=query_editor.js.map
