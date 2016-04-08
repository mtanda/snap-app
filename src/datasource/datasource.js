import moment from 'moment';
import {StreamHandler} from './stream_handler';

export class PrometheusPullDatasource {

  constructor(instanceSettings, $http, backendSrv)  {
    this.instanceSettings = instanceSettings;
    this.url = instanceSettings.url;
    this.withCredentials = instanceSettings.withCredentials;
    this.$http = $http;
    this.backendSrv = backendSrv;
    this.streamHandlers = {};
  }

  request(options) {
    options.url = this.url + options.url;
    if (this.withCredentials) {
      options.withCredentials = true;
    }
    return this.backendSrv.datasourceRequest(options);
  }

  query(options) {
    var handler = this.streamHandlers[options.panelId];
    if (handler) {
      return Promise.resolve(handler);
    }

    this.streamHandlers[options.panelId] = handler = new StreamHandler(options, this);
    handler.start();

    return Promise.resolve(handler);
  }

  getMetrics(target) {
    if (target.url === '') {
      return Promise.resolve([]);
    }

    if (this.metricsCache) {
      return Promise.resolve(this.metricsCache);
    }

    return this.request({method: 'get', url: target.url + '/metrics'}).then(res => {
      if (!res.data) {
        return [];
      }

      this.metricsCache = res.data.split(/\n/).filter(l => {
        return l.indexOf('#') !== 0;
      }).map(l => {
        var metric = l.split(' ')[0];
        return { text: metric, value: metric };
      });

      return this.metricsCache;
    });
  }
}

