/**
 * 
 */

controllers.controller('MeasurementCtrl', ['$scope', '$interval', function ($scope, $interval) {
	
	$scope.period = "dit is een test";
	$scope.dailyavg = "4.88 kWh";
	$scope.pvoutput = "0 kW";
	$scope.usage = "0 kW";
	$scope.energydraw = "0 kW";
	$scope.usage = "0 kW";
	$scope.sunup = "8 - 8";
	$scope.temeperature = "";
	$scope.sky = "Clear";

	updateMeasurements = function() {
		$.getJSON("http://88.159.81.18/dashboard/data/measurementstats.php")
		.done(function(data) {
			var start = new Date(data.firstMeasurement);
			var end = new Date(data.lastMeasurement);
			if ($("#bt-kwh").hasClass("active")) {
				totalKwh.goToNumber(data.totalPulses/1600.0);
			} else {
				totalKwh.goToNumber(data.totalEarned);
			}
			$scope.period = ("" + start.getDate()+"-"+(start.getMonth()+1)+"-"+start.getFullYear() + "  -  " + end.getDate()+"-"+(end.getMonth()+1)+"-"+end.getFullYear());
			$scope.dailyavg = ((data.avgPulses/1600.0).toFixed(2) + " kWh");
			$scope.sunup = (data.sunrise + " - " + data.sunset);
			
		})
		.fail(function() { console.log("measurementstats.php failed");})
		
		$.getJSON("http://88.159.81.18/dashboard/data/watts.php")
		.done(function(data) { 
			$scope.pvoutput = ((data) + " W");
		})
		.fail(function() { 
			console.log("watts.php failed");
		})
	}
	
	// start periodic checking
	$interval(updateMeasurements, 60000);
	
	updateMeasurements();
}]);