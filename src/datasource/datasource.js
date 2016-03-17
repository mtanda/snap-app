
import moment from 'moment';
import {Observable} from 'vendor/npm/rxjs/Observable';

class StreamHandler {

  start(observer, url) {
    this.observer = observer;

    console.log('StreamHandler: start: ' + url);
    this.source = new EventSource(url);
    this.source.onmessage = this.onMessage.bind(this);
    this.source.onerror = this.onError.bind(this);
    this.source.onopen = this.onOpen.bind(this);
    this.source.onclose = this.onClose.bind(this);
    this.metrics = {};
  }

  onMessage(evt) {
    var data = JSON.parse(evt.data);
    if (data.type === 'metric-event') {
      this.processMetricEvent(data);
    }
  }

  onError(evt) {
    console.log('stream error', evt);
  }

  onClose(evt) {
    console.log('stream closed', evt);
  }

  onOpen(evt) {
    console.log('stream opened', evt);
  }

  close() {
    console.log('Forcing event stream close');
    this.source.close();
  }

  processMetricEvent(data) {
    var endTime = new Date().getTime();
    var startTime = endTime - (60 * 5 *1000)

    for (var i = 0; i < data.event.length; i++) {
      var point = data.event[i];
      var series = this.metrics[point.namespace];
      if (!series) {
        series = {target: point.namespace, datapoints: []};
        this.metrics[point.namespace] = series;
      }

      var time = new Date(point.timestamp).getTime();
      series.datapoints.push([point.data, time]);
    }

    this.observer.next({
      data: this.metrics,
      range: {from: moment(startTime), to: moment(endTime)}
    });
  }
}

class SnapDatasource {

  constructor(instanceSettings, $http, backendSrv)  {
    this.instanceSettings = instanceSettings;
    this.url = instanceSettings.url;
    this.$http = $http;
    this.backendSrv = backendSrv;
  }

  request(options) {
    options.url = this.url + options.url;
    return this.backendSrv.datasourceRequest(options);
  }

  getTasks() {
    return this.request({method: 'get', url: '/v1/tasks'}).then(res => {
      if (!res.data || !res.data.body || !res.data.body.ScheduledTasks) {
        return [];
      }

      return res.data.body.ScheduledTasks;
    });
  }

  emptyResult() {
    return Promise.resolve({data: []});
  }

  query(options) {
    var target = options.targets[0];
    if (!target || !target.task || !target.task.id) {
      return this.emptyResult();
    }

    if (this.observable) {
      return this.emptyResult();
    }

    var task = target.task;

    var watchUrl = this.url + '/v1/tasks/' + task.id + '/watch';
    this.observable = Observable.create(observer => {

      var handler = new StreamHandler();
      handler.start(observer, watchUrl);

      return () => {
        handler.close();
        this.observable = null;
      };
    });

    return Promise.resolve(this.observable);
  }

  getMetrics() {
    if (this.metricsCache) {
      return Promise.resolve(this.metricsCache);
    }

    return this.request({method: 'get', url: '/v1/metrics'}).then(res => {
      if (!res.data || !res.data.body || !res.data.body) {
        return [];
      }

      this.metricsCache = res.data.body.map(value => {
        return {text: value.namespace, value: value.namespace};
      });

      return this.metricsCache;
    });
  }
}

export {SnapDatasource};
