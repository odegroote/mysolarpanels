///<reference path="jquery.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Period = (function () {
    function Period() {
    }
    Period.prototype.prev = function () {
    };

    Period.prototype.next = function () {
    };

    Period.prototype.zoomout = function () {
        return this;
    };

    Period.prototype.zoomin = function (val) {
        return (new Year(val)).adjustTooltips();
    };

    Period.prototype.getSelectionParameters = function () {
        var parameters = {};
        return parameters;
    };

    Period.prototype.periodLabel = function () {
        return "";
    };

    Period.prototype.label = function (extra, kwh) {
        var label = extra;

        if (kwh < 1)
            return label + " " + (kwh * 1000).toFixed(2) + " wH";
        else
            return label + " " + (kwh).toFixed(2) + " kWh";
    };

    Period.prototype.avglabel = function (extra) {
        return "kWh/kWp: ";
    };

    Period.prototype.adjustTooltips = function () {
        $("a#prev-period").hide();
        $("a#next-period").hide();
        $("#zoomout").hide();

        return this;
    };

    Period.prototype.isDayView = function () {
        return false;
    };

    Period.prototype.isMonthView = function () {
        return false;
    };

    Period.prototype.isYearView = function () {
        return false;
    };
    return Period;
})();

var Year = (function (_super) {
    __extends(Year, _super);
    function Year(dt) {
        _super.call(this);
        this.year = dt;
    }
    Year.prototype.getYear = function () {
        return this.year;
    };

    Year.prototype.prev = function () {
        this.year--;
    };

    Year.prototype.next = function () {
        this.year++;
    };

    Year.prototype.zoomout = function () {
        return (new Period()).adjustTooltips();
    };

    Year.prototype.zoomin = function (val) {
        return (new Month(this.getYear(), val)).adjustTooltips();
    };

    Year.prototype.getSelectionParameters = function () {
        var parameters = {};
        parameters['year'] = this.getYear();

        return parameters;
    };

    Year.prototype.periodLabel = function () {
        var label = "";
        label += this.getYear();
        return label;
    };

    Year.prototype.avglabel = function (extra) {
        var label = "day average per month: ";

        return label + extra;
    };

    Year.prototype.adjustTooltips = function () {
        $("a#prev-period").show();
        $("a#next-period").show();
        $("#zoomout").show();

        return this;
    };

    Year.prototype.isYearView = function () {
        return true;
    };
    return Year;
})(Period);

var Month = (function (_super) {
    __extends(Month, _super);
    function Month(year, month) {
        _super.call(this, year);
        this.month = month;
    }
    Month.prototype.getYear = function () {
        return _super.prototype.getYear.call(this);
    };

    Month.prototype.getMonth = function () {
        return this.month;
    };

    Month.prototype.prev = function () {
        this.month--;
        if (this.month < 1) {
            this.month = 12;
            _super.prototype.prev.call(this);
        }
    };

    Month.prototype.next = function () {
        this.month++;
        if (this.month > 12) {
            this.month = 1;
            _super.prototype.next.call(this);
        }
    };

    Month.prototype.zoomout = function () {
        return (new Year(this.getYear())).adjustTooltips();
    };

    Month.prototype.zoomin = function (val) {
        return (new Day(this.getYear(), this.month, val)).adjustTooltips();
    };

    Month.prototype.getSelectionParameters = function () {
        var parameters = {};

        parameters['year'] = this.getYear();
        parameters['month'] = this.month;

        return parameters;
    };

    Month.prototype.periodLabel = function () {
        var label = "";
        label += this.getYear();
        label = this.month + "-" + label;
        return label;
    };

    Month.prototype.avglabel = function (extra) {
        return "day average: ";
    };

    Month.prototype.isMonthView = function () {
        return true;
    };
    return Month;
})(Year);

var Day = (function (_super) {
    __extends(Day, _super);
    function Day(year, month, day) {
        _super.call(this, year, month);
        this.day = day;
    }
    Day.prototype.getYear = function () {
        return _super.prototype.getYear.call(this);
    };

    Day.prototype.getMonth = function () {
        return _super.prototype.getMonth.call(this);
    };

    Day.prototype.getDay = function () {
        return this.day;
    };

    Day.prototype.prev = function () {
        this.day--;
        if (this.day < 1) {
            this.day = 31;
            _super.prototype.prev.call(this);
        }
    };

    Day.prototype.next = function () {
        this.day++;
        if (this.day > 31) {
            this.day = 1;
            _super.prototype.next.call(this);
        }
    };

    Day.prototype.zoomout = function () {
        return (new Month(this.getYear(), this.getMonth())).adjustTooltips();
    };

    Day.prototype.zoomin = function (val) {
        return this;
    };

    Day.prototype.getSelectionParameters = function () {
        var parameters = {};
        parameters['year'] = this.getYear();
        parameters['month'] = this.getMonth();
        parameters['day'] = this.day;

        return parameters;
    };

    Day.prototype.periodLabel = function () {
        var label = "";
        label += this.getYear();
        label = this.getMonth() + "-" + label;
        label = this.day + "-" + label;
        return label;
    };

    Day.prototype.avglabel = function (extra) {
        return "hour average: " + extra;
    };

    Day.prototype.isDayView = function () {
        return false;
    };

    Day.prototype.isMonthView = function () {
        return false;
    };
    return Day;
})(Month);
//# sourceMappingURL=period.js.map
