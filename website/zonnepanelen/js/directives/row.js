/**
 * 
*/

solarapp.directive('spRow', function() {
    return {
    	restrict: 'E',
    	templateUrl: 'templates/sprow.html',
    	replace: true,
    	transclude: true,
    	scope: {
    		title: '@'
    	}
    };
  });