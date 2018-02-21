$("#loginbtn").on('click',function(){
    //var SERVERURL = "http://localhost:3000/api/"
    var SERVERURL = "https://authapp-angularjs.herokuapp.com/api/";
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
            console.log(error);
        });
    }
})