`use strict`;
const mongoose = require('mongoose');

let CounterSchema = new mongoose.Schema({
    _id: {type: String, unique: true, trim: true},
    value: {type: Number}
},{
    collection: 'counter',
    versionKey: false
});


CounterSchema.statics.nextId = function(id, callback) {
    let updateObject = {$inc: {value: 1}};
    let options = {upsert: true, new: true};
    this.findByIdAndUpdate(id, updateObject, options, function(err, counter){
        if(err) throw err;
        else callback(null, counter.value);
    });
};

CounterSchema.statics.getAll = function(callback){
    this.find({}, callback);
};

let Counter = mongoose.model('counter', CounterSchema);


module.exports = Counter;