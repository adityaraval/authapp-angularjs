const mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

let Project = new Schema({
    id:ObjectId,
    title:{
        type:String,
        required:true
    },
    user_id:{type:ObjectId,ref:'User'}
});

let ProjectModel = mongoose.model('Project',Project)

module.exports = {ProjectModel:ProjectModel}