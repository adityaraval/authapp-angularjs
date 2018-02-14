const mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId;

let ProjectTodo = new Schema({
    id:ObjectId,
    u_id:{type:ObjectId,ref:'User'},
    p_id:{type:ObjectId,ref:'Project'},
    t_id:{type:ObjectId,ref:'Todo'}
});

let ProjectTodoModel = mongoose.model('ProjectTodo',ProjectTodo)

module.exports = {ProjectTodoModel:ProjectTodoModel}