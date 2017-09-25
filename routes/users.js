let express = require('express');
let router = express.Router();
let User = require('../models/user');
let crypto = require('crypto');
let bcrypt = require('bcryptjs');
let async = require('async');
let nodemailer = require('nodemailer');

let result = {error: {status: false, message: '', data:undefined, code: undefined}};

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signin', (req, res) => {
  if(req.session.suser){
    initializeResult();
    result.error.status = true;
    result.error.message = "Sorry already logged in as "+req.session.suser.name;
    res.send(result);
  }else{
    User.loginUser(req.body, (err, response) => {
      if(response.error.status){
        response.data = undefined;
        res.send(response);
      }else{
        req.session.suser = response.data;
        res.send(response);
      }
    });
  }
});

router.post('/signup', (req, res) => {

  if(req.session.suser){
    initializeResult();
    result.error.status = true;
    result.error.message = "Sorry already logged in as "+req.session.suser.name;
    res.send(result);
  }else{
    User.createUser(req.body, (err, response) =>{
      if(response.error.status){
        res.send(response);
      }else{
        res.send(response);
      }
    });
  }
});

router.post('/confirm', (req, res) => {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        let token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      let email = '';
      if(req.body.email){
         email = req.body.email.trim();
      }
      User.findByEmail(email, function(err, response) {
        let user = response.data;
        if (!user) {
          res.send(response);
        }
        else{
          user = new User(user);
          user.confirmUserToken = token;
          user.confirmUserExpires = Date.now() + 3600000; // 1 hour
          user.save(function(err) {
            done(err, token, user);
          });
        }
      });
    },
    function(token, user, done) {
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
        subject: 'Sprof confirmation mail',
        text: 'You are receiving this because you (or someone else) have created your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/users/confirm/' + token + '\n\n' +
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

});



router.post('/reset', (req, res) => {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        let token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      let email = req.body.email;
      if(email){
         email = email.trim();
      }
      User.findByEmail(email, function(err, response) {
        let user = response.data;
        if (!user) {
          res.send(response);
        }
        else{
          user = new User(user);
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          user.save(function(err) {
            done(err, token, user);
          });
        }
      });
    },
    function(token, user, done) {
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
        subject: 'Amihunt reset password mail',
        text: 'You are receiving this because you (or someone else) have requested for reset the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err, data) {
        if(err) throw err;
        else{
          res.send({error:{status:false, message:'Reset password link sent to you email address'}});
        }
      });
    }
  ]);

});


router.get('/reset/:token', (req, res) => {
  let token = req.params.token;
  User.findOne({resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if(!user) {
      return res.redirect('/reset');
    }else{
      res.render('setpasswd');
    }
  });
});

router.post('/reset/:token', function(req, res) {
  let password = req.body.password;
  if(password){
    password = password.trim();
  }
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          res.send({error:{status:true, message:'Password reset token is invalid or has expired.'}});
        }
        else{
          bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
                user.password = hash;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                user.save(function(err) {
                  done(err, user);
                });
            });
          });
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'evrytng006@gmail.com',
          pass: 'evrytng@124'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'evrytng006@gmail.com',
        subject: 'Your Amihunt password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        res.send({error:{status:false, message:'Your password successfully changed'}});
        done(err, 'done');
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});




router.get('/confirm/:token', (req, res) => {
  let token = req.params.token;
  User.findOne({confirmUserToken: token, confirmUserExpires: { $gt: Date.now() } }, function(err, user) {
    if(!user) {
      return res.redirect('/confirm');
    }else{
      user.confirmed = true;
      user.confirmUserToken = undefined;
      user.confirmUserExpires = undefined;

      user.save();
      res.redirect('/login');
    }
  });
});
module.exports = router;

initializeResult = function(){
  result.error.status = undefined;
  result.error.code = undefined,
  result.error.data = undefined,
  result.error.message = undefined,
  result.data = undefined;
}
