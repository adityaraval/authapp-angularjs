const mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId;
const validator = require('validator');
const _ = require('lodash');
//const bcrypt = require('bcryptjs');
const bcrypt = require('bcrypt');
const randomstring = require('randomstring');

let User = new Schema({
    id:ObjectId,
    fullname:{
        type:String,
        required:true,
        minlength:6
    },
    address:{
        type:String
    },
    phone:{
        type:String
    },
    mobile:{
        type:String
    },
    email:{
        type:String,
        required:true,
        trim:true,
        minlength:1,
        unique:true,
        validate:{
          validator:validator.isEmail,
          message:'{value} is not the valid email'
        }
      },
      password:{
        type:String,
        required:true,
        minlength:6
      },
      token:{
          type:String,
          required:false,
          minlength:5
      }
});

User.methods.toJSON = function(){
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject,['_id','email','fullname','address','mobile','phone','token']);
}

User.methods.generateToken = function(){
    var user = this;
    var token = randomstring.generate();
    user.token = token;

    return user.save().then(()=>{
        return token;
    });
}

User.statics.findUserByToken = function(token){
    var user = this;
    return user.findOne({token:token});
}

User.pre('save',function(next){
    var user = this;
    if(user.isModified('password')){
        bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(user.password,salt,(err,hash)=>{
            user.password = hash;
            next();
        });
        });
    }
    else{
        next();
    }
});

User.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

let UserModel = mongoose.model('User',User)

module.exports = {UserModel:UserModel}