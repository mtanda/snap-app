
import {Observable} from 'vendor/npm/rxjs/Observable';

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
    this.observable = Observable.create(observer => {

      var source = new EventSource(watchUrl);
      source.onmessage = function(evt) {
        console.log('event message', evt);
      };
      source.onopen = function(evt) {
        console.log('open stream', evt);
      };
      source.onerror = function(evt) {
        console.log('event error', evt);
      };

      return () => {
        console.log('closing event stream');
        source.close();
      };
    });

    this.subscription = this.observable.subscribe(data => {
      console.log('snap data', data);
    });

    return Promise.resolve({data: []});
  }

}

export {SnapDatasource};
