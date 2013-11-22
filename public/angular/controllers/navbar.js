'use strict';

angular.module('app').controller('NavbarCtrl', function($scope, $location, authService){
    $scope.links = [
        { name: 'Dashboard', href: '#/', icon: 'icon-dashboard icon-large', active: true },
        { name: 'People', href: '#/people', icon: 'icon-group icon-large' },
        { name: 'Projects', href: '#/projects', icon: 'icon-tasks icon-large' }
    ];

    $scope.$on('$routeChangeSuccess', function () {
        angular.forEach($scope.links, function(link) {
            link.active = ('#'+$location.path() == link.href);
        });
    });

    $scope.isLoggedIn = authService.isLoggedIn;
    $scope.isAdmin = authService.isAdmin
    $scope.getUserName = authService.getUserName;

    $scope.logout = function(){
        authService.logout();
        $location.path('/login');
    }

    $scope.editProfile = function(){
        //TODO
    }

});
