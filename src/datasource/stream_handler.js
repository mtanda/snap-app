import moment from 'moment';
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

    var target = this.options.targets[0];

    console.log('StreamHandler: start()');

    var watchUrl = this.ds.url + '/metrics';
    this.source = new EventSource(watchUrl);
    this.source.onmessage = this.onMessage.bind(this);
    this.source.onerror = this.onError.bind(this);
    this.source.onopen = this.onOpen.bind(this);
    this.source.onclose = this.onClose.bind(this);
    this.metrics = {};
  }

  onMessage(evt) {
    this.processMetricEvent(data);
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
    console.log(data); // DEBUG
    return;
    var endTime = new Date().getTime();
    var startTime = endTime - (60 * 1 * 1000);
    var seriesList = [];

    for (var i = 0; i < data.event.length; i++) {
      var point = data.event[i];
      var series = this.metrics[point.namespace];
      if (!series) {
        series = {target: point.namespace, datapoints: []};
        this.metrics[point.namespace] = series;
      }

      var time = new Date(point.timestamp).getTime();
      series.datapoints.push([point.data, time]);
      seriesList.push(series);
    }

    this.subject.next({
      data: seriesList,
      range: {from: moment(startTime), to: moment(endTime)}
    });
  }
}

