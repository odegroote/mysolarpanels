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
});