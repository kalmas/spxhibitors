'use strict';

window.angular.module('myApp', ['afkl.lazyImage'])

.controller('ApplicationController', ['$scope', '$http',
function($scope, $http) {
  
    $scope.predicate = 'ln';
    $scope.reverse = false;
    $scope.order = function(predicate) {
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;
    };
    
  
    $http.get('/out.json').then(function(response) {
        // console.log(response)
        $scope.exhibitors = response.data;
    });
}]);