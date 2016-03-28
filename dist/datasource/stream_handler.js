'use strict';

System.register(['moment', 'vendor/npm/rxjs/Subject'], function (_export, _context) {
  var moment, Subject, _createClass, StreamHandler;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_moment) {
      moment = _moment.default;
    }, function (_vendorNpmRxjsSubject) {
      Subject = _vendorNpmRxjsSubject.Subject;
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

      _export('StreamHandler', StreamHandler = function () {
        function StreamHandler(options, datasource) {
          _classCallCheck(this, StreamHandler);

          this.options = options;
          this.ds = datasource;
          this.subject = new Subject();
        }

        _createClass(StreamHandler, [{
          key: 'start',
          value: function start() {
            var _this = this;

            if (this.source) {
              this.source.close();
            }

            var target = this.options.targets[0];
            if (!target.taskId) {
              return;
            }

            this.ds.getTask(target.taskId).then(function (task) {
              if (!task) {
                return;
              }

              console.log('StreamHandler: start()', task);

              _this.task = task;
              var watchUrl = _this.ds.url + '/v1/tasks/' + task.id + '/watch';
              _this.source = new EventSource(watchUrl);
              _this.source.onmessage = _this.onMessage.bind(_this);
              _this.source.onerror = _this.onError.bind(_this);
              _this.source.onopen = _this.onOpen.bind(_this);
              _this.source.onclose = _this.onClose.bind(_this);
              _this.metrics = {};
            });
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
          key: 'stop',
          value: function stop() {
            console.log('Forcing event stream close');
            if (this.source) {
              this.source.close();
            }
            this.source = null;
          }
        }, {
          key: 'subscribe',
          value: function subscribe(options) {
            return this.subject.subscribe(options);
          }
        }, {
          key: 'processMetricEvent',
          value: function processMetricEvent(data) {
            var endTime = new Date().getTime();
            var startTime = endTime - 60 * 5 * 1000;
            var seriesList = [];

            for (var i = 0; i < data.event.length; i++) {
              var point = data.event[i];
              var series = this.metrics[point.namespace];
              if (!series) {
                series = { target: point.namespace, datapoints: [] };
                this.metrics[point.namespace] = series;
              }

              var time = new Date(point.timestamp).getTime();
              series.datapoints.push([point.data, time]);
              seriesList.push(series);
            }

            this.subject.next({
              data: seriesList,
              range: { from: moment(startTime), to: moment(endTime) }
            });
          }
        }]);

        return StreamHandler;
      }());

      _export('StreamHandler', StreamHandler);
    }
  };
});
//# sourceMappingURL=stream_handler.js.map
