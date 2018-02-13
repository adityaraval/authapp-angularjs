(function(){
    var LOCALURL = "http://localhost:3000/api/"
    var SERVERURL = "http://localhost:3000/api/"


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
                'controller':'profileController',
                resolve: {
                    up:function(){
                        $http.get('http://localhost:3000/api/profile?access_token='+$rootScope.token.token).then(function(response){
                            return response.data.data;    
                        },function(error){
                            console.log(error);
                        });
                    }
                }
              }
            }
          }
          $stateProvider.state(helloState);
          $stateProvider.state(aboutState);
          $stateProvider.state(profileState);

    });

    app.controller('navController',['$scope','$rootScope','$http',function($scope,$rootScope,$http){
        $scope.logoutAPP = function(){
            localStorage.setItem('token',"");
            location.href = '../login.html';
        }
    }]);

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

    app.service('profileService', ['$http',function($http){
        this.getUserProfile = function(token){
            return $http.get(LOCALURL+'profile?access_token='+token).then(function(response){
                return response.data.data;    
            },function(error){
                console.log(error);
            });
        }

        this.upodateUserProfile = function(token,id,updateObj){
            return $http.patch(LOCALURL+'profile/'+id+'?access_token='+token,updateObj).then(function(response){
                return response.data.data;    
            },function(error){
                console.log(error);
            });
        }

    }]);


})();