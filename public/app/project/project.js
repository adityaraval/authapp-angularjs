(function (angular) {
    //var SERVERURL = "http://localhost:3000/api/"
    var SERVERURL = "https://authapp-angularjs.herokuapp.com/api/";
    var app = angular.module('myAPP');

    //projectController starts
    app.controller('projectController', ['$scope', '$rootScope', '$http', 'projectService','Notification','RProjectList', function ($scope, $rootScope, $http, projectService,Notification,RProjectList) {

        $scope.showProjectForm = false;
        $scope.projectList = RProjectList;

        //notification $on
        $rootScope.$on('sendNotificationProject', function (e, opt) {
            if($rootScope.token._id===opt.data.user_id){
                console.log(true);
                Notification.primary(opt.message);
                $scope.$apply(function () {
                    $scope.projectList.push(opt.data);
                });
            }
        });

        $scope.addProject = function () {
            var addObject = JSON.stringify({title: $scope.projectTitle});
            projectService.addProj($rootScope.token.token, addObject).then(function (response) {
                //$scope.projectList.push(response[0]);
                console.log(response)
                if(typeof response==='undefined'){
                        swal("Oh!", "Please specify project title!", "warning");
                }else{
                    $scope.showProjectForm = false;
                    swal("Good job!", "New project is added to the board!", "success");
                }
            }, function (error) {

            });
        }

        $scope.displayProjectForm = function () {
            $scope.showProjectForm = true;
            $scope.projectTitle = "";

        }
        $scope.hideProjectForm = function () {
            $scope.showProjectForm = false;
        }
    }]);
    //projectController ends

    //projectService starts
    app.service('projectService', ['$http', function ($http) {
        this.addProj = function (token, addObject) {
            return $http.post(SERVERURL + 'project/?access_token=' + token, addObject).then(
                function (response) {
                    return response.data.data;
                }, function (error) {
                    if (error.data === "Unauthorized") {
                        location.href = '../../login.html';
                    }
                });
        }

        this.getAllProjects = function (token) {
            return $http.get(SERVERURL + 'project?access_token=' + token).then((response) => {
                return response.data.data;
            }, (error) => {
                if (error.data === "Unauthorized") {
                    location.href = '../../login.html';
                }
            });
        }
    }]);
    //projectService ends

})(angular);