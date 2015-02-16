spServices.factory('MeasurementStatsService', ['$http', '$log', function($http, $log) {

	return function HourAvgPerMonthChart(url, updateStats) {
		
		$http.get(url)
				.success(function(data) { updateStats(data); })
				.error(function() { $log.log(url + " failed"); });		
	}
}]);