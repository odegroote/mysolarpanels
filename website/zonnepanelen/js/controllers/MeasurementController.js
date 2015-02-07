'use strict'

spControllers.controller('MeasurementController', ['$scope', '$interval', function ($scope, $interval) {
	
	$scope.period = "-";
	$scope.dailyavg = "0 kWh";
	$scope.pvoutput = "0 kW";
	$scope.totalPulses = 0;
	$scope.totalEarned = 0;
	$scope.usage = "- kW";
	$scope.energydraw = "- kW";
	$scope.sunup = "-";
	$scope.temperature = "";
	$scope.sky = "";
	
	// Set up odometer for total produced
	$scope.totalKwh = $('#totalKwh').jOdometer({
	                increment: 0, 
	                counterStart:'0.0', 
	                numbersImage: '/dashboard/zonnepanelen/images/odometer/jodometer-numbers-24pt.png', 
	                widthNumber: 32,
	                heightNumber: 54,
	                spaceNumbers: 0, 
	                offsetRight:-10,
	                speed:1000,
	                delayTime: 300,
	                maxDigits: 10,
	});

	// Setup production buttons
	$scope.kwhClick = function(e) {
		e.preventDefault();
		$scope.totalKwh.goToNumber($scope.totalPulses/1600.0);
	}

	$scope.euroClick = function(e) {
		e.preventDefault();
		$scope.totalKwh.goToNumber($scope.totalEarned);
	}
	

	function updateMeasurements() {
		$.getJSON("http://88.159.81.18/dashboard/data/measurementstats.php")
		.done(function(data) {
			var start = new Date(data.firstMeasurement);
			var end = new Date(data.lastMeasurement);
			$scope.totalPulses = data.totalPulses;
			$scope.totalEarned = data.totalEarned;
			if ($("#bt-kwh").hasClass("active")) {
				$scope.totalKwh.goToNumber(data.totalPulses/1600.0);
			} else {
				$scope.totalKwh.goToNumber(data.totalEarned);
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

		$.getJSON("http://api.openweathermap.org/data/2.5/weather?id=2756253&units=metric")
		.done(function(data) { 
			$scope.temperature = data.main.temp.toFixed(0);
			$scope.sky = data.weather[0].description;
			$("#weather").css("background", "url(http://openweathermap.org/img/w/" + data.weather[0].icon + ".png) no-repeat");
		})
		.fail(function() { console.log("http://api.openweathermap.org failed");})
	}
	
	// start periodic checking
	$interval(updateMeasurements, 60000);
	
	updateMeasurements();
}]);