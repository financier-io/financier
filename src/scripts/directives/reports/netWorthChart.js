import moment from 'moment';
import Chart from 'chart.js';

angular.module('financier').directive('netWorthChart', ($filter, netWorth) => {
  return {
    restrict: 'E',
    template: '<canvas></canvas>',
    scope: {
      transactions: '='
    },
    replace: true,
    link: (scope, element, attrs) => {
      const currency = $filter('currency'),
        report = netWorth(scope.transactions);

      var ctx = element[0].getContext('2d');

      var barChartData = {
        labels: report.months,
        datasets: [{
          label: 'Net Worth',
          type: 'line',
          tension: 0,
          data: report.netWorth.map(amt => amt / 100),
          fill: false,
          borderWidth: 1,
          borderColor: '#888',
          radius: 0,
          yAxisID: 'y-axis-1'
        }, {
          label: 'Net Worth',
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
          label: 'Debts',
          data: report.debt.map(amt => amt / 100),
          fill: false,
          backgroundColor: '#ff4c4c',
          borderColor: '#ff4c4c',
          hoverBackgroundColor: '#ff4c4c',
          hoverBorderColor: '#ff4c4c',
          yAxisID: 'y-axis-1'
        }, {
          type: 'bar',
          label: 'Assets',
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
                  return moment(date).format('MMM \'YY');
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
                callback: amount => currency(amount)
              }
            }]
          }
        }
      });
    }
  };
});
