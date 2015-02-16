/**
 * 
 */

'use strict';

var spControllers = angular.module('spControllers', []);
var spServices = angular.module('spServices', []);

var solarapp = angular.module('solarApp', [
 'ngRoute',
 'spControllers',
 'spServices'
]);

solarapp.config(['$routeProvider',
                    function($routeProvider) {
                      $routeProvider.
                        when('/home', {
                          templateUrl: '/dashboard/home.html',
                        }).
                        when('/graphs', {
                          templateUrl: '/dashboard/graphs.html',
                        }).
                        when('/gallery', {
                            templateUrl: '/dashboard/gallery.html',
                          }).
                        otherwise({
                          redirectTo: '/home'
                        });
                    }]);