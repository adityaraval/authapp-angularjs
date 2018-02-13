const mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

let Project = new Schema({
    id:ObjectId,
    title:String
});

let ProjectModel = mongoose.model('Project',Project)

module.exports = {ProjectModel:ProjectModel}