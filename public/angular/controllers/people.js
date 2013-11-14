'use strict';

angular.module('app').controller('PeopleCtrl', function($scope, Restangular, $modal){

    $scope.Users = Restangular.all('users');
    $scope.Users.getList().then(function(users) {
        $scope.users = users;
    });

    $scope.createUser = function(){
        $modal.open({
            templateUrl: 'static/partials/people/user.html',
            backdrop: 'static',
            keyboard: false,
            controller: 'CreateUserCtrl'
        }).result.then(function (user) {
            $scope.users.push(user);
        });
    };

    $scope.isAdmin = function(user){
        return (user.roles.indexOf('admin') > -1);
    };
});

angular.module('app').controller('CreateUserCtrl', function ($scope, Restangular, $modalInstance) {
    $scope.user = {};
    $scope.processing = false;
    $scope.error = '';

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.createUser = function(){
        $scope.error = '';
        $scope.processing = true;

        Restangular.all('users').post($scope.user)
        .then(
            function success(response){
                $scope.processing = false;
                $modalInstance.close(response);
            },
            function error(response){
                $scope.processing = false;
                $scope.error = response.data.error;
            }
        );
    };

});

