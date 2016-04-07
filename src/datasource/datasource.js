import moment from 'moment';
import {StreamHandler} from './stream_handler';

export class PrometheusPullDatasource {

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

  emptyResult() {
    return Promise.resolve({data: []});
  }

  getMetricEntries() {
    return this.request({method: 'get', url: '/metrics'}).then(res => {
      return res.data.body.split(/\n/).filter(function(l) {
        return l.indexOf('#') !== 0;
      }).map(function(l) {
        return l.split(' ')[0];
      });
    }).catch(err => {
      if (err.status === 404) {
        return null;
      } else {
        throw err;
      }
    });
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

  getMetrics() {
    if (this.metricsCache) {
      return Promise.resolve(this.metricsCache);
    }

    return this.request({method: 'get', url: '/metrics'}).then(res => {
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

