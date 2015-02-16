'use strict'

spControllers.controller('MeasurementController', ['$scope', '$interval', 'MeasurementStatsService', function ($scope, $interval, dataService) {
	
	$scope.period = "-";
	$scope.dailyavg = "0 kWh";
	$scope.pvoutput = "0 kW";
	$scope.totalPulses = 0;
	$scope.totalEarned = 0;
	$scope.usage = "- kW";
	$scope.energydraw = "- kWh";
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
	};

	$scope.euroClick = function(e) {
		e.preventDefault();
		$scope.totalKwh.goToNumber($scope.totalEarned);
	};
	
	function updateStats(data) {
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
	};
	
	function updatePVOutput(data) { 
		$scope.pvoutput = (data + " W");
	}
	
	function updateWeather(data) { 
		$scope.temperature = data.main.temp.toFixed(0);
		$scope.sky = data.weather[0].description;
		$("#weather").css("background", "url(http://openweathermap.org/img/w/" + data.weather[0].icon + ".png) no-repeat");
	}
	
	function updateMeasurements() {
		dataService("http://88.159.81.18/dashboard/data/measurementstats.php", updateStats);
		
		dataService("http://88.159.81.18/dashboard/data/watts.php", updatePVOutput);

		dataService("http://api.openweathermap.org/data/2.5/weather?id=2756253&units=metric", updateWeather)
	}

	// lets get the initial values
	updateMeasurements();

	// start periodic checking
	$interval(updateMeasurements, 60000);
}]);