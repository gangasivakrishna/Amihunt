const mongoose = require('mongoose');
let Counter = require('./counter');
let collection_name = 'project';
let ProfileSchema = mongoose.Schema({
    _id: {type: Number, unique:true, index:true},
    sschtno: { type: Number, unique: true, index: true},
    name: { type: String},
    dob: { type: String},
    address: {type: String},
    college: {type: String}
}, {
  versionKey: false,
  collection: collection_name
});

ProfileSchema.statics.findByName = function(name, callback){
  let regexname = new RegExp('.*'+name+'.*');
  this.find({name: {$regex: regexname}}, {_id: 1, name:1}).skip(0).limit(10).exec(callback);
}

let Profile = mongoose.model('Profile', ProfileSchema);


module.exports = Profile;