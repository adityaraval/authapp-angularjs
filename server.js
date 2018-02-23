//packages import
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const bodyParser = require('body-parser');
const _ = require('lodash');

//config for mongoose added
const {mongoose} = require('./config/mongoose');

//models import
const {TodoModel} = require('./model/todo');
const {ProjectModel} = require('./model/project');
const {UserModel} = require('./model/user');
const {ProjectTodoModel} = require('./model/projectodouser');

//redis
var redis = require("redis"),client = redis.createClient();

var sockjs  = require('sockjs');
var http    = require('http');
var sockjs_opts = {sockjs_url: "http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js"};
var sockjs_echo = sockjs.createServer(sockjs_opts);
var connections = {};

sockjs_echo.on('connection', function(conn) {
    connections[conn.id] = conn
    //console.log(conn.id, "==>CONNECTED");

    conn.on('data', function (message) {
        console.log(message,"==>MESSAGE==>",conn.id);
        connections[conn.id].state = message;
        //conn.write(message);
    });

    conn.on('close', function () {
        delete connections[conn.id];
        console.log(conn.id, "==>CLOSED");
    });

});

//passport config
const {passportConfig} = require('./config/passport-config');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

//static folder
app.use(express.static('public'))

//runs angular todo app
app.get('/',function(req,res){
    res.sendFile('public/login.html', {root: __dirname });
});

//auth routes for login/signup
app.post('/api/register',(req,res)=>{
    let User = new UserModel({
        fullname:req.body.fullname,
        email:req.body.email,
        password:req.body.password,
        address:"",
        phone:"",
        mobile:"",
        token:null,
        role:"USER"
    });

    UserModel.findOne({email:req.body.email}).exec((err,user)=>{
        if(user===null){
            User.save().then((user)=>{
                res.send({data:user,success:true});
            },(error)=>{
                res.send({data:{error:error},success:false});
            });
        }else{
            res.status(422).send({data:{error:"Email Already Exists"},success:false});
        }
    });
});

//Login 
app.post('/api/login',(req,res)=>{
    let userObj = {email:req.body.email,password:req.body.password};
    UserModel.findOne({email:userObj.email}).exec((err1,user)=>{
        if(user===null){
            res.status(422).send({data:{error:"No such user found!"},success:false});
        }else{
            user.comparePassword(userObj.password,(err,isMatch)=>{
                if(isMatch){
                    user.generateToken().then((token)=>{
                        var LoggedInUser = user._id;
                        client.setex(LoggedInUser.toString(),60,JSON.stringify(user));
                        res.send({data:user,success:true});
                    },(error)=>{
                        res.send({data:{},success:false});
                    });
                }else{
                    res.status(422).send({data:{error:"Invalid Password!"},success:false});
                }
            });
        }
    });
});

//Get Profile of a loggedin user
app.get('/api/profile',passportConfig.authenticate('bearer', { session: false }),(req,res)=>{
    res.send({data:req.user,success:true});
});

//Update Profile
app.patch('/api/profile/:id',passportConfig.authenticate('bearer',{session: false}),(req,res)=>{
    let id = req.params.id;
    let body = _.pick(req.body,['fullname','address','phone','mobile']);
    UserModel.findByIdAndUpdate(id,{$set:body},{new:true}).then((user)=> {
        //notify client that profile updated
        for(var id in connections) {
            //connections[id].write(user.fullname+' updated his profile');
            if(connections[id].state==="profile"){
                connections[id].write(JSON.stringify(user));
            }
        }
        //
        res.send({data: user, success: true});
    },(error)=>{
        res.send({data:{},success:false});
    }); 
});

//add project for loggedin user
app.post('/api/project',passportConfig.authenticate('bearer', { session: false }),(req,res)=>{
    let Project = new ProjectModel({
        title:req.body.title,
        user_id:req.user._id
    });
    Project.save().then((project)=>{
        //notify client that profile updated
        for(var id in connections) {
            //connections[id].write(user.fullname+' updated his profile');
            if(connections[id].state==="project"){
                connections[id].write(JSON.stringify(project));
            }
        }
        //
        res.send({data:[project],success:true});
    },(error)=>{
        res.send({data:{},success:false});
    });
});

//get all projects of loggedin user
app.get('/api/project',passportConfig.authenticate('bearer', { session: false }),(req,res)=>{
    ProjectModel.find({user_id:req.user._id}).then((projects)=>{
        res.send({data:projects,success:true});
    },(error)=>{
        res.send({data:{},success:false});
    });
});

//post todo api
app.post('/api/todo',passportConfig.authenticate('bearer', { session: false }),(req,res)=>{
    let Todo = new TodoModel({
        text:req.body.text,
        title:req.body.title,
        completed:req.body.completed,
        project_id:req.body.project_id
    });
    
    Todo.save((err,todo)=>{
        if(!err){
            let projectTodoUser = new ProjectTodoModel({p_id:todo.project_id,t_id:todo._id,u_id:req.user._id});
            projectTodoUser.save((err,ptu)=>{
                res.send({data:[todo],success:true});
            });
        }
    });
});

//get all todos of loggedin user
app.get('/api/todo',passportConfig.authenticate('bearer', { session: false }),(req,res)=>{
    ProjectTodoModel.find({u_id:req.user._id},(err,ptu)=>{
        if(!err){
           let allTodoIDs = [];
           ptu.map(item=>{allTodoIDs.push(item.t_id);});
           TodoModel.find({_id:{$in:allTodoIDs}}).populate('project_id').exec((err,todos)=>{
                if(!err){
                    res.send({data:todos,success:true});
                }
           });
        }
    });
});

//delete todo by id
app.delete('/api/todo/:id',passportConfig.authenticate('bearer', { session: false }),(req,res)=>{
    var id = req.params.id;
    TodoModel.findByIdAndRemove(id).then((todo)=>{
        res.send({data:todo,success:true}); 
    },(error)=>{
        res.send({data:{},success:false});
    });
});

//make todo complete
app.patch('/api/todo/:id',passportConfig.authenticate('bearer', { session: false }),(req,res)=>{
    var id = req.params.id;
    updateObj = {completed:req.body.completed};
    TodoModel.findByIdAndUpdate(id,{$set:updateObj},{new:true}).then((todo)=>{
        res.send({data:todo,success:true}); 
    },(error)=>{
        res.send({data:{},success:false});
    });
});

//update todo
app.put('/api/todo/:id',passportConfig.authenticate('bearer', { session: false }),(req,res)=>{
    var id = req.params.id;
    updateObj = {completed:req.body.completed,text:req.body.text,title:req.body.title};
    TodoModel.findByIdAndUpdate(id,{$set:updateObj},{new:true}).then((todo)=>{
        res.send({data:[todo],success:true}); 
    },(error)=>{
        res.send({data:{},success:false});
    });
});

//get todo by id 
app.get('/api/todo/:id',passportConfig.authenticate('bearer', { session: false }),(req,res)=>{
    var id = req.params.id;
    TodoModel.findById(id).then((todos)=>{
        res.send({data:[todos],success:true});
    },(error)=>{
        res.send({data:{},success:false});
    });
});

//get todo by id 
app.get('/api/todos',passportConfig.authenticate('bearer', { session: false }),(req,res)=>{
    var p_id = req.query.p_id;
    TodoModel.find({project_id:p_id}).then((todos)=>{
        res.send({data:todos,success:true});
    },(error)=>{
        res.send({data:{},success:false});
    });
});

var server = http.createServer(app);
sockjs_echo.installHandlers(server, {prefix:'/echo'});

server.listen(PORT,()=>{
    console.log('Server is running on port '+PORT);
});