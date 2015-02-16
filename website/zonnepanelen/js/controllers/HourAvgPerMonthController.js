spControllers.controller('HourAvgPerMonthController', ['$scope', 'HourAvgPerMonthService', function($scope, dataservice) {
	var monthlabels = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

	function showTooltip(x,y,contents) {
		$('<div id="tooltip">' + contents + '</div>').css( {
			position: 'absolute',
			display: 'none',
			top: y + 5,
			left: x + 5,
			border: '1px solid #fdd',
			padding: '2px',
			'background-color': '#dfeffc',
			opacity: 0.80
		}).appendTo("body").fadeIn(200);
	}
	
	$("#houravgpermonth").bind("plothover", function (event, pos, item) {
		event.preventDefault();
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
		return false;
	});
	
	function updateGraph(data) {

		$.plot($("#houravgpermonth"), data, 
				{ 
				series: { curvedLines: { active: true } },
				grid: {clickable: false, hoverable: true},
				xaxes: [ {tickSize: 1, tickFormatter: function (val, axis) { return val.toFixed(0)}} ],
				yaxes: [ { min:0, position: "right"} ]
				});	

	};
	
	dataservice(updateGraph)
	
}]);