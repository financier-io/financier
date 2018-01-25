import moment from 'moment';

angular.module('financier').filter('timeAgo', function ($interval) {
   // trigger digest every 20 seconds
   $interval(function () {}, 20);

   function fromNowFilter(time) {
     return moment(time).fromNow();
   }

   fromNowFilter.$stateful = true;
   return fromNowFilter;
 });
