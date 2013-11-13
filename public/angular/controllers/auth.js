'use strict';

angular.module('app').controller('AuthCtrl', function($scope, $modal){

    $modal.open({
        templateUrl: 'loginModal',
        windowClass: 'narrow', // custom css class to change modal width
        backdrop: 'static',
        keyboard: false,
        controller: 'LoginFormCtrl'
    });

});

angular.module('app').controller('LoginFormCtrl', function ($scope, $rootScope, $routeParams, $http, $location, Restangular, $modalInstance) {
    $scope.user = {};
    $scope.state = '';
    $scope.processing = false;
    $scope.error = '';

    var userId = $routeParams.userId;
    var token = $routeParams.token;
    if (userId){
        $scope.state = 'TOKEN';
        $scope.processing = true;

        Restangular.allUrl('auth/set/validate').post({ user: userId, token: token })
            .then(
            function success(response){
                $scope.processing = false;
                $scope.user.email = response.email
                $scope.state = 'SET FORM';
            },
            function error(response){
                $scope.processing = false;
                $scope.error = response.data.error;
                $scope.state = 'INVALID TOKEN';
            }
        );
    } else {
        $scope.state = 'FORM';
    }

    $scope.login = function () {
        $scope.error = '';
        $scope.processing = true;

        Restangular.allUrl('auth/login').post($scope.user)
            .then(
            function success(response){
                $rootScope.user = response.user;
                $rootScope.token = response.token;
                $http.defaults.headers.common['Authorization'] = $rootScope.token;

                $scope.processing = false;
                $modalInstance.close();

                // redirect to dashboard
                $location.path('/');
            },
            function error(response){
                $scope.processing = false;
                $scope.error = response.data.error;
            }
        );
    };

    $scope.resetPassword = function () {
        $scope.error = '';
        if (!$scope.user.email) {
            $scope.error = 'Please enter your email address';
        } else {
            $scope.processing = true;
            Restangular.allUrl('auth/reset').post({ email: $scope.user.email })
                .then(
                function success(){
                    $scope.processing = false;
                    $scope.state = 'RESET';
                },
                function error(response){
                    $scope.processing = false;
                    $scope.error = response.data.error;
                }
            );
        }
    };

    $scope.setPassword = function () {
        $scope.error = '';
        $scope.processing = true;
        Restangular.allUrl('auth/set').post({ email: $scope.user.email, password: $scope.user.password, token: token })
            .then(
            function success(response){
                $scope.processing = false;
                $scope.state = 'SET FORM';

                // Perform login automatically
                $scope.login();
            },
            function error(response){
                $scope.processing = false;
                $scope.error = response.data.error;
            }
        );
    };

});

