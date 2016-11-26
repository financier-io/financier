import moment from 'moment';

angular.module('financier').directive('heatMap', ($filter, $locale) => {
  const dateFilter = $filter('date'),
    currency = $filter('currency'),
    intCurrency = $filter('intCurrency');
  let FIRSTDAYOFWEEK = $locale.DATETIME_FORMATS.FIRSTDAYOFWEEK;

  if ($locale.id === 'en-au') {
    FIRSTDAYOFWEEK = 0;
  }

  const subs = {};

  function sub(index, cb) {
    if (!subs[index]) {
      subs[index] = [];
    }

    subs[index].push(cb);
  }

  function emit(index, e) {
    subs[index].forEach(cb => cb(e));
  }


  const SQUARE_SIZE = 10;
  const MONTH_LABEL_GUTTER_SIZE = 4;
  const WEEK_LABEL_OFFSET = 16;
  const svgns = 'http://www.w3.org/2000/svg';

  const range = n => Array.from(Array(n), (_, i) => i);

  const reduce = (arr, fn, defaultValue) => {
    if (arr && arr.length) {
      return arr.reduce(fn, defaultValue);
    }
  }


  function shiftDate(date, numDays) {
    const newDate = moment(date).toDate();
    newDate.setDate(newDate.getDate() + numDays);
    return newDate;
  }

  function getBeginningTimeForDate(date) {
    return moment(date).startOf('day').toDate();
  }

  // obj can be a parseable string, a millisecond timestamp, or a Date object
  function convertToDate(obj) {
    return (obj instanceof Date) ? obj : (moment(obj).toDate());
  }

  const MILLISECONDS_IN_ONE_DAY = 24 * 60 * 60 * 1000;

  const DAYS_IN_WEEK = 7;

  class CalendarHeatmap {
    constructor(props = {}) {
      this.props = props;

      this.state = {
        valueCache: this.getValueCache(props.values),
      };
    }

    getSquareSizeWithGutter() {
      return SQUARE_SIZE + this.props.gutterSize;
    }

    getMonthLabelSize() {
      if (!this.props.showMonthLabels) {
        return 0;
      } else if (this.props.horizontal) {
        return SQUARE_SIZE + MONTH_LABEL_GUTTER_SIZE;
      }
      return 2 * (SQUARE_SIZE + MONTH_LABEL_GUTTER_SIZE);
    }

    getStartDate() {
      return shiftDate(this.getEndDate(), -this.props.numDays + 1); // +1 because endDate is inclusive
    }

    getEndDate() {
      return getBeginningTimeForDate(convertToDate(this.props.endDate));
    }

    getStartDateWithEmptyDays() {
      return shiftDate(this.getStartDate(), -this.getNumEmptyDaysAtStart());
    }

    getNumEmptyDaysAtStart() {
      return this.getStartDate().getDay() - 1 - (FIRSTDAYOFWEEK - 7);
    }

    getNumEmptyDaysAtEnd() {
      return (DAYS_IN_WEEK - 1) - this.getEndDate().getDay();
    }

    getWeekCount() {
      const numDaysRoundedToWeek = this.props.numDays + this.getNumEmptyDaysAtStart() + this.getNumEmptyDaysAtEnd();
      return Math.ceil(numDaysRoundedToWeek / DAYS_IN_WEEK);
    }

    getWeekWidth() {
      return DAYS_IN_WEEK * this.getSquareSizeWithGutter();
    }

    getWidth() {
      return (this.getWeekCount() * this.getSquareSizeWithGutter()) - this.props.gutterSize + WEEK_LABEL_OFFSET + 2;
    }

    getHeight() {
      return this.getWeekWidth() + (this.getMonthLabelSize() - this.props.gutterSize) + 2;
    }

    getValueCache(values) {
      if (!values || !values.length) {
        return {};
      }

      return reduce(values, (memo, value) => {
        const date = convertToDate(value.date);
        const index = moment(date).diff(this.getStartDateWithEmptyDays(), 'days');

        memo[index] = {
          value,
          fill: this.props.fill(value),
          title: this.props.titleForValue ? this.props.titleForValue(index, value) : null,
          tooltipDataAttrs: this.getTooltipDataAttrsForValue(value),
        };
        return memo;
      }, {});
    }

    getValueForIndex(index) {
      if (this.state.valueCache[index]) {
        return this.state.valueCache[index].value;
      }
      return null;
    }

    getFillForIndex(index) {
      if (this.state.valueCache[index]) {
        return this.state.valueCache[index].fill;
      }
      return this.props.fill(null);
    }

    getTitleForIndex(index) {
      if (this.state.valueCache[index]) {
        return this.state.valueCache[index].title;
      }
      return this.props.titleForValue ? this.props.titleForValue(index) : null;
    }

    getTooltipDataAttrsForIndex(index) {
      if (this.state.valueCache[index]) {
        return this.state.valueCache[index].tooltipDataAttrs;
      }
      return this.getTooltipDataAttrsForValue({ date: null, count: null });
    }

    getTooltipDataAttrsForValue(value) {
      const { tooltipDataAttrs } = this.props;

      if (typeof tooltipDataAttrs === 'function') {
        return tooltipDataAttrs(value);
      }
      return tooltipDataAttrs;
    }

    getTransformForWeek(weekIndex) {
      if (this.props.horizontal) {
        return `translate(${weekIndex * this.getSquareSizeWithGutter()}, 0)`;
      }
      return `translate(0, ${weekIndex * this.getSquareSizeWithGutter()})`;
    }

    getTransformForMonthLabels() {
      if (this.props.horizontal) {
        return null;
      }
      return `translate(${this.getWeekWidth() + MONTH_LABEL_GUTTER_SIZE}, 0)`;
    }

    getTransformForAllWeeks() {
      if (this.props.horizontal) {
        return `translate(0, ${this.getMonthLabelSize()})`;
      }
      return null;
    }

    getViewBox() {
      if (this.props.horizontal) {
        return `-1 -1 ${this.getWidth()} ${this.getHeight()}`;
      }
      return `-1 -1 ${this.getHeight()} ${this.getWidth()}`;
    }

    getSquareCoordinates(dayIndex) {
      if (this.props.horizontal) {
        if (this.props.showWeekLabels) {
          return [WEEK_LABEL_OFFSET, dayIndex * this.getSquareSizeWithGutter()];
        } else {
          return [0, dayIndex * this.getSquareSizeWithGutter()];
        }
      }
      return [dayIndex * this.getSquareSizeWithGutter(), 0];
    }

    getMonthLabelCoordinates(weekIndex) {
      if (this.props.horizontal) {
        return [
          weekIndex * this.getSquareSizeWithGutter() + WEEK_LABEL_OFFSET,
          this.getMonthLabelSize() - MONTH_LABEL_GUTTER_SIZE,
        ];
      }
      const verticalOffset = -2;
      return [
        0,
        ((weekIndex + 1) * this.getSquareSizeWithGutter()) + verticalOffset,
      ];
    }

    getWeekLabelCoordinates(weekIndex) {
      if (this.props.showMonthLabels) {
        return [
          8,
          ((weekIndex + 2) * this.getSquareSizeWithGutter()) - 3 + MONTH_LABEL_GUTTER_SIZE
        ];
      } else {
        return [
          8,
          ((weekIndex + 1) * this.getSquareSizeWithGutter()) - 2
        ];
      }
      
      throw 'error';
    }

    handleClick(value) {
      if (this.props.onClick) {
        this.props.onClick(value);
      }
    }

    renderSquare(dayIndex, index) {
      const indexOutOfRange = index < this.getNumEmptyDaysAtStart() || index >= this.getNumEmptyDaysAtStart() + this.props.numDays;
      if (indexOutOfRange && !this.props.showOutOfRangeDays) {
        return null;
      }
      const [x, y] = this.getSquareCoordinates(dayIndex);

      var rect = document.createElementNS(svgns, 'rect');

      rect.setAttributeNS(null, 'key', index);
      rect.setAttributeNS(null, 'width', SQUARE_SIZE);
      rect.setAttributeNS(null, 'height', SQUARE_SIZE);
      rect.setAttributeNS(null, 'x', x);
      rect.setAttributeNS(null, 'y', y);

      const title = document.createElementNS(svgns, 'title')

      rect.appendChild(title);

      rect.setAttributeNS(null, 'fill', this.getFillForIndex(index));
      rect.setAttributeNS(null, 'y', y);

      sub(index, e => {
        if (e === 'leave') {
          rect.setAttributeNS(null, 'class', '');
        } else {
          rect.setAttributeNS(null, 'class', 'active');
        }
      });

      rect.onmouseover = () => {
        emit(index);

        // Lazy title parsing
        title.textContent = this.getTitleForIndex(index);
      }

      rect.onmouseleave = () => {
        emit(index, 'leave');
      }

      return rect;
    }

    renderWeek(weekIndex) {
      var rect = document.createElementNS(svgns, 'g');

      rect.setAttributeNS(null, 'key', weekIndex);
      rect.setAttributeNS(null, 'transform', this.getTransformForWeek(weekIndex));

      for (let i = 0; i < DAYS_IN_WEEK; i++) {
        var square = this.renderSquare(i, (weekIndex * DAYS_IN_WEEK) + i);

        if (square) {
          rect.appendChild(square);
        }
      }

      return rect;
    }

    renderAllWeeks() {
      return range(this.getWeekCount()).map(weekIndex => this.renderWeek(weekIndex));
    }

    renderMonthLabels() {
      if (!this.props.showMonthLabels) {
        return null;
      }
      const weekRange = range(this.getWeekCount() - 1);  // don't render for last week, because label will be cut off
      return weekRange.map((weekIndex) => {
        const endOfWeek = shiftDate(this.getStartDateWithEmptyDays(), (weekIndex + 1) * DAYS_IN_WEEK);
        const [x, y] = this.getMonthLabelCoordinates(weekIndex);

        if (endOfWeek.getDate() >= 1 && endOfWeek.getDate() <= DAYS_IN_WEEK) {
          var text = document.createElementNS(svgns, 'text');

          text.setAttributeNS(null, 'key', weekIndex);
          text.setAttributeNS(null, 'x', x);
          text.setAttributeNS(null, 'y', y);

          text.textContent = dateFilter(endOfWeek, 'MMM');
          return text;
        }

        return null;
      });
    }

    renderWeekLabels() {
      if (!this.props.showWeekLabels) {
        return null;
      }
      const weekRange = [1, 3, 5];  // don't render for last week, because label will be cut off
      return weekRange.map(weekIndex => {
        const [x, y] = this.getWeekLabelCoordinates(weekIndex);

        var text = document.createElementNS(svgns, 'text');

        text.setAttributeNS(null, 'key', weekIndex);
        text.setAttributeNS(null, 'x', x);
        text.setAttributeNS(null, 'y', y);
        text.setAttributeNS(null, 'text-anchor', 'middle');

        text.textContent = $locale.DATETIME_FORMATS.SHORTDAY[(weekIndex + FIRSTDAYOFWEEK + 1) % 7].charAt(0);
        return text;
      });
    }

    render() {
      var svg = document.createElementNS(svgns, 'svg');
      svg.setAttributeNS(null, 'viewBox', this.getViewBox());

      var gLabels = document.createElementNS(svgns, 'g');
      var labels = this.getTransformForMonthLabels();
      if (labels) {
        gLabels.setAttributeNS(null, 'transform', labels);
      }

      var monthLabels = this.renderMonthLabels()
      if (monthLabels) {
        for (let i = 0; i < monthLabels.length; i++) {
          if (monthLabels[i]) {
            gLabels.appendChild(monthLabels[i]);
          }
        }
      }

      var gWeeks = document.createElementNS(svgns, 'g');
      gWeeks.setAttributeNS(null, 'transform', this.getTransformForAllWeeks());

      var monthWeek = this.renderAllWeeks();
      for (let i = 0; i < monthWeek.length; i++) {
        if (monthWeek[i]) {
          gWeeks.appendChild(monthWeek[i]);
        }
      }

      var gWeekLabels = document.createElementNS(svgns, 'g');
      var weekLabels = this.renderWeekLabels();
      for (let i = 0; i < weekLabels.length; i++) {
        if (weekLabels[i]) {
          gWeekLabels.appendChild(weekLabels[i]);
        }
      }

      svg.appendChild(gLabels);
      svg.appendChild(gWeeks);
      svg.appendChild(gWeekLabels);

      svg.setAttributeNS(null, 'class', 'heat-map');

      return svg;
    }
  }

  return {
    restrict: 'E',
    scope: {
      data: '=',
      hue: '=',
      showMonthLabels: '=',
      max: '=',
      endDate: '='
    },
    link: (scope, element, attrs) => {
      function rainbow(n) {
        let step = Math.abs(Math.min(Math.abs(n), scope.max) / scope.max) * 100;

        return `hsl(${scope.hue},100%,${((100 - step) * 0.65) + 25}%)`;
      }

      let cal;

      scope.$watchGroup(['data', 'endDate'], render);

      function render() {
        if (scope.data) {
          if (cal) {
            element.contents().remove();
          }

          cal = new CalendarHeatmap({
            numDays: 365,
            endDate: scope.endDate,
            gutterSize: 1,
            horizontal: true,
            showMonthLabels: angular.isDefined(scope.showMonthLabels) ? scope.showMonthLabels : true,
            showWeekLabels: true,
            showOutOfRangeDays: false,
            titleForValue: (index, value) => {
              index = index - (scope.endDate.getDay() - 2 - (FIRSTDAYOFWEEK - 7));
              const date = dateFilter(moment(scope.endDate).subtract(365 - index, 'days').toDate(), 'mediumDate');
              let amount = value ? value.count : 0;
              amount = currency(intCurrency(amount, true, scope.$parent.dbCtrl.currencyDigits), scope.$parent.dbCtrl.currencySymbol, scope.$parent.dbCtrl.currencyDigits);
              return `${date}\n${amount}`
            },
            fill: value => {
              let step;

              if (value && angular.isNumber(value.count)) {
                step = rainbow(value.count);
              } else {
                step = `#efefef`;
              }

              return step;
            },
            values: scope.data
          });

          element[0].appendChild(cal.render());
        }
      }
    }
  }
});
