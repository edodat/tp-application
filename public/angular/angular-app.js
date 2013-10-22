'use strict';

angular.module('app', ['ui.bootstrap', 'restangular'])
    .config(function($routeProvider, RestangularProvider) {
        // configure routes
        $routeProvider
            .when('/',  { templateUrl: 'partials/dashboard/', controller: 'DashboardCtrl' })
            .when('/activate',  { templateUrl: 'partials/activation/', controller: 'ActivationCtrl' })
            .otherwise({ redirectTo: '/' });

        // Use Mongo "_id" instead of "id"
        RestangularProvider.setRestangularFields({
            id: '_id'
        });

    })
;