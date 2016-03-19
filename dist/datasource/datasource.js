'use strict';

System.register(['moment', './stream_handler'], function (_export, _context) {
  var moment, StreamHandler, _createClass, SnapDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_moment) {
      moment = _moment.default;
    }, function (_stream_handler) {
      StreamHandler = _stream_handler.StreamHandler;
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
          this.streamHandlers = {};
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
          key: 'getTask',
          value: function getTask(taskId) {
            return this.request({ method: 'get', url: '/v1/tasks/' + taskId }).then(function (res) {
              return res.data.body;
            }).catch(function (err) {
              if (err.status === 404) {
                return null;
              } else {
                throw err;
              }
            });
          }
        }, {
          key: 'createTask',
          value: function createTask(target) {
            if (target.metrics.length === 0) {
              return Promise.reject("No metrics selected for task");
            }

            var task = {
              version: 1,
              name: target.taskName,
              schedule: {
                type: 'simple',
                interval: '200ms'
              },
              workflow: {
                collect: {}
              },
              publish: []
            };

            task.workflow.collect.metrics = target.metrics.reduce(function (memo, metric) {
              memo[metric.namespace] = {};
              return memo;
            }, {});

            console.log('creating task', task);
            return this.request({ method: 'post', url: '/v1/tasks', data: task }).then(function (res) {
              console.log('created task', res);
              return res.data.body;
            });
          }
        }, {
          key: 'query',
          value: function query(options) {
            var handler = this.streamHandlers[options.panelId];
            if (handler) {
              return Promise.resolve(handler);
            }

            this.streamHandlers[options.panelId] = handler = new StreamHandler(options, this);
            handler.start();

            return Promise.resolve(handler);

            // if (this.runningQuery) {
            //   return this.runningQuery;
            // }
            //
            // var target = options.targets[0];
            // this.runningQuery = this.getTaskId(target).then(taskId => {
            //
            //   if (!taskId) {
            //     return this.emptyResult();
            //   }
            //
            //   var watchUrl = this.url + '/v1/tasks/' + taskId + '/watch';
            //   this.observable = Observable.create(observer => {
            //
            //     var handler = new StreamHandler();
            //     handler.start(observer, watchUrl);
            //
            //     return () => {
            //       handler.close();
            //       this.observable = null;
            //     };
            //   });
            //
            //   return this.observable;
            // }).finally(() => {
            //   this.runningQuery = null;
            // });
            //
            // return this.runningQuery;
          }
        }, {
          key: 'getMetrics',
          value: function getMetrics() {
            var _this = this;

            if (this.metricsCache) {
              return Promise.resolve(this.metricsCache);
            }

            return this.request({ method: 'get', url: '/v1/metrics' }).then(function (res) {
              if (!res.data || !res.data.body || !res.data.body) {
                return [];
              }

              _this.metricsCache = res.data.body.map(function (value) {
                return { text: value.namespace, value: value.namespace };
              });

              return _this.metricsCache;
            });
          }
        }, {
          key: 'deleteTask',
          value: function deleteTask(taskId) {
            return this.request({ method: 'delete', url: '/v1/tasks/' + taskId });
          }
        }, {
          key: 'startTask',
          value: function startTask(taskId) {
            return this.request({ method: 'put', url: '/v1/tasks/' + taskId + '/start' });
          }
        }, {
          key: 'stopTask',
          value: function stopTask(taskId) {
            return this.request({ method: 'put', url: '/v1/tasks/' + taskId + '/stop' });
          }
        }]);

        return SnapDatasource;
      }());

      _export('SnapDatasource', SnapDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
