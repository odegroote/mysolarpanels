/**
 * 
 */

var solarapp = angular.module('solarApp', [
 'ngRoute',
 'spControllers'
]);

solarapp.config(['$routeProvider',
                    function($routeProvider) {
                      $routeProvider.
                        when('/home', {
                          templateUrl: 'home.html',
                          controller: 'RowCtrl'
                        }).
                        when('/graphs', {
                          templateUrl: 'graphs.html',
                          controller: 'RowCtrl'
                        }).
                        otherwise({
                          redirectTo: '/home'
                        });
                    }]);

var controllers = angular.module('spControllers', []);