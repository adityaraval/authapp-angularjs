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

//post todo api
app.post('/api/todo',(req,res)=>{
    let Todo = new TodoModel({
        text:req.body.text,
        title:req.body.title,
        completed:req.body.completed,
        project_id:req.body.project_id
    });
    Todo.save().then((todo)=>{
        res.send({data:[todo],success:true});
    },(error)=>{
        res.send({data:{},success:false});
    });
});

//get all todo apis
app.get('/api/todo',(req,res)=>{
    TodoModel.find({}).populate('project_id').then((todos)=>{
        res.send({data:todos,success:true});
    },(error)=>{
        res.send({data:{},success:false});
    });
});

//delete todo by id
app.delete('/api/todo/:id',(req,res)=>{
    var id = req.params.id;
    TodoModel.findByIdAndRemove(id).then((todo)=>{
        res.send({data:todo,success:true}); 
    },(error)=>{
        res.send({data:{},success:false});
    });
});

//make todo complete
app.patch('/api/todo/:id',(req,res)=>{
    var id = req.params.id;
    updateObj = {completed:req.body.completed};
    TodoModel.findByIdAndUpdate(id,{$set:updateObj},{new:true}).then((todo)=>{
        res.send({data:todo,success:true}); 
    },(error)=>{
        res.send({data:{},success:false});
    });
});

//update todo
app.put('/api/todo/:id',(req,res)=>{
    var id = req.params.id;
    updateObj = {completed:req.body.completed,text:req.body.text,title:req.body.title};
    TodoModel.findByIdAndUpdate(id,{$set:updateObj},{new:true}).then((todo)=>{
        res.send({data:[todo],success:true}); 
    },(error)=>{
        res.send({data:{},success:false});
    });
});

//get todo by id 
app.get('/api/todo/:id',(req,res)=>{
    var id = req.params.id;
    TodoModel.findById(id).then((todos)=>{
        res.send({data:[todos],success:true});
    },(error)=>{
        res.send({data:{},success:false});
    });
});

//add project
app.post('/api/project',(req,res)=>{
    let Project = new ProjectModel({
        title:req.body.title
    });
    Project.save().then((project)=>{
        res.send({data:[project],success:true});
    },(error)=>{
        res.send({data:{},success:false});
    });
});

//get all projects apis
app.get('/api/project',(req,res)=>{
    ProjectModel.find().then((projects)=>{
        res.send({data:projects,success:true});
    },(error)=>{
        res.send({data:{},success:false});
    });
});

//get todo by id 
app.get('/api/todos',(req,res)=>{
    var p_id = req.query.p_id;
    TodoModel.find({project_id:p_id}).then((todos)=>{
        res.send({data:todos,success:true});
    },(error)=>{
        res.send({data:{},success:false});
    });
});


//auth routes for login/signup
app.post('/api/register',(req,res)=>{
    let User = new UserModel({
        fullname:req.body.fullname,
        email:req.body.email,
        password:req.body.password,
        token:null
    });

    User.save().then((user)=>{
        res.send({data:user,success:true});
    },(error)=>{
        console.log(error);
        res.send({data:{error:error},success:false});
    });
});

app.post('/api/login',(req,res)=>{
    let userObj = {email:req.body.email,password:req.body.password};
    UserModel.findOne({email:userObj.email}).exec((err1,user)=>{
        user.comparePassword(userObj.password,(err,isMatch)=>{
            if(isMatch){
                user.generateToken().then((token)=>{
                    res.send({data:user,success:true});
                },(error)=>{
                    res.send({data:{},success:false});
                });
            }
        });    
    });
});

app.get('/api/profile',passportConfig.authenticate('bearer', { session: false }),(req,res)=>{
    res.send({data:req.user,success:true});
});

app.patch('/api/profile/:id',passportConfig.authenticate('bearer',{session: false}),(req,res)=>{
    let id = req.params.id;
    let body = _.pick(req.body,['fullname','address','phone','mobile']);

    UserModel.findByIdAndUpdate(id,{$set:body},{new:true}).then((user)=> {
        res.send({data: user, success: true});
    },(error)=>{
        res.send({data:{},success:false});
    });

});

app.listen(PORT,()=>{
    console.log('Server is running on port '+PORT);
});