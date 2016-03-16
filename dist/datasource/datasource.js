'use strict';

System.register(['vendor/npm/rxjs/Observable'], function (_export, _context) {
  var Observable, _createClass, SnapDatasource;

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
            var target = options.targets[0];
            if (!target || !target.task || !target.task.id) {
              return this.emptyResult();
            }

            var task = target.task;

            if (this.observable) {
              if (task.id !== this.lastWatchId) {
                this.subscription.unsubscribe();
                this.subscription = null;
                this.observable = null;
              } else {
                return this.emptyResult();
              }
            }

            var watchUrl = this.url + '/v1/tasks/' + task.id + '/watch';
            this.observable = Observable.create(function (observer) {

              var source = new EventSource(watchUrl);
              source.onmessage = function (evt) {
                console.log('event message', evt);
              };
              source.onopen = function (evt) {
                console.log('open stream', evt);
              };
              source.onerror = function (evt) {
                console.log('event error', evt);
              };

              return function () {
                console.log('closing event stream');
                source.close();
              };
            });

            this.subscription = this.observable.subscribe(function (data) {
              console.log('snap data', data);
            });

            return Promise.resolve({ data: [] });
          }
        }]);

        return SnapDatasource;
      }());

      _export('SnapDatasource', SnapDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
