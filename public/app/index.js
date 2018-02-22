(function(){
    //var SERVERURL = "http://localhost:3000/api/"
    var SERVERURL = "https://authapp-angularjs.herokuapp.com/api/";

    var app = angular.module('myAPP',['ui.router','ui-notification']).run(['$rootScope','$timeout','Notification','$state',function($rootScope,$timeout,Notification,$state){
        $rootScope.global = "Global";

        //notification $on
        $rootScope.$on('sendNotification',function (e,opt) {
            Notification.primary(opt.message);
        });

        if(localStorage.getItem('token')){
            $rootScope.token = JSON.parse(localStorage.getItem('token'));

            $timeout(function () {
                var sock = new SockJS('/echo');
                sock.onopen = function() {
                    console.log('open');
                    //sock.send('test');
                };
                sock.onmessage = function(e) {
                    console.log('message', e.data);

                    //broadcast notifiction
                    $timeout(function () {
                        $rootScope.$broadcast("sendNotification",{
                            message:e.data
                        });
                    },1000);
                };
                sock.onclose = function() {
                    console.log('close');
                };
            },1000);

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
    app.controller('navController',['$scope','$rootScope','$http','Notification',function($scope,$rootScope,$http,Notification){
        //Notification.primary('Primary notification');
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
            if(error.data==="Unauthorized"){
                location.href = '../login.html';
            }
        });

        $scope.makeisEditableTrue = function(){
            $scope.isEditable = true;
        }
        $scope.makeisEditableFalse = function(){
            $scope.isEditable = false;
        }

        $scope.saveUserProfile = function(_id,fullname,address,phone,mobile){
            var updateObj = JSON.stringify({fullname:fullname,address:address,phone:phone,mobile:mobile});

            profileService.updateUserProfile($rootScope.token.token,_id,updateObj).then(function(response){
                $scope.UserProfile = response;
                $scope.isEditable = false;
                swal("Good job!", "Profile updated successfully!", "success");
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
                if(error.data==="Unauthorized"){
                    location.href = '../login.html';
                }
            });
        }

        this.updateUserProfile = function(token,id,updateObj){
            return $http.patch(SERVERURL+'profile/'+id+'?access_token='+token,updateObj).then(function(response){
                return response.data.data;
            },function(error){
                if(error.data==="Unauthorized"){
                    location.href = '../login.html';
                }
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
                    if(error.data==="Unauthorized"){
                        location.href = '../login.html';
                    }
                });
        }

        this.getAllProjects = function(token){
            return $http.get(SERVERURL+'project?access_token='+token).then((response)=>{
                return response.data.data;
            },(error)=>{
                if(error.data==="Unauthorized"){
                    location.href = '../login.html';
                }
            });
        }
    }]);
    //projectService ends

    //todoController starts
    app.controller('todoController',['$scope','$rootScope','$http','todoService','$stateParams','$state','projectService',function($scope,$rootScope,$http,todoService,$stateParams,$state,projectService){
        $scope.showTodoForm=false;
        todoService.getAllTodos($rootScope.token.token).then(function(response){
            $scope.todoList = response
        },function(error){
            //console.log(error);
            
        });

        projectService.getAllProjects($rootScope.token.token).then(function(response){
            $scope.projectList = response
        },function(error){
            
        });

        $scope.displayTodoForm = function(){
            $scope.showTodoForm = true;
            $scope.todoText = "";
    
        }
        $scope.hideTodoForm = function(){
            $scope.showTodoForm = false;
        }

        $scope.deleteTodo = function(id){
            todoService.removeTodo($rootScope.token.token,id).then(function(response){
                var todoList = $scope.todoList;
                todoList = todoList.filter(item => item._id !== id);
                $scope.todoList = todoList;
                swal("Good job!", "You deleted the todo!", "success");
            },function(error){
                
            });         
        }

        $scope.addTodo = function(){
            var addObject = JSON.stringify({title:'',text:$scope.todoText,completed:false,project_id:$scope.selectedProj});
            todoService.addTodo($rootScope.token.token,addObject).then(function(response){
                $scope.todoList.push(response[0]);
                $scope.showTodoForm = false;
                $state.go('todo',$stateParams,{reload:true});
                swal("Good job!", "New todo is added to the list!", "success");
            },function(error){
                
            });
        }

        $scope.stateChanged = function(todoId,completedVal){
            var completedTodo = JSON.stringify({completed:completedVal});
            console.log(completedTodo);
            todoService.toggleTodo($rootScope.token.token,todoId,completedTodo).then(function(response){
                if(completedVal){
                    //var updatedList = $scope.todoList;
                    //var foundIndex = updatedList.findIndex(x => x._id == todoId);
                    //$scope.todoList[foundIndex]= response[0]; 
                    $state.go('todo',$stateParams,{reload:true});
                    swal("Good job!", "You maked the todo as complete!", "success");
                }else{
                    $state.go('todo',$stateParams,{reload:true});
                    swal("Oh!", "You maked the todo as incomplete!", "error");
                }
            },function(error){
                
            });
        }

    }]);
    //todoController ends

    //todoService starts
    app.service('todoService',['$http',function($http){
        this.getAllTodos = function(token){
            return $http.get(SERVERURL+'todo?access_token='+token).then((response)=>{
                return response.data.data;
            },(error)=>{
                if(error.data==="Unauthorized"){
                    location.href = '../login.html';
                }
            });
        }

        this.addTodo = function(token,addObject){
            return $http.post(SERVERURL+'todo/?access_token='+token,addObject).then(
                function(response){
                    return response.data.data;    
                },function(error){
                    if(error.data==="Unauthorized"){
                        location.href = '../login.html';
                    }
                });
        }

        this.removeTodo = function(token,id){
            return $http.delete(SERVERURL+'todo/'+id+'?access_token='+token).then(function(response) {
                return response.data.data;
            },function(error){
                if(error.data==="Unauthorized"){
                    location.href = '../login.html';
                }
            });
        }

        this.toggleTodo = function(token,id,completedTodo){
            return $http.patch(SERVERURL+'todo/'+id+'?access_token='+token, completedTodo).then(function(response){
                return response.data.data;
            },function(error){
                if(error.data==="Unauthorized"){
                    location.href = '../login.html';
                }
            });
        }

    }]);
    //todoService ends

})();