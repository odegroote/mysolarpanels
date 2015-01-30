/**
 * 
 */

spControllers.controller('KWhChartController', function ($scope) {
	
	var today = new Date();
	$scope.currentPeriod = new Month(today.getFullYear(), today.getMonth()+1);
	$scope.kwhChart = new KwhChart();
	$scope.kwhChart.updateKwh($scope.currentPeriod);


	$("#stackchart").bind("plothover", function (event, pos, item) {
		$scope.kwhChart.hover(item);
	});

	$("#stackchart").bind("plotclick", function (event, pos, item) {
		$scope.currentPeriod = $scope.kwhChart.click($scope.currentPeriod, event, pos, item);
	});

	//tooltip
	$("a#prev-period,a#zoomout,a#next-period").tooltip({"placement":"top",delay: { show: 400, hide: 200 }});

	$scope.prevPeriod = function(e) { 
						e.preventDefault();
						$scope.currentPeriod.prev();
						$scope.kwhChart.updateKwh($scope.currentPeriod); };
	$scope.nextPeriod = function(e) { 
						e.preventDefault(); 
						$scope.currentPeriod.next();
						$scope.kwhChart.updateKwh($scope.currentPeriod); };
	$scope.zoomOut = function(e) { 
						e.preventDefault(); 
						$scope.currentPeriod = $scope.currentPeriod.zoomout();
						$scope.kwhChart.updateKwh($scope.currentPeriod); };
}).
controller('HourAvgPerMonthController', function($scope) {
	var monthlabels = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

	function HourAvgPerMonthChart() {
	
		this.serviceUrl = "http://88.159.81.18/dashboard/data/houravgpermonth.php";

		this.getSeries = function (data) {

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

	$scope.chart = new HourAvgPerMonthChart();

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
	
	$scope.chart.update();
});