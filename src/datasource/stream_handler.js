import moment from 'moment';
//import {Observable} from 'vendor/npm/rxjs/Observable.js'
import {Observable} from 'vendor/npm/rxjs/Rx';
import 'vendor/npm/rxjs/add/observable/interval';
import {Subject} from 'vendor/npm/rxjs/Subject';

export class StreamHandler {

  constructor(options, datasource) {
    this.options = options;
    this.ds = datasource;
    this.subject = new Subject();
  }

  start() {
    if (this.source) {
      this.source.close();
    }

    //var target = this.options.targets[0];

    console.log('StreamHandler: start()');

    //var watchUrl = this.ds.url + '/metrics';
    var self = this;
    this.source = Observable
    .interval(1000)
    .flatMap(function() {
      var promise = new Promise(function(resolve) {
        self.ds.request({ method: 'get', url: '/metrics' }).then(res => {
          var result = res.data.split(/\n/).filter(function(l) {
            return l.indexOf('#') !== 0;
          }).map(function(l) {
            return l.split(' ');
          });
          return resolve(result);
        });
      });
      return Observable.fromPromise(promise);
    })
    .subscribe(
      function (evt) {
        console.log(evt);
        self.onMessage.bind(self)(evt);
      },
      function (evt) {
        self.onError.bind(self)(evt);
      },
      function () {
        self.onCloe.bind(self)({});
      });
    this.metrics = {};
  }

  onMessage(evt) {
    this.processMetricEvent(evt);
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

  stop() {
    console.log('Forcing event stream close');
    if (this.source) {
        this.source.close();
    }
    this.source = null;
  }

  subscribe(options) {
    return this.subject.subscribe(options);
  }

  processMetricEvent(data) {
    var endTime = new Date().getTime();
    var startTime = endTime - (60 * 1 * 1000);
    var seriesList = [];

    for (var i = 0; i < data.length; i++) {
      var point = data[i];
      var series = this.metrics[point[0]];
      if (!series) {
        series = {target: point[0], datapoints: []};
        this.metrics[point[0]] = series;
      }

      var time = new Date().getTime();
      series.datapoints.push([point[1], time]);
      seriesList.push(series);
    }

    this.subject.next({
      data: seriesList,
      range: {from: moment(startTime), to: moment(endTime)}
    });
  }
}

