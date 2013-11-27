'use strict';

angular.module('app').controller('ProjectsCtrl', function($scope, Restangular){

    var Projects = Restangular.all('projects');

    Projects.getList().then(function(projects) {
        $scope.projects = projects;
    });

    $scope.errors = [];
    var editing = -1;

    $scope.resetCreateForm = function(){
        $scope.newProject = {};
        $scope.isCreating = false;
    }

    $scope.displayCreateForm = function(){
        $scope.resetEditForm();
        $scope.isCreating = true;
    };

    $scope.createProject = function(){
        Projects.post($scope.newProject)
        .then(function (project) {
            $scope.projects.push(project);
            $scope.resetCreateForm();
        }, function(response){
            $scope.errors.push(response.data.error);
        });
    };

    $scope.resetEditForm = function(){
        $scope.editingProject = {};
        editing = -1;
    }

    $scope.displayEditForm = function(project){
        $scope.resetCreateForm();
        editing = project._id;
        $scope.editingProject = Restangular.copy(project);
    };

    $scope.isEditing = function(project){
        return (editing == project._id);
    };

    $scope.saveProject = function(project){
        project.put()
        .then(function(){
            $scope.projects[_.findIndex($scope.projects, { '_id': project._id })] = project;
            $scope.resetEditForm();
        }, function(response){
            $scope.errors.push(response.data.error);
        });
    };

    $scope.deleteProject = function(project){
        project.remove().then(function(){
            _.remove($scope.projects, { _id: project._id });
        }, function(response){
            $scope.errors.push(response.data.error);
        });
    };

});