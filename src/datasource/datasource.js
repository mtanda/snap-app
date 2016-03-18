
import moment from 'moment';
import {StreamHandler} from './stream_handler';

export class SnapDatasource {

  constructor(instanceSettings, $http, backendSrv)  {
    this.instanceSettings = instanceSettings;
    this.url = instanceSettings.url;
    this.$http = $http;
    this.backendSrv = backendSrv;
    this.streamHandlers = {};
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

  getTask(taskId) {
    return this.request({method: 'get', url: '/v1/tasks/' + taskId}).then(res => {
      return res.data.body;
    }).catch(err => {
      if (err.status === 404) {
        return null;
      } else {
        throw err;
      }
    });
  }

  createTask(target) {
    if (target.metrics.length === 0) {
      return Promise.reject("No metrics selected for task");
    }

    var task = {
      version: 1,
      name: target.taskName,
      schedule: {
        type: 'simple',
        interval: '1s',
      },
      workflow: {
        collect: {
        }
      },
      publish: []
    };

    task.workflow.collect.metrics = target.metrics.reduce((memo, metric) => {
      memo[metric.namespace] = {};
      return memo;
    }, {});

    console.log('creating task', task);
    return this.request({method: 'post', url: '/v1/tasks', data: task}).then(res => {
      console.log('created task', res);
      return res.data.body;
    });
  }

  // getTaskId(target) {
  //   if (!target) {
  //     return Promise.resolve(null);
  //   }
  //
  //   switch (target.mode) {
  //     case 'Watch Task': {
  //       if (!target.taskId) {
  //         return Promise.resolve(null);
  //       }
  //
  //       return this.getTask(target.taskId).then(task => {
  //         return task.id;
  //       });
  //     }
  //     case  'Define Task': {
  //       if (target.taskId) {
  //         return this.getTask(target.taskId).then(task => {
  //           return task.id;
  //         });
  //       }
  //     }
  //   }
  // }

  query(options) {
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

  deleteTask(taskId) {
    return this.request({method: 'delete', url: '/v1/tasks/' + taskId});
  }

  startTask(taskId) {
    return this.request({method: 'put', url: '/v1/tasks/' + taskId + '/start'});
  }

  stopTask(taskId) {
    return this.request({method: 'delete', url: '/v1/tasks/' + taskId + '/stop'});
  }

}

