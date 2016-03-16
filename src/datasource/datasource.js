
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
    this.metrics = [];
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

  processMetricEvent(event) {
    console.log(event);
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
}

export {SnapDatasource};
