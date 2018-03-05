var SERVERURL = "http://localhost:3000/api/"
//var SERVERURL = "https://authapp-angularjs.herokuapp.com/api/";

$("#loginbtn").on('click',function(){
    var username =$("#uname").val();
    var password =$("#pwd").val();
    if(username==="" || password===""){
        swal("Error!", "Please fill proper credentials!", "error");
    }else{
        $('#loginbtn').text('Logging In..');
        $.post(SERVERURL+'login', {
        email: username,
        password: password
        }, function(auth) {
            if(auth.data.token && auth.data.role==="USER"){
                localStorage.setItem('token',JSON.stringify(auth.data));
                var toastHTML = '<span>LoggedIn Successfully!</span><button class="btn-flat toast-action" ng-click="dismissToast()">Dismiss</button>';
                M.toast({html: toastHTML});
                setTimeout(function(){
                    location.href = 'app/index.html#!/todo';
                },2000);
            }
        }).fail(function(error) {
            var error = error.responseJSON.data.error;
            var toastHTML = '<span>'+error+'</span><button class="btn-flat toast-action" ng-click="dismissToast()">Dismiss</button>';
            M.toast({html: toastHTML});
            $('#loginbtn').text('Log In');
        });
    }
});




    $("#registerbtn").on('click',function() {
        $('#modal1').modal();
    });

    $("#registerNow").on('click',function() {
        var username =$("#uname1").val();
        var password =$("#pwd1").val();
        var fullname =$("#fullname1").val();
        if(username==="" || password==="" || fullname===""){
            swal("Error!", "Please fill proper details!", "error");
        }else {
            $('#registerNow').text('Registering..');
            $.post(SERVERURL + 'register', {
                email: username,
                password: password,
                fullname: fullname
            }, function (registered) {
                console.log(registered);
                var toastHTML = '<span>Registered Successfully!</span><button class="btn-flat toast-action" ng-click="dismissToast()">Dismiss</button>';
                M.toast({html: toastHTML});
                setTimeout(function(){
                    location.href = 'login.html';
                },2000);
            }).fail(function (error) {
                //console.log(error.responseJSON.data.error);
                var error = error.responseJSON.data.error;
                var toastHTML = '<span>'+error+'</span><button class="btn-flat toast-action" ng-click="dismissToast()">Dismiss</button>';
                M.toast({html: toastHTML});
                $('#registerNow').text('Register Now');

            });
        }
    });

