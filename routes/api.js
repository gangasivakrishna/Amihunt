const express = require('express');
let router = express.Router();
let Profile = require('../models/profile');
let Search = require('../models/search');
let async = require('async');
let nodemailer = require('nodemailer');
let User = require('../models/user');
router.get('/', (req, res) => {
    res.send('You are trying to access restricted url on this domain');
});

router.post('/search', (req, res) => {
    let name;
    if(req.body.name){
        name = req.body.name.trim();
    }
    let name_check = /^[a-zA-Z ]+$/.test(name);
    if(name_check){
        name = name.toUpperCase();
        Profile.findByName(name, (err, response) => {
            res.send({error:{status:false}, data: response});
        })
    }else{
        res.send({error:{status: true, message:'Please enter a valid name'}});
    }
})


router.post('/sendme', (req, res) => {
    let id = req.body.id;
    let name = req.body.name;
    if(name){
        name = name.trim();
    }
    let search_user = {
        _id: id,
        name: name
    }
    if(typeof id === 'number'){
        async.waterfall([
            function(done) {
                let code =  getRand();
                done(null, code)
            },
            function(code, done) {
                let email = req.session.suser.email;
                User.findByEmail(email, function(err, response) {

                    if(err) throw err;
                    let user = response.data;
                    if (!user) {
                        res.send(response);
                    }
                    else{
                        user = new User(user);
                        if(Date.parse(user.limitExpires) < Date.now()){
                            let date = new Date();
                            date.setHours(24,0,0,0);
                            user.limitExpires = Date.parse(date);
                            user.limit = 0;
                        }else{
                            user.limit += 1;
                        }
                        if(user.limit < 5){
                            Search.addSearchUser(search_user._id, {id: req.session.suser._id}, (err, response) =>{
                                if(err){
                                    console.log(err);
                                }else{
                                    user.requestUserId = search_user._id;
                                    user.requestToken = code;
                                    user.requestTokenExpires = Date.now() + 3600000; // 1 hour
                                    user.save(function(err) {
                                        done(err, code, user);
                                    });
                                }
                            })
                        }else{
                            res.send({error:{status: true, message: 'Daily limit exeeded'}});
                        }
                    }
                });
            },
            function(code, user, done) {
                let smtpTransport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'evrytng006@gmail.com',
                    pass: 'evrytng@124'
                }
                });
                let mailOptions = {
                to: user.email,
                from: 'evrytng006@gmail.com',
                subject: 'Sprof search result mail',
                text: 'You are receiving this because you (or someone else) have requested a search from your account.\n\n' +
                    'Regarding '+ search_user.name+ '.\n\n'+
                    'Please enter the following code, or paste this this in the otp box to complete the process:\n\n' +
                    ''+code+'\n\n'+
                    'If you did not request this, please ignore this email.\n'
                };
                smtpTransport.sendMail(mailOptions, function(err, data) {
                    if(err) throw err;
                    else{
                        res.send({error:{status:false, message:'Confirmation link sent to you email address'}});
                    }
                });
            }
        ]);
    }else{
        res.send({error: {status: true, message: 'Please enter a valid id number'}});
    }
})

router.post('/confirm', (req, res) => {
    let code = ''+req.body.code;
    if(code){
        code = code.trim();
    }
    User.findById(req.session.suser._id, (err, user) => {
        if(err) throw err;
        else if(user){
            if(code === user.requestToken && Date.parse(user.requestTokenExpires) >= Date.now()){
                Profile.findById(user.requestUserId, (err, puser) => {
                    if(err) throw err;
                    else if(puser){
                        user.requestToken = undefined;
                        user.requestTokenExpires = undefined;
                        user.requestUserId = undefined;
                        user.save();
                        res.send({error:{status:false}, data: puser});
                    }else{
                        res.send({error:{status:true, message:'Requested user is not with us.'}});                        
                    }
                })
            }else{
                res.send({error:{status:true, message:'Wrong OTP or session expired please try again.'}});
            }
        }else{

        }
    })
})

let getRand = function(){
    let num = Math.floor(Math.random()*10000 + 1);
    let str = ''+num;
    while(str.length < 4){
        str = '0'+str;
    }
    return str;
}
module.exports = router;
