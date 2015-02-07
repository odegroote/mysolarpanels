/**
 * 
 */

'use strict';

spControllers.controller('RowController',['$scope', function ($scope) {
	$scope.minmaxToggle = function(e) {
			e.preventDefault();
			var target = $(e.currentTarget).parent().parent().next('.box-content');
			if(target.is(':visible')) 
				$('i',$(e.currentTarget)).removeClass('icon-chevron-up').addClass('icon-chevron-down');
			else 					   
				$('i',$(e.currentTarget)).removeClass('icon-chevron-down').addClass('icon-chevron-up');
			target.slideToggle();
	}
}]);