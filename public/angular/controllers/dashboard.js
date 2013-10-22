'use strict';

angular.module('app').controller('DashboardCtrl', function($scope){

    $scope.widgets=[
        {
            id:0,
            type: 'chat'
        },
        {
            id:1,
            type: 'chat'
        },
        {
            id:2,
            type: 'sprint'
        },
        {
            id:3,
            type: 'sprint'
        }

    ];

    $scope.getTemplateUrl = function(widget){
        return 'partials/dashboard/widgets/'+widget.type+'.html';
    }
});
