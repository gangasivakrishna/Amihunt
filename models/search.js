const mongoose = require('mongoose');
let Counter = require('./counter');
let collection_name = 'search';
let SearchSchema = mongoose.Schema({
    _id: {type: Number, unique:true, index:true},
    user_id: { type: Number},
    searched: {type: Array}
}, {
  versionKey: false,
  collection: collection_name
});


SearchSchema.statics.addSearchUser = function(id, user, callback){
    this.findByUserId(id, (err, response) => {
        if(err){
            console.log(err);
        }else{
            if(response){
                this.update({user_id: id}, {$addToSet: {searched: user}}, {upsert: true}, callback);
            }else{
                Counter.nextId(collection_name, (err, next_id) => {
                    new_search = {
                        _id:next_id,
                        user_id: id,
                        searched: [ user ]
                    }
                    let search = new Search(new_search);
                    search.save(callback);
                })
            }
        }
    })
    // this.find({name: {$regex: regexname}}, {name:1}).skip(0).limit(10).exec(callback);
}

SearchSchema.statics.findByUserId = function(id, callback){
    this.findOne({user_id:id}, function(err, user){
        if(err){
            callback(err,null);
        }else if(user){
            callback(null, true);
        }else{
            callback(null, false);
        }
    })
}
let Search = mongoose.model('Search', SearchSchema);




module.exports = Search;