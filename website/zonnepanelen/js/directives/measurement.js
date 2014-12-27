/**
 * 
*/

solarapp.directive('spMeasurement', function() {
    return {
    	restrict: 'E',
    	templateUrl: 'templates/spmeasurement.html',
    	replace: true,
    	transclude: true,
    	scope: {
    		label: '@',
    		idvalue: '@'
    	}
    };
  });