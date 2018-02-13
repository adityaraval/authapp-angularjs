const mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId;

let Todo = new Schema({
    id:ObjectId,
    title:String,
    text:String,
    completed:Boolean,
    project_id:{type:ObjectId,ref:'Project'}
});

let TodoModel = mongoose.model('Todo',Todo)

module.exports = {TodoModel:TodoModel}