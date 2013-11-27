'use strict';

angular.module('app').controller('PeopleCtrl', function($scope, authService, Restangular, $modal){

    $scope.Users = Restangular.all('users');
    $scope.Users.getList().then(function(users) {
        $scope.users = users;
    });

    $scope.errors = [];

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

    $scope.editUser = function(user){
        $modal.open({
            templateUrl: 'static/partials/people/user.html',
            backdrop: 'static',
            keyboard: false,
            controller: 'EditUserCtrl',
            resolve: {
                user: function () { return user; }
            }
        }).result.then(function (user) {
            $scope.users[_.findIndex($scope.users, { '_id': user._id })] = user;
        });

    };

    $scope.deleteUser = function(user){
        user.remove().then(function(){
            _.remove($scope.users, { _id: user._id });
        }, function(response){
            $scope.errors.push(response.data.error);
        });
    };

    $scope.isLoggedIn = authService.isLoggedIn;
    $scope.isAdmin = authService.isAdmin

});

angular.module('app').controller('CreateUserCtrl', function ($scope, Restangular, $modalInstance) {
    $scope.title = 'Add a member';
    $scope.user = {};
    $scope.processing = false;
    $scope.error = '';

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.saveUser = function(){
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

angular.module('app').controller('EditUserCtrl', function ($scope, user, Restangular, $modalInstance) {
    $scope.title = 'Edit member\'s details';
    $scope.user = Restangular.copy(user);
    $scope.processing = false;
    $scope.error = '';

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.saveUser = function(){
        $scope.error = '';
        $scope.processing = true;

        $scope.user.put()
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

