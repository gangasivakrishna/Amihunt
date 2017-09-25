`use strict`;
let app = angular.module('sprof', ['ngRoute'])
.config(($routeProvider, $locationProvider) => {
  $routeProvider
  .when('/', {
  });
  // .otherwise({ redirectTo: '/home' });
  $locationProvider.html5Mode(true);
});