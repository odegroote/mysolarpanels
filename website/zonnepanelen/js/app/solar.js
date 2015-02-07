/**
 * 
 */

'use strict';

var spControllers = angular.module('spControllers', []);

var solarapp = angular.module('solarApp', [
 'ngRoute',
 'spControllers'
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