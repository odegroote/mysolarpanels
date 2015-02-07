/**
 * 
*/

solarapp.directive('spRow', function() {
    return {
    	restrict: 'E',
    	templateUrl: 'templates/sprow.html',
    	replace: false,
    	transclude: true,
    	scope: {
    		title: '@'
    	}
    };
  });