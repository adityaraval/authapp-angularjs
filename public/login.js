$("#loginbtn").on('click',function(){
    //var LOCALURL = "http://localhost:3000/api/"
    var SERVERURL = "hhttps://authapp-angularjs.herokuapp.com/api/";
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
            if(auth.data.token){
                localStorage.setItem('token',JSON.stringify(auth.data));
                location.href = 'app/index.html';
            }
        }).fail(function(error) {
            console.log(error);
        });
    }
})