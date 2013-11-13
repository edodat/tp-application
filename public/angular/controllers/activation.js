'use strict';

angular.module('app').controller('ActivationCtrl', function($scope, $routeParams, $modal){

    $modal.open({
        templateUrl: 'activationModal',
        backdrop: 'static',
        keyboard: false,
        controller: 'ActivationFormCtrl'
    });
});

angular.module('app').controller('ActivationFormCtrl', function ($scope, $routeParams, $modalInstance, Restangular) {
    var token = $routeParams.token;

    $scope.sendActivationEmail = function () {
        $scope.error = '';
        Restangular.allUrl('sendactivationemail').post()
            .then(
            function success(){
                $scope.state = 'SENT';
            },
            function error(response){
                $scope.error = response.data.error;
            }
        );
    };

    if (!token) {
        $scope.state = 'NO TOKEN';
    } else {
        // initiate account activation
        $scope.state = 'ACTIVATING';
        $scope.error = '';

        Restangular.allUrl('activate').post({ token: token })
            .then(
            function success(response){
                $scope.state = 'ACTIVE';
            },
            function error(response){
                $scope.state = 'INVALID TOKEN';
                $scope.error = response.data.error;
            }
        );
    }

});

