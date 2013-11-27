'use strict';

angular.module('app', ['ui.bootstrap', 'restangular'])
    .config(function($routeProvider, $httpProvider, RestangularProvider) {
        // configure routes
        $routeProvider
            .when('/activate/:token',       { templateUrl: 'static/partials/activation/',   controller: 'ActivationCtrl', noAuth: true })
            .when('/login/:userId/:token',  { templateUrl: 'static/partials/auth/',         controller: 'LoginCtrl', noAuth: true })
            .when('/login',                 { templateUrl: 'static/partials/auth/',         controller: 'LoginCtrl', noAuth: true })
            .when('/',                      { templateUrl: 'static/partials/dashboard/',    controller: 'DashboardCtrl' })
            .when('/people',                { templateUrl: 'static/partials/people/',       controller: 'PeopleCtrl' })
            .when('/projects',              { templateUrl: 'static/partials/projects/',     controller: 'ProjectsCtrl' })
            .otherwise({ redirectTo: '/' });

        // On AJAX calls return, intercept 401 errors to redirect to login page
        $httpProvider.responseInterceptors.push(function($q, $location, $rootScope) {
            return function(promise) {
                return promise.then(
                    // Success: just return the response
                    function(response){
                        return response;
                    },
                    // Error: check the error status to get only the 401
                    function(response) {
                        if (response.status === 401){
                            //TODO authService.logout(). Problem : cannot inject authService in this function (circular dependency between $http and $httpProvider).
                            delete $rootScope.user;
                            $location.path('/login');
                        }
                        return $q.reject(response);
                    }
                );
            }
        });

        // Use Mongo "_id" instead of "id"
        RestangularProvider.setRestangularFields({
            id: '_id'
        });

        // Prefix all API URLs with /api
        RestangularProvider.setBaseUrl('/api');

    })
    .run(function($rootScope, authService){
        // On changing route, redirect to login if no user in $rootScope
        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            if (!authService.isLoggedIn() && !next.noAuth) {
                console.log('Redirection to login page');
                authService.redirectToLogin(true);
            }
        });

    })
;