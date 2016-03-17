import {QueryCtrl} from 'app/plugins/sdk';

import _ from 'lodash';

class SnapQueryCtrl extends QueryCtrl {

  constructor($scope, $injector, uiSegmentSrv) {
    super($scope, $injector);

    this.uiSegmentSrv = uiSegmentSrv;

    this.target.mode = this.target.mode || 'Watch Task';
    this.target.taskName = this.target.taskName || 'select task';
    this.target.taskId = this.target.taskId || '';
    this.target.metrics = this.target.metrics || [];

    this.taskSegment = uiSegmentSrv.newSegment({
      value: this.target.taskName
    });

    if (this.target.taskName === 'select task') {
      this.taskSegment.fake = true;
    }

    this.metricSegments = this.target.metrics.map(item => {
      return uiSegmentSrv.newSegment({value: item.namespace, cssClass: 'last'});
    });

    this.metricSegments.push(uiSegmentSrv.newPlusButton());
    this.removeMetricOption = uiSegmentSrv.newSegment({fake: true, value: '-- remove metric --'});
  }

  getModes() {
    return Promise.resolve([
        this.uiSegmentSrv.newSegment({value: 'Watch Task'}),
        this.uiSegmentSrv.newSegment({value: 'Define Task'}),
    ]);
  }

  getTasks() {
    return this.datasource.getTasks().then(tasks => {
      this.taskMap = {};

      return tasks.map(task => {
        this.taskMap[task.name] = task;

        return this.uiSegmentSrv.newSegment({value: task.name});
      });
    });
  }

  taskChanged() {
    var task = this.taskMap[this.taskSegment.value];
    this.target.taskName = task.name;
    this.target.taskId = task.id;
    this.panelCtrl.refresh();
  }

  getMetricSegments(segment) {
    return this.datasource.getMetrics().then(metrics => {
      var elements = metrics.map(item => {
        return this.uiSegmentSrv.newSegment({value: item.value});
      });

      if (!segment.fake) {
        elements.unshift(_.clone(this.removeMetricOption));
      }

      return elements;
    });
  }

  metricSegmentChanged(segment, index) {
    if (segment.value === this.removeMetricOption.value) {
      this.metricSegments.splice(index, 1);
    } else {
      if (segment.type === 'plus-button') {
        segment.type = '';
      }

      if ((index+1) === this.metricSegments.length) {
        this.metricSegments.push(this.uiSegmentSrv.newPlusButton());
      }
    }

    this.target.metrics = this.metricSegments.reduce((memo, item) => {
      if (!item.fake) {
        memo.push({namespace: item.value});
      }
      return memo;
    }, []);
  }
}

SnapQueryCtrl.templateUrl = 'datasource/query_editor.html';
export {SnapQueryCtrl};
