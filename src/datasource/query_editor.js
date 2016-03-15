import {QueryCtrl} from 'app/plugins/sdk';

class SnapQueryCtrl extends QueryCtrl {
  constructor($scope, $injector) {
    super($scope, $injector);
  }
}

SnapQueryCtrl.templateUrl = 'datasource/query_editor.html';

export {SnapQueryCtrl};
