///<reference path="jquery.d.ts" />
///<reference path="period.ts" />
var KwhChart = (function () {
    function KwhChart() {
        this.kwhServiceUrl = "http://88.159.81.18/dashboard/data/kwh.php";
        this.previousPoint = null;
    }
    KwhChart.prototype.updateKwh = function (cp) {
        var kwhchart = this;
        $.getJSON(this.kwhServiceUrl, cp.getSelectionParameters()).done(function (data) {
            kwhchart.plt = kwhchart.plotWithOptions(kwhchart.getSeries(cp.label(" total: ", data.total), cp.avglabel(""), data, cp));
            $("#graphheader").html(" kWh " + cp.periodLabel());
        }).fail(function () {
            console.log(kwhchart.kwhServiceUrl + " failed");
        });
        cp.adjustTooltips();
        $("#tooltip").remove();
        this.previousPoint = null;
    };
    KwhChart.prototype.hover = function (item) {
        if (item) {
            if (this.previousPoint != item.dataIndex) {
                $("#tooltip").remove();
                this.previousPoint = item.dataIndex;
                var x = item.datapoint[0].toFixed(0), y = item.datapoint[1];
                this.showTooltip(item.pageX, item.pageY, "<span style='color:black'>" + item.series.label.slice(0, item.series.label.indexOf(':')) + " = " + y.toFixed(2) + "</span>");
            }
            else {
            }
        }
        else {
            $("#tooltip").remove();
            this.previousPoint = null;
        }
    };
    KwhChart.prototype.click = function (cp, event, pos, item) {
        var xas = this.plt.getAxes().xaxis.c2p(pos.x1);
        if (pos.x >= 0) {
            if (!cp.isDayView()) {
                var newperiod = cp.zoomin(Math.floor(pos.x));
                this.updateKwh(newperiod);
                return newperiod;
            }
            else {
                $.getJSON("data/dayusage.php", cp.getSelectionParameters()).done(function (data) {
                    var plot = $.plot($("#usagechart"), [
                        { label: " power draw ", data: data.watts, yaxis: 1, lines: { show: true, fill: false, steps: false } },
                        { label: "cummulative energy draw( " + data.total + " Wh ):", data: data.cumm, yaxis: 2, lines: { show: true, fill: false, steps: false } }
                    ], {
                        legend: { position: "nw" },
                        grid: { clickable: true, hoverable: true },
                        xaxes: [{ tickSize: 60, tickFormatter: function (val, axis) {
                            return val / 60 + ":00";
                        } }],
                        yaxes: [{ position: "left" }, { min: this.minCumm(data.cumm) - 100, position: "right" }]
                    });
                    plot.getYAxes()[1].min = plot.getYAxes()[0].min;
                    plot.draw();
                }).fail(function () {
                    console.log("data/dayusage failed");
                });
                $('#myModal').modal('show');
                return cp;
            }
        }
    };
    KwhChart.prototype.minCumm = function (cumm) {
        var min = 0;
        for (var i = 0; i < cumm.length; i++) {
            if (cumm[i][1] < min) {
                min = cumm[i][1];
            }
        }
        return min;
    };
    KwhChart.prototype.getSeries = function (lbl, avglbl, data, cp) {
        var ds = new Array();
        ds.push({ label: lbl, stack: (cp.isMonthView() ? true : null), data: data.kwh, lines: { shows: true, fill: true, steps: true } });
        ds.push({ label: avglbl, data: data.avgkwh, yaxis: (data.month == null ? 2 : 1), lines: { show: true, fill: false, steps: true } });
        if (cp.isMonthView()) {
            ds.push({ label: "energy draw:", stack: (cp.isMonthView() ? true : null), data: data.used, lines: { shows: true, fill: true, steps: true } });
        }
        return ds;
    };
    KwhChart.prototype.plotWithOptions = function (series) {
        return $.plot($("#stackchart"), series, {
            grid: { clickable: true, hoverable: true },
            xaxes: [{ tickSize: 1, tickFormatter: function (val, axis) {
                return val.toFixed(0);
            } }],
            yaxes: [{ min: 0, position: "left" }, { min: 0, position: "right" }]
        });
    };
    KwhChart.prototype.showTooltip = function (x, y, contents) {
        $('<div id="tooltip">' + contents + '</div>').css({
            position: 'absolute',
            display: 'none',
            top: y + 5,
            left: x + 5,
            border: '1px solid #fdd',
            padding: '2px',
            'background-color': '#dfeffc',
            opacity: 0.80
        }).appendTo("body").fadeIn(200);
    };
    return KwhChart;
})();
//# sourceMappingURL=kwchart.js.map