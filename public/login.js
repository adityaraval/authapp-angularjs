$("#loginbtn").on('click',function(){
    var username =$("#uname").val();
    var password =$("#pwd").val();
    if(username==="" || password===""){
        swal("Error!", "Please fill proper credentials!", "error");
    }else{
        $('#loginbtn').text('Logging In..');
        $.post('http://localhost:3000/api/login', {
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