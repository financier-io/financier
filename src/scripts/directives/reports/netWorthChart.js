import Chart from 'chart.js';

angular.module('financier').directive('netWorthChart', ($filter, netWorth, $translate) => {
  return {
    restrict: 'E',
    template: '<canvas></canvas>',
    scope: {
      transactions: '='
    },
    replace: true,
    link: (scope, element, attrs) => {
      scope.$watch('transactions', transactions => {
        if (transactions) {
          generateReport();
        }
      });

      function generateReport() {
        const currency = $filter('currency'),
          dateFilter = $filter('date'),
          report = netWorth(scope.transactions);

        var ctx = element[0].getContext('2d');

        var barChartData = {
          labels: report.months,
          datasets: [{
            label: $translate.instant('NET_WORTH'),
            type: 'line',
            tension: 0,
            data: report.netWorth.map(amt => amt / 100),
            fill: false,
            borderWidth: 1,
            borderColor: '#888',
            radius: 0,
            yAxisID: 'y-axis-1'
          }, {
            label: $translate.instant('NET_WORTH'),
            type: 'line',
            borderColor: 'rgba(0, 0, 0, 0)',
            tension: 0,
            data: report.netWorth.map(amt => amt / 100),
            fill: true,
            radius: 0,
            backgroundColor: 'rgba(255, 255, 0, 0.1)',
            yAxisID: 'y-axis-1'
          }, {
            type: 'bar',
            label: $translate.instant('DEBTS'),
            data: report.debt.map(amt => amt / 100),
            fill: false,
            backgroundColor: '#ff4c4c',
            borderColor: '#ff4c4c',
            hoverBackgroundColor: '#ff4c4c',
            hoverBorderColor: '#ff4c4c',
            yAxisID: 'y-axis-1'
          }, {
            type: 'bar',
            label: $translate.instant('ASSETS'),
            data: report.assets.map(amt => amt / 100),
            fill: false,
            backgroundColor: '#93c776',
            borderColor: '#93c776',
            hoverBackgroundColor: '#93c776',
            hoverBorderColor: '#93c776',
            yAxisID: 'y-axis-1'
          }]
        };

        const myBar = new Chart(ctx, {
          type: 'bar',
          data: barChartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            tooltips: {
              mode: 'label'
            },
            legend: {
              display: false
            },
            elements: {
              line: {
                fill: false
              }
            },
            scales: {
              xAxes: [{
                display: true,
                gridLines: {
                  display: false
                },
                labels: {
                  show: true,
                },
                ticks: {
                  callback: date => {
                    return dateFilter(date, 'MMM \'yy');
                  }
                }
              }],
              yAxes: [{
                type: 'linear',
                display: true,
                position: 'left',
                id: 'y-axis-1',
                gridLines: {
                  display: true
                },
                labels: {
                  show: true
                },
                ticks: {
                  beginAtZero: true,
                  callback: amount => currency(amount, scope.$parent.dbCtrl.currencySymbol, scope.$parent.dbCtrl.currencyDigits)
                }
              }]
            }
          }
        });
      }
    }
  };
});
