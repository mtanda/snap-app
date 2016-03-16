import {QueryCtrl} from 'app/plugins/sdk';

class SnapQueryCtrl extends QueryCtrl {

  constructor($scope, $injector, uiSegmentSrv) {
    super($scope, $injector);

    this.uiSegmentSrv = uiSegmentSrv;
    this.target.task = this.target.task || {name: 'select task', id: ''};
    this.taskSegment = uiSegmentSrv.newSegment({
      value: this.target.task.name
    });

    if (this.target.task.name === 'select task') {
      this.taskSegment.fake = true;
    }
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
    this.target.task.name = task.name;
    this.target.task.id = task.id;
    this.panelCtrl.refresh();
  }
}

SnapQueryCtrl.templateUrl = 'datasource/query_editor.html';

export {SnapQueryCtrl};
