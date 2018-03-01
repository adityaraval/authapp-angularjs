(function (angular) {
    //var SERVERURL = "http://localhost:3000/api/"
    var SERVERURL = "https://authapp-angularjs.herokuapp.com/api/";
    var app = angular.module('myAPP');

    //profileController starts
    app.controller('profileController', ['$scope', '$rootScope', '$http','$timeout','profileService','RUserProfile', function ($scope, $rootScope, $http,$timeout, profileService,RUserProfile) {

        $scope.isEditable = false;
        $scope.UserProfile = RUserProfile;
        $scope.stripeToken = "Token";

        //notification $on
        $rootScope.$on('sendNotificationProfile', function (e, opt) {
            //if($rootScope.token._id===opt.data._id){
            Notification.primary(opt.message);
            $scope.UserProfile = opt.data;
            //}
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
                    location.href = '../../login.html';
                }
            });
        }

        this.updateUserProfile = function (token, id, updateObj) {
            return $http.patch(SERVERURL + 'profile/' + id + '?access_token=' + token, updateObj).then(function (response) {
                return response.data.data;
            }, function (error) {
                if (error.data === "Unauthorized") {
                    location.href = '../../login.html';
                }
            });
        }

        this.verifyUser = function (token,stripeToken) {
            let updateObj = {token:stripeToken};
            return $http.post(SERVERURL + 'verify/?access_token=' + token, updateObj).then(function (response) {
                return response.data.data;
            }, function (error) {
                if (error.data === "Unauthorized") {
                    location.href = '../../login.html';
                }
            });
        }
    }]);
    //profileService ends


})(angular);