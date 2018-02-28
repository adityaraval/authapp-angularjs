(function (angular) {
    //var SERVERURL = "http://localhost:3000/api/"
    var SERVERURL = "https://authapp-angularjs.herokuapp.com/api/";

    var app = angular.module('myAPP', ['ui.router', 'ui-notification','angular-loading-bar']).config(function ($stateProvider,cfpLoadingBarProvider) {
        var profileState = {
            name: 'profile',
            url: '/profile',
            views: {
                'rightSide': {
                    templateUrl: 'profile/profile.html',
                    'controller': 'profileController'
                }
            }
        }

        var projectState = {
            name: 'project',
            url: '/project',
            views: {
                'rightSide': {
                    templateUrl: 'project/project.html',
                    'controller': 'projectController'
                }
            }
        }

        var todoState = {
            name: 'todo',
            url: '/todo',
            views: {
                'rightSide': {
                    templateUrl: 'todo/todo.html',
                    'controller': 'todoController'
                }
            }
        }
        $stateProvider.state(profileState);
        $stateProvider.state(projectState);
        $stateProvider.state(todoState);

        cfpLoadingBarProvider.includeSpinner = true;

    }).run(['$rootScope', '$timeout', 'Notification', '$state', '$stateParams', function ($rootScope, $timeout, Notification, $state, $stateParams) {
        $rootScope.global = "Global";


        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            $("#ui-view").html("");
            $(".page-loading").removeClass("hidden");
            $timeout(function () {
                var sock = new SockJS('/echo',{sessionId:function(){return $state.current.name} });
                sock.onopen = function () {
                    console.log('open');
                    sock.send($state.current.name+$rootScope.token._id);
                };
                sock.onmessage = function (e) {
                    var parsedObj = JSON.parse(e.data);
                    console.log(parsedObj);
                    //broadcast notifiction
                    if($state.current.name==="profile"){
                            $rootScope.$broadcast("sendNotificationProfile", {
                                message: parsedObj.fullname+" has updated his profile",
                                data:parsedObj
                            });
                    }
                    if($state.current.name==="project"){
                            $rootScope.$broadcast("sendNotificationProject", {
                                message: $rootScope.token.fullname+" has added new project",
                                data:parsedObj
                            });
                    }
                };
                sock.onclose = function () {
                    console.log('close');
                };
            }, 1000);

        });

        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $(".page-loading").addClass("hidden");
        });

        //notification $on
        $rootScope.$on('sendNotificationProfile', function (e, opt) {
            if($rootScope.token._id===opt.data._id){
                if($state.current.name==="profile")
                    Notification.primary(opt.message);
            }
        });

        $rootScope.$on('sendNotificationProject', function (e, opt) {
            if($rootScope.token._id===opt.data.user_id){
                if($state.current.name==="project")
                    Notification.primary(opt.message);
            }
        });



        if (localStorage.getItem('token')) {
            $rootScope.token = JSON.parse(localStorage.getItem('token'));

        } else if (!$rootScope.token) {
            location.href = '../login.html';
        }
        else {
            location.href = '../login.html';
        }
    }]);



    //navController starts
    app.controller('navController', ['$scope', '$rootScope', '$http', 'Notification', function ($scope, $rootScope, $http, Notification) {
        //Notification.primary('Primary notification');
        $scope.logoutAPP = function () {
            localStorage.setItem('token', "");
            location.href = '../login.html';
        }
    }]);
    //navController ends
})(angular);