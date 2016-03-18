import {QueryCtrl} from 'app/plugins/sdk';

import _ from 'lodash';

class SnapQueryCtrl extends QueryCtrl {

  constructor($scope, $injector, uiSegmentSrv) {
    super($scope, $injector);

    this.uiSegmentSrv = uiSegmentSrv;
    this.removeMetricOption = this.uiSegmentSrv.newSegment({fake: true, value: '-- remove metric --'});

    this.target.mode = this.target.mode || 'Watch Task';
    this.target.taskName = this.target.taskName || 'select task';
    this.target.taskId = this.target.taskId || '';
    this.target.metrics = this.target.metrics || [];

    this.taskSegment = this.uiSegmentSrv.newSegment({
      value: this.target.taskName
    });

    if (this.target.taskName === 'select task') {
      this.taskSegment.fake = true;
    }

    this.metricSegments = this.target.metrics.map(item => {
      return this.uiSegmentSrv.newSegment({value: item.namespace, cssClass: 'last'});
    });

    this.metricSegments.push(this.uiSegmentSrv.newPlusButton());

    this.getTaskInfo();
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

  deleteTask() {
    this.datasource.deleteTask(this.target.taskId).then(() =>  {
      this.target.taskId = null;
      this.target.taskName = "";
      this.taskSegment.value = 'select task';
      this.taskSegment.html = 'select task';
      this.taskSegment.fake = true;
    });
  }

  createTask() {
    this.datasource.createTask(this.target).then(task =>  {
      this.target.taskId = task.id;
      this.getTaskInfo();
    });
  }

  getTaskInfo() {
    if (!this.target.taskId) {
      return;
    }

    this.datasource.getTask(this.target.taskId).then(task =>  {
      if (!task) {
        this.task = null;
        this.target.taskId = '';
        this.taskNotFound = true;
        return;
      }

      this.taskNotFound = false;
      this.task = task;
      this.isRunning = task.task_state === 'Running';
      this.isStopped = task.task_state === 'Stopped';
    });
  }

  startTask() {
    this.datasource.startTask(this.target.taskId)
      .then(this.getTaskInfo.bind(this));
  }

  watchTask() {
    this.panelCtrl.dataSubject.start();
  }
}

SnapQueryCtrl.templateUrl = 'datasource/query_editor.html';
export {SnapQueryCtrl};
