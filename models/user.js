const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
let Counter = require('./counter');

let collection_name = 'users';
let email_matcher = new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/);
let result = {error: {status: false, message: '', data:undefined, code: undefined}};
let UserSchema = mongoose.Schema({
    _id: {type: Number, unique:true, index:true},
    name: { type: String},
    email: { type: String},
    password: { type: String},
    confirmed: {type: Boolean},
    confirmUserToken: {type: String},
    confirmUserExpires: {type: Date},
    resetPasswordToken: {type: String},
    resetPasswordExpires: {type: Date},
    requestUserId: {type: Number},
    requestToken : {type: String},
    requestTokenExpires: {type: Date},
    limit: {type: Number},
    limitExpires: {type: Date, default: Date.now()}
}, {
  versionKey: false,
  collection: collection_name
});

UserSchema.statics.createUser = function(user, callback){
    if(user.name && user.email && user.password){
    
        user.name = user.name.trim();
        user.email = user.email.trim();
        user.password = user.password.trim();

        this.findByEmail(user.email, (err, res) => {
            if(res.error.status){
                if(res.error.code == 1){
                    let new_user = new User(user);
                    Counter.nextId(collection_name, (err, id) => {
                        new_user._id = id;
                        bcrypt.genSalt(10, function(err, salt) {
                            bcrypt.hash(user.password, salt, function(err, hash) {
                                new_user.password = hash;
                                new_user.save((err, user) => {
                                    user.password = undefined;
                                    initializeResult();
                                    result.error.status = false;
                                    result.error.message = 'User created successfully';
                                    result.data = user;
                                    callback(null, result);
                                });
                                // Store hash in your password DB. 
                            });
                        });
                    });
                }else if(res.error.code == 0){
                    initializeResult();
                    callback(null, res);
                }
            }else{
                initializeResult();
                result.error.message = 'Username already present. Please use another username';
                result.error.status = true;
                callback(null, result);
            }
        });
        
    }else{
        initializeResult();
        result.error.status = true;
        result.error.message = 'All fields are required';
        callback(null, result);
    }
};


UserSchema.statics.loginUser = function(user, callback){
    if(user.email && user.password){
        user.email = user.email.trim();
        user.password = user.password.trim();
    }
    this.findByEmail(user.email, (err, res) => {
        if(err){
            throw err;
        }else if( res.error.status){
            // initializeResult();
            // result.error.status = true;
            // result.error.message = 'Cannot find user';
            callback(null, res);
        }else{
            password = user.password;
            user = res.data;
                bcrypt.compare(password, user.password, function(err, res) {
                    if(res){
                        if(user.confirmed){
                            initializeResult();
                            user.password = undefined;
                            result.error.status = false;
                            result.error.message = 'Logged in successfully';
                            result.data = user;
                            callback(null, result);
                        }else{
                            initializeResult();
                            result.error.status = true;
                            result.error.message = 'You need to confirm your mail first';
                            result.error.code = 3;
                            callback(null, result);
                        }
                    }else{
                        initializeResult();
                        result.error.status = true;
                        result.error.message = 'Invalid credentials';
                        result.error.code = 2;
                        callback(null, result);
                    }
                });
        }
    });
}

UserSchema.statics.findByEmail = function(email, callback){
    email = email.trim();
    let mail_check = email_matcher.test(email);
    if(mail_check){
        this.findOne({email: email}, (err, res) => {
            if(err) throw err;
            else if(res){
                initializeResult();
                result.error.status = false;
                result.data = res;
            }else{
                initializeResult();
                result.error.status = true;
                result.error.message = 'email not present';
                result.error.code = 1;
            }
            callback(null, result);
        });
    }else{
        initializeResult();
        result.error.message = 'You should enter correct email';
        result.error.status = true;
        result.error.code = 0
        callback(null, result);
    }
}

let User = mongoose.model('User', UserSchema);


initializeResult = function(){
    result.error.status = undefined;
    result.error.code = undefined,
    result.error.data = undefined,
    result.error.message = undefined,
    result.data = undefined;
}

module.exports = User;