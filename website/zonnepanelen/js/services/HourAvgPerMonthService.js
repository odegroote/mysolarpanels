spServices.factory('HourAvgPerMonthService', ['$http', '$q', function($http, $q) {

	var serviceUrl = "http://88.159.81.18/dashboard/data/houravgpermonth.php";

	function getSeries (data) {

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
	  
	return function HourAvgPerMonthChart() {
		
		return $http.get(serviceUrl).then(
				function(response) {  return getSeries(response.data); },
				function() { return $q.reject(serviceUrl + " failed"); });		
	}
}]);