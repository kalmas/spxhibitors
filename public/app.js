'use strict';

window.angular.module('myApp', ['afkl.lazyImage', 'infinite-scroll'])

.controller('ApplicationController', ['$scope', '$http', '$window',
function($scope, $http, $window) {
    $scope.displayed = [];
    $scope.count = 0;
    $scope.scrollDisabled = true;
    $scope.predicate = 'l';
    $scope.reverse = false;
    
    $http.get('/small.json').then(function(response) {
        $scope.displayed = response.data;
        
        $scope.addResults();
        $scope.scrollDisabled = false;
    });
    
    $scope.addResults = function() {
        if ($scope.count < $scope.displayed.length) {
            $scope.count += 20;
        } else {
            $scope.scrollDisabled = true;
        }
    };
      
    $scope.order = function(predicate) {
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;
    };
}])

.filter('customOrderBy', ['$window', function($window) {
    return function(items, field, reverse) {
        
        var sorted = [];
        $window.angular.forEach(items, function(item) {
            sorted.push(item);
        });
    
        sorted.sort(function (a, b) {
            if (!a[field]) { return 1; }
          
            if (!b[field]) { return -1; }
          
            return (a[field] > b[field] ? 1 : -1);
        });
    
        if(reverse) { sorted.reverse(); }
    
      return sorted;
  };
}])

.filter('customSearch', ['$window', function($window) {
    return function(items, searchTerm) {
      if (!searchTerm) { return items; }
    
      var filtered = [];
      var needle = searchTerm.toLowerCase();
      $window.angular.forEach(items, function(item) {
          var haystack = (item.f + ' ' + item.l).toLowerCase();
          if (haystack.indexOf(needle) > -1) {
              filtered.push(item);
          }
      });
    
    return filtered;
  };
}])

.filter('scrollHack', ['$window', function($window) {
    return function(items) {
      // Fake scroll.
      $window.angular.element($window).triggerHandler('scroll');
    
      return items;
  };
}]);
