(function(){
    //var SERVERURL = "http://localhost:3000/api/"
    var SERVERURL = "https://authapp-angularjs.herokuapp.com/api/";

    var app = angular.module('myAPP',['ui.router']).run(['$rootScope',function($rootScope){
        $rootScope.global = "Global";
        if(localStorage.getItem('token')){
            $rootScope.token = JSON.parse(localStorage.getItem('token'));
        }else if(!$rootScope.token){
            location.href = '../login.html';
        }
        else{
            location.href = '../login.html';
        }
    }]);

    app.config(function($stateProvider){
        var helloState = {
            name: 'home',
            url: '/home',
            views:{
              'leftSide':{
                templateUrl:'home.html'
              }
            }
          }
        
          var aboutState = {
            name: 'about',
            url: '/about',
            views:{
              'leftSide':{
                templateUrl:'about.html'
              }
            }
          }
          var profileState = {
            name: 'profile',
            url: '/profile',
            views:{
              'rightSide':{
                templateUrl:'profile.html',
                'controller':'profileController'
              }
            }
          }

          var projectState = {
            name: 'project',
            url: '/project',
            views:{
              'rightSide':{
                templateUrl:'project.html',
                'controller':'projectController'
              }
            }
          }

          var todoState = {
            name: 'todo',
            url: '/todo',
            views:{
              'rightSide':{
                templateUrl:'todo.html',
                'controller':'todoController'
              }
            }
          }



          $stateProvider.state(helloState);
          $stateProvider.state(aboutState);
          $stateProvider.state(profileState);
          $stateProvider.state(projectState);
          $stateProvider.state(todoState);



    });

    //navController starts
    app.controller('navController',['$scope','$rootScope','$http',function($scope,$rootScope,$http){
        $scope.logoutAPP = function(){
            localStorage.setItem('token',"");
            location.href = '../login.html';
        }
    }]);
    //navController ends

    //profileController starts
    app.controller('profileController',['$scope','$rootScope','$http','profileService',function($scope,$rootScope,$http,profileService){
        
        $scope.isEditable = false;
        
        profileService.getUserProfile($rootScope.token.token).then(function(response){
            $scope.UserProfile = response;
        },(error)=>{
            
        });

        $scope.makeisEditableTrue = function(){
            $scope.isEditable = true;
        }
        $scope.makeisEditableFalse = function(){
            $scope.isEditable = false;
        }

        $scope.saveUserProfile = function(_id,fullname,address,phone,mobile){
            var updateObj = JSON.stringify({fullname:fullname,address:address,phone:phone,mobile:mobile});

            profileService.upodateUserProfile($rootScope.token.token,_id,updateObj).then(function(response){
                $scope.UserProfile = response;
                $scope.isEditable = false;
                //toast custom
                var toastHTML = '<span>Profile Updated Successfully!</span><button class="btn-flat toast-action" ng-click="dismissToast()">Dismiss</button>';
                M.toast({html: toastHTML});
              

            },(error)=>{
                
            });
        }

        $scope.dismissToast = function(){
            M.Toast.dismissAll();
        }
        
    }]);
    //profileController ends

    //profileService starts
    app.service('profileService', ['$http',function($http){
        this.getUserProfile = function(token){
            return $http.get(SERVERURL+'profile?access_token='+token).then(function(response){
                return response.data.data;    
            },function(error){
                console.log(error);
            });
        }

        this.upodateUserProfile = function(token,id,updateObj){
            return $http.patch(SERVERURL+'profile/'+id+'?access_token='+token,updateObj).then(function(response){
                return response.data.data;    
            },function(error){
                console.log(error);
            });
        }
    }]);
    //profileService ends

    //projectController starts
    app.controller('projectController',['$scope','$rootScope','$http','projectService',function($scope,$rootScope,$http,projectService){
        
        $scope.showProjectForm=false;
        projectService.getAllProjects($rootScope.token.token).then(function(response){
            $scope.projectList = response
        },function(error){

        });
    
        $scope.addProject = function(){
            var addObject = JSON.stringify({title:$scope.projectTitle});
            projectService.addProj($rootScope.token.token,addObject).then(function(response){
                    $scope.projectList.push(response[0]);
                    $scope.showProjectForm = false;
                    swal("Good job!", "New project is added to the board!", "success");
            },function(error){

            });
        }
    
        $scope.displayProjectForm = function(){
            $scope.showProjectForm = true;
            $scope.projectTitle = "";
    
        }
        $scope.hideProjectForm = function(){
            $scope.showProjectForm = false;
        }
    }]);
    //projectController ends

    //projectService starts
    app.service('projectService',['$http',function($http){
        this.addProj = function(token,addObject){
            return $http.post(SERVERURL+'project/?access_token='+token,addObject).then(
                function(response){
                    return response.data.data;    
                },function(error){
                    console.log(error);
                });
        }

        this.getAllProjects = function(token){
            return $http.get(SERVERURL+'project?access_token='+token).then((response)=>{
                return response.data.data;
            },(error)=>{
                $scope.error = "Error";
            });
        }
    }]);
    //todoController ends

    //
    app.controller('todoController',['$scope','$rootScope','$http','projectService',function($scope,$rootScope,$http,projectService){

    }]);
    //


})();