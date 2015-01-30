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
                          controller: 'RowController'
                        }).
                        when('/graphs', {
                          templateUrl: '/dashboard/graphs.html',
                          controller: 'RowController'
                        }).
                        when('/gallery', {
                            templateUrl: '/dashboard/gallery.html',
                            controller: 'RowController'
                          }).
                        otherwise({
                          redirectTo: '/home'
                        });
                    }]);