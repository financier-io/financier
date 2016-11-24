import moment from 'moment';

angular.module('financier').controller('heatMapCtrl', function($scope, $rootScope, $state, $translate, $filter) {
  const dateFilter = $filter('date');

  this.heatMapData = [];

  const minYear = Math.min(...$scope.dbCtrl.manager.allAccounts.transactions.map(t => t.date.getFullYear()));
  const currentYear = new Date().getFullYear();

  this.years = Array(currentYear - minYear + 1).fill().map((_, i) => {
    const year = moment().year(currentYear - i).endOf('year').toDate();

    return {
      label: dateFilter(year, 'yyyy'),
      value: year
    };
  });

  this.years.unshift({
    label: $translate.instant('LAST_12_MONTHS'),
    value: new Date()
  });

  this.selectedYear = this.years[0];

  $scope.$watch(() => $scope.reportCtrl.transactions, transactions => {
    this.inflowHeat = generateHeatMapValues(transactions.filter(t => {
      return t.value > 0 && !t.transfer;
    }));

    this.outflowHeat = generateHeatMapValues(transactions.filter(t => {
      return t.value < 0 && !t.transfer;
    }));
  });

  function generateHeatMapValues(transactions) {
    const heatMapTmp = {}, heatMapData = [];

    transactions.forEach(t => {
      const key = moment(t.date).format('YYYY-MM-DD');
      if (!heatMapTmp[key]) {
        heatMapTmp[key] = 0;
      }

      heatMapTmp[key] += t.value;
    });

    for (let key in heatMapTmp) {
      heatMapData.push({
        date: key,
        count: heatMapTmp[key]
      });
    }

    return heatMapData;
  }
});
