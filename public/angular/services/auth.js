'use strict';

angular.module('app').factory('authService', function($rootScope, $http, $location){
    var service = {};

    service.redirectToLogin = function(storeCurrentPage){
        if (storeCurrentPage) $rootScope.redirectTo = $location.path();
        $location.path('/login');
    };

    service.redirectAfterLogin = function(){
        // redirect to previous page or dashboard by default
        if ($rootScope.redirectTo){
            var redirectTo = $rootScope.redirectTo;
            delete $rootScope.redirectTo;
            $location.path(redirectTo);
        } else {
            $location.path('/');
        }
    };

    /**
     * Stores authentication info in client-side "session"
     */
    service.login = function(user, token){
        $rootScope.user = user;
        $http.defaults.headers.common['Authorization'] = token;
    };

    /**
     * Destroys client-side "session"
     */
    service.logout = function(){
        delete $rootScope.user;
        delete $http.defaults.headers.common['Authorization'];
    };

    /**
     * Returns true if a user is logged in.
     * @param user (optional) : user to check against logged user
     */
    service.isLoggedIn = function(user){
        if (!$rootScope.user) return false;
        if (!user) return true;
        return (user._id == $rootScope.user._id);
    };

    /**
     * Returns true if logged user is administrator
     */
    service.isAdmin = function(){
        if (!$rootScope.user) return false;
        return $rootScope.user.isAdmin;
    };

    /**
     * Returns logged user's name
     */
    service.getUserName = function(){
        if (!$rootScope.user) return '';
        return $rootScope.user.displayName;
    };

    return service;
});
