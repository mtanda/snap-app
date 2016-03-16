'use strict';

System.register(['vendor/npm/rxjs/Observable'], function (_export, _context) {
  var Observable, _createClass, StreamHandler, SnapDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_vendorNpmRxjsObservable) {
      Observable = _vendorNpmRxjsObservable.Observable;
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

      StreamHandler = function () {
        function StreamHandler() {
          _classCallCheck(this, StreamHandler);
        }

        _createClass(StreamHandler, [{
          key: 'start',
          value: function start(observer, url) {
            this.observer = observer;

            console.log('StreamHandler: start: ' + url);
            this.source = new EventSource(url);
            this.source.onmessage = this.onMessage.bind(this);
            this.source.onerror = this.onError.bind(this);
            this.source.onopen = this.onOpen.bind(this);
            this.source.onclose = this.onClose.bind(this);
            this.metrics = [];
          }
        }, {
          key: 'onMessage',
          value: function onMessage(evt) {
            var data = JSON.parse(evt.data);
            if (data.type === 'metric-event') {
              this.processMetricEvent(data);
            }
          }
        }, {
          key: 'onError',
          value: function onError(evt) {
            console.log('stream error', evt);
          }
        }, {
          key: 'onClose',
          value: function onClose(evt) {
            console.log('stream closed', evt);
          }
        }, {
          key: 'onOpen',
          value: function onOpen(evt) {
            console.log('stream opened', evt);
          }
        }, {
          key: 'close',
          value: function close() {
            console.log('Forcing event stream close');
            this.source.close();
          }
        }, {
          key: 'processMetricEvent',
          value: function processMetricEvent(event) {
            console.log(event);
          }
        }]);

        return StreamHandler;
      }();

      _export('SnapDatasource', SnapDatasource = function () {
        function SnapDatasource(instanceSettings, $http, backendSrv) {
          _classCallCheck(this, SnapDatasource);

          this.instanceSettings = instanceSettings;
          this.url = instanceSettings.url;
          this.$http = $http;
          this.backendSrv = backendSrv;
        }

        _createClass(SnapDatasource, [{
          key: 'request',
          value: function request(options) {
            options.url = this.url + options.url;
            return this.backendSrv.datasourceRequest(options);
          }
        }, {
          key: 'getTasks',
          value: function getTasks() {
            return this.request({ method: 'get', url: '/v1/tasks' }).then(function (res) {
              if (!res.data || !res.data.body || !res.data.body.ScheduledTasks) {
                return [];
              }

              return res.data.body.ScheduledTasks;
            });
          }
        }, {
          key: 'emptyResult',
          value: function emptyResult() {
            return Promise.resolve({ data: [] });
          }
        }, {
          key: 'query',
          value: function query(options) {
            var _this = this;

            var target = options.targets[0];
            if (!target || !target.task || !target.task.id) {
              return this.emptyResult();
            }

            if (this.observable) {
              return this.emptyResult();
            }

            var task = target.task;

            var watchUrl = this.url + '/v1/tasks/' + task.id + '/watch';
            this.observable = Observable.create(function (observer) {

              var handler = new StreamHandler();
              handler.start(observer, watchUrl);

              return function () {
                handler.close();
                _this.observable = null;
              };
            });

            return Promise.resolve(this.observable);
          }
        }]);

        return SnapDatasource;
      }());

      _export('SnapDatasource', SnapDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
