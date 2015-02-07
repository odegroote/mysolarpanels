//set up houravgpermonth chart

var monthlabels = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function HourAvgPerMonthChart() {

	this.serviceUrl = "http://88.159.81.18/dashboard/data/houravgpermonth.php";

	this.getSeries = function(data) {

		var ds = new Array();

		for (i=0; i< data.avgkwh.length; i++) {
			ds.push(
				{	label: monthlabels[i],
					color: i+1,
					data: data.avgkwh[i],
					lines: { show: true },
					curvedLines: { apply:true /*, fit: true, fitPointDist: 0.000001 */ }
				}
			);
		}
		return ds;
	}

	this.plotWithOptions = function(series) {
		
		return $.plot($("#houravgpermonth"), series, 
		{ 
			series: { curvedLines: { active: true } },
			grid: {clickable: false, hoverable: true},
			xaxes: [ {tickSize: 1, tickFormatter: function (val, axis) { return val.toFixed(0)}} ],
			yaxes: [ { min:0, position: "right"} ]
	   	});
	}

	this.update = function()
	{
		var obj = this;
		$.getJSON(this.serviceUrl)
			.done(function(data) { obj.plotWithOptions(obj.getSeries(data)); })
			.fail(function() { console.log(obj.serviceUrl + " failed"); })
		$("#tooltip").remove();
		previousPoint = null;
	}
}

var chart = new HourAvgPerMonthChart();

$("#houravgpermonth").bind("plothover", function (event, pos, item) {
	if (item ) {
		if (previousPoint != item.dataIndex) {
			$("#tooltip").remove();
			previousPoint = item.dataIndex;
			var x = item.datapoint[0], y = item.datapoint[1];

			showTooltip(item.pageX, item.pageY,
					"<span style='color:black'>" + item.series.label  + " = " + y.toFixed(2) + "</span>");
		} else {
		}
	} else {
		$("#tooltip").remove();
		previousPoint = null;
	}
   });
