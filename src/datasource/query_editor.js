import {QueryCtrl} from 'app/plugins/sdk';

import _ from 'lodash';

class PrometheusPullQueryCtrl extends QueryCtrl {

  constructor($scope, $injector, uiSegmentSrv) {
    super($scope, $injector);

    this.uiSegmentSrv = uiSegmentSrv;
    this.removeMetricOption = this.uiSegmentSrv.newSegment({fake: true, value: '-- remove metric --'});

    this.target.url = this.target.url || 'http://127.0.0.1:9090';
    this.target.metrics = this.target.metrics || [];
    this.target.interval = this.target.interval || '1s';

    this.urlSegment = this.uiSegmentSrv.newSegment({
      value: this.target.url,
      cssClass: "tight-form-item-xxlarge",
    });

    this.metricSegments = this.target.metrics.map(item => {
      return this.uiSegmentSrv.newSegment({value: item.name, cssClass: 'last'});
    });

    this.metricSegments.push(this.uiSegmentSrv.newPlusButton());
  }

  getMetricSegments(segment) {
    return this.datasource.getMetrics(this.target).then(metrics => {
      var elements = metrics.map(item => {
        return this.uiSegmentSrv.newSegment({value: item.value});
      });

      if (!segment.fake) {
        elements.unshift(_.clone(this.removeMetricOption));
      }

      return elements;
    });
  }

  urlChanged() {
    // TODO
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

    if (this.metricSegments.length > 0) {
      this.panelCtrl.dataStream.start();
    } else {
      this.panelCtrl.dataStream.stop();
    }

    this.target.metrics = this.metricSegments.reduce((memo, item) => {
      if (!item.fake) {
        memo.push({name: item.value});
      }
      return memo;
    }, []);
  }
}

PrometheusPullQueryCtrl.templateUrl = './query_editor.html';
export {PrometheusPullQueryCtrl};
