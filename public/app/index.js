(function () {
    //var SERVERURL = "http://localhost:3000/api/"
    var SERVERURL = "https://authapp-angularjs.herokuapp.com/api/";

    var app = angular.module('myAPP', ['ui.router', 'ui-notification']).config(function ($stateProvider) {
        var helloState = {
            name: 'home',
            url: '/home',
            views: {
                'leftSide': {
                    templateUrl: 'home.html'
                }
            }
        }

        var aboutState = {
            name: 'about',
            url: '/about',
            views: {
                'leftSide': {
                    templateUrl: 'about.html'
                }
            }
        }
        var profileState = {
            name: 'profile',
            url: '/profile',
            views: {
                'rightSide': {
                    templateUrl: 'profile.html',
                    'controller': 'profileController'
                }
            }
        }

        var projectState = {
            name: 'project',
            url: '/project',
            views: {
                'rightSide': {
                    templateUrl: 'project.html',
                    'controller': 'projectController'
                }
            }
        }

        var todoState = {
            name: 'todo',
            url: '/todo',
            views: {
                'rightSide': {
                    templateUrl: 'todo.html',
                    'controller': 'todoController'
                }
            }
        }

        $stateProvider.state(helloState);
        $stateProvider.state(aboutState);
        $stateProvider.state(profileState);
        $stateProvider.state(projectState);
        $stateProvider.state(todoState);
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

    //profileController starts
    app.controller('profileController', ['$scope', '$rootScope', '$http','$timeout','profileService', function ($scope, $rootScope, $http,$timeout, profileService) {

        $scope.isEditable = false;
        $scope.stripeToken = "Token";

        //notification $on
        $rootScope.$on('sendNotificationProfile', function (e, opt) {
            //if($rootScope.token._id===opt.data._id){
                Notification.primary(opt.message);
                $scope.UserProfile = opt.data;
            //}
        });

        profileService.getUserProfile($rootScope.token.token).then(function (response) {
            $scope.UserProfile = response;
        }, (error) => {
            if (error.data === "Unauthorized") {
                location.href = '../login.html';
            }
        });

        $scope.makeisEditableTrue = function () {
            $scope.isEditable = true;
        }
        $scope.makeisEditableFalse = function () {
            $scope.isEditable = false;
        }

        $scope.saveUserProfile = function (_id, fullname, address, phone, mobile) {
            var updateObj = JSON.stringify({fullname: fullname, address: address, phone: phone, mobile: mobile});

            profileService.updateUserProfile($rootScope.token.token, _id, updateObj).then(function (response) {
                $scope.UserProfile = response;
                $scope.isEditable = false;
                swal("Good job!", "Profile updated successfully!", "success");
            }, (error) => {

            });
        }

        $scope.dismissToast = function () {
            M.Toast.dismissAll();
        }

        //stripe elements code
        // Create a Stripe client.
        $timeout(function () {
            //stripe
            var stripe = Stripe('pk_test_GanSHGro11a5RkYJ16RFhKBX');

            // Create an instance of Elements.
            var elements = stripe.elements();

            // Custom styling can be passed to options when creating an Element.
            // (Note that this demo uses a wider set of styles than the guide below.)
            var style = {
                base: {
                    color: '#32325d',
                    lineHeight: '18px',
                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',
                    '::placeholder': {
                        color: '#aab7c4'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            };

            // Create an instance of the card Element.
            var card = elements.create('card', {style: style});

            // Add an instance of the card Element into the `card-element` <div>.
            card.mount('#card-element');

            // Handle real-time validation errors from the card Element.
            card.addEventListener('change', function(event) {
                var displayError = document.getElementById('card-errors');
                if (event.error) {
                    displayError.textContent = event.error.message;
                } else {
                    displayError.textContent = '';
                }
            });

            // Handle form submission.
            var form = document.getElementById('payment-form');
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                stripe.createToken(card).then(function(result) {
                    if (result.error) {
                        // Inform the user if there was an error.
                        var errorElement = document.getElementById('card-errors');
                        errorElement.textContent = result.error.message;
                    } else {
                        // Send the token to your server.
                        //stripeTokenHandler(result.token);
                        console.log(result.token);
                        $scope.stripeToken = result.token;
                        profileService.verifyUser($rootScope.token.token,$scope.stripeToken).then(function(response){
                            $scope.UserProfile = response;
                            swal("Good job!", "Payment verified successfully!", "success");
                        },function (error) {

                        });
                        $scope.$apply();
                    }
                });
            });
            //
        },1000);
        //stripe elements ends here

    }]);
    //profileController ends

    //profileService starts
    app.service('profileService', ['$http', function ($http) {
        this.getUserProfile = function (token) {
            return $http.get(SERVERURL + 'profile?access_token=' + token).then(function (response) {
                return response.data.data;
            }, function (error) {
                if (error.data === "Unauthorized") {
                    location.href = '../login.html';
                }
            });
        }

        this.updateUserProfile = function (token, id, updateObj) {
            return $http.patch(SERVERURL + 'profile/' + id + '?access_token=' + token, updateObj).then(function (response) {
                return response.data.data;
            }, function (error) {
                if (error.data === "Unauthorized") {
                    location.href = '../login.html';
                }
            });
        }

        this.verifyUser = function (token,stripeToken) {
            let updateObj = {token:stripeToken};
            return $http.post(SERVERURL + 'verify/?access_token=' + token, updateObj).then(function (response) {
                return response.data.data;
            }, function (error) {
                if (error.data === "Unauthorized") {
                    location.href = '../login.html';
                }
            });
        }
    }]);
    //profileService ends

    //projectController starts
    app.controller('projectController', ['$scope', '$rootScope', '$http', 'projectService', function ($scope, $rootScope, $http, projectService) {

        $scope.showProjectForm = false;

        //notification $on
        $rootScope.$on('sendNotificationProject', function (e, opt) {
            if($rootScope.token._id===opt.data.user_id){
                //Notification.primary(opt.message);
                $scope.projectList.push(opt.data);
            }
        });

        projectService.getAllProjects($rootScope.token.token).then(function (response) {
            $scope.projectList = response
        }, function (error) {

        });

        $scope.addProject = function () {
            var addObject = JSON.stringify({title: $scope.projectTitle});
            projectService.addProj($rootScope.token.token, addObject).then(function (response) {
                //$scope.projectList.push(response[0]);
                $scope.showProjectForm = false;
                swal("Good job!", "New project is added to the board!", "success");
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
                        location.href = '../login.html';
                    }
                });
        }

        this.getAllProjects = function (token) {
            return $http.get(SERVERURL + 'project?access_token=' + token).then((response) => {
                return response.data.data;
            }, (error) => {
                if (error.data === "Unauthorized") {
                    location.href = '../login.html';
                }
            });
        }
    }]);
    //projectService ends

    //todoController starts
    app.controller('todoController', ['$scope', '$rootScope', '$http', 'todoService', '$stateParams', '$state', 'projectService', function ($scope, $rootScope, $http, todoService, $stateParams, $state, projectService) {
        $scope.showTodoForm = false;
        todoService.getAllTodos($rootScope.token.token).then(function (response) {
            $scope.todoList = response
        }, function (error) {
            //console.log(error);

        });

        projectService.getAllProjects($rootScope.token.token).then(function (response) {
            $scope.projectList = response
        }, function (error) {

        });

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
                $scope.todoList.push(response[0]);
                $scope.showTodoForm = false;
                $state.go('todo', $stateParams, {reload: true});
                swal("Good job!", "New todo is added to the list!", "success");
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
                    location.href = '../login.html';
                }
            });
        }

        this.addTodo = function (token, addObject) {
            return $http.post(SERVERURL + 'todo/?access_token=' + token, addObject).then(
                function (response) {
                    return response.data.data;
                }, function (error) {
                    if (error.data === "Unauthorized") {
                        location.href = '../login.html';
                    }
                });
        }

        this.removeTodo = function (token, id) {
            return $http.delete(SERVERURL + 'todo/' + id + '?access_token=' + token).then(function (response) {
                return response.data.data;
            }, function (error) {
                if (error.data === "Unauthorized") {
                    location.href = '../login.html';
                }
            });
        }

        this.toggleTodo = function (token, id, completedTodo) {
            return $http.patch(SERVERURL + 'todo/' + id + '?access_token=' + token, completedTodo).then(function (response) {
                return response.data.data;
            }, function (error) {
                if (error.data === "Unauthorized") {
                    location.href = '../login.html';
                }
            });
        }

    }]);
    //todoService ends

})();