'use strict';

angular.module('app').controller('NavbarCtrl', function($scope, $location){
    $scope.links = [
        { name: 'Dashboard', href: '#/', icon: 'icon-dashboard', active: true },
        { name: 'People', href: '#/people', icon: 'icon-group' },
        { name: 'Projects', href: '#/projects', icon: 'icon-tasks' }
    ];

    $scope.$on('$routeChangeSuccess', function () {
        angular.forEach($scope.links, function(link) {
            link.active = ('#'+$location.path() == link.href);
        });
    });
});
