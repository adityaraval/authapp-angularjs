(function (angular) {
    //var SERVERURL = "http://localhost:3000/api/"
    var SERVERURL = "https://authapp-angularjs.herokuapp.com/api/";
    var app = angular.module('myAPP');

    //todoController starts
    app.controller('todoController', ['$scope', '$rootScope', '$http', 'todoService', '$stateParams', '$state', 'projectService','RTodoList', function ($scope, $rootScope, $http, todoService, $stateParams, $state, projectService,RTodoList) {
        $scope.showTodoForm = false;
        $scope.editableTodo = "";
        $scope.todoList = RTodoList;

        projectService.getAllProjects($rootScope.token.token).then(function (response) {
            $scope.projectList = response
        }, function (error) {

        });

        $scope.editTodo = function(todoID){
            $scope.editableTodo = todoID;
        }
        
        $scope.updateTodo = function (todoID,completed,todoText) {
            todoService.updateTodo($rootScope.token.token,todoID,{text:todoText,completed:completed}).then(function (response) {
                var updatedList = $scope.todoList;
                var foundIndex = updatedList.findIndex(x => x._id == todoID);
                $scope.todoList[foundIndex]= response;
                //updatedList[foundIndex] = updateTodo;
                //$scope.todoList = updatedList;
                $scope.editableTodo = undefined;
                swal("Good job!", "You just updated a todo!", "success");

            },function (error) {

            });
        }


        $scope.filterTodo = function (projectId) {
            if(projectId!=='ALL'){
                todoService.todoByProjectId($rootScope.token.token,projectId).then(function (response) {
                    $scope.todoList = response;
                },function (error) {

                });
            }else{
                todoService.getAllTodos($rootScope.token.token).then(function (response) {
                    $scope.todoList = response;
                },function (error) {

                });

            }
         }

        $scope.displayTodoForm = function () {
            $scope.showTodoForm = true;
            $scope.todoText = "";

        }
        $scope.hideTodoForm = function () {
            $scope.showTodoForm = false;
        }

        $scope.deleteTodo = function (id) {
            todoService.removeTodo($rootScope.token.token, id).then(function (response) {
                var todoList = $scope.todoList;
                todoList = todoList.filter(item => item._id !== id);
                $scope.todoList = todoList;
                swal("Good job!", "You deleted the todo!", "success");
            }, function (error) {

            });
        }

        $scope.addTodo = function () {
            var addObject = JSON.stringify({
                title: '',
                text: $scope.todoText,
                completed: false,
                project_id: $scope.selectedProj
            });
            todoService.addTodo($rootScope.token.token, addObject).then(function (response) {
                if(typeof response==='undefined'){
                    swal("Oh!", "Please fill proper data!", "warning");
                }else{
                    $scope.todoList.push(response[0]);
                    $scope.showTodoForm = false;
                    $state.go('todo', $stateParams, {reload: true});
                    swal("Good job!", "New todo is added to the list!", "success");
                }
            }, function (error) {

            });
        }

        $scope.stateChanged = function (todoId, completedVal) {
            var completedTodo = JSON.stringify({completed: completedVal});
            console.log(completedTodo);
            todoService.toggleTodo($rootScope.token.token, todoId, completedTodo).then(function (response) {
                if (completedVal) {
                    //var updatedList = $scope.todoList;
                    //var foundIndex = updatedList.findIndex(x => x._id == todoId);
                    //$scope.todoList[foundIndex]= response[0];
                    $state.go('todo', $stateParams, {reload: true});
                    swal("Good job!", "You maked the todo as complete!", "success");
                } else {
                    $state.go('todo', $stateParams, {reload: true});
                    swal("Oh!", "You maked the todo as incomplete!", "error");
                }
            }, function (error) {

            });
        }

    }]);
    //todoController ends

    //todoService starts
    app.service('todoService', ['$http', function ($http) {
        this.getAllTodos = function (token) {
            return $http.get(SERVERURL + 'todo?access_token=' + token).then((response) => {
                return response.data.data;
            }, (error) => {
                if (error.data === "Unauthorized") {
                    location.href = '../../login.html';
                }
            });
        }

        this.addTodo = function (token, addObject) {
            return $http.post(SERVERURL + 'todo/?access_token=' + token, addObject).then(
                function (response) {
                    return response.data.data;
                }, function (error) {
                    if (error.data === "Unauthorized") {
                        location.href = '../../login.html';
                    }
                });
        }

        this.removeTodo = function (token, id) {
            return $http.delete(SERVERURL + 'todo/' + id + '?access_token=' + token).then(function (response) {
                return response.data.data;
            }, function (error) {
                if (error.data === "Unauthorized") {
                    location.href = '../../login.html';
                }
            });
        }

        this.toggleTodo = function (token, id, completedTodo) {
            return $http.patch(SERVERURL + 'todo/' + id + '?access_token=' + token, completedTodo).then(function (response) {
                return response.data.data;
            }, function (error) {
                if (error.data === "Unauthorized") {
                    location.href = '../../login.html';
                }
            });
        }

        this.todoByProjectId = function (token,p_id) {
            return $http.get(SERVERURL + 'todos?access_token=' + token+'&p_id='+p_id).then((response) => {
                return response.data.data;
            }, (error) => {
                if (error.data === "Unauthorized") {
                    location.href = '../../login.html';
                }
            });

        }

        this.updateTodo = function (token,id,updateObject) {
            return $http.put(SERVERURL + 'todo/' + id + '?access_token=' + token, updateObject).then(
                function (response) {
                    return response.data.data[0];
                }, function (error) {
                    if (error.data === "Unauthorized") {
                        location.href = '../../login.html';
                    }
                });
        }


    }]);
    //todoService ends

})(angular);