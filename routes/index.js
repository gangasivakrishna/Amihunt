var express = require('express');
var router = express.Router();

let result = {error: {status: false, message: '', data:undefined, code: undefined}};

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.suser){
    res.redirect('/home');
  }else{
    res.render('login');
  }
})
.get('/login', (req, res) => {
  if(req.session.suser){
    res.redirect('/home');
  }else{
    res.render('login');
  }
})
.get('/register', (req, res) => {
  if(req.session.suser){
    res.redirect('/home');
  }else{
    res.render('register');
  }
})
.get('/home', (req, res) => {
  if(req.session.suser){
    res.render('home');
  }else{
    res.redirect('/login');
  }
})

.get('/logout', (req, res) => {

  if(req.session.suser){
    initializeResult();
    result.error.status = false;
    result.error.message = 'Successfully logged out.';
    req.session.destroy();
    res.send(result);
  }else{
    initializeResult();
    result.error.status = true;
    result.error.message = 'Already logged out.';
    res.send(result);
  }
})
.get('/confirm', (req, res) => {
  if(req.session.suser){
    res.redirect('/home');
  }else{
    res.render('sendmail');
  }
})
.get('/mailsent', (req, res) => {
  if(req.session.suser){
    res.redirect('/home');
  }else{
    res.render('mailsent');
  }
})

.get('/reset', (req, res) => {
  if(req.session.suser){
    res.redirect('/home');
  }else{
    res.render('reset');
  }
})
module.exports = router;

initializeResult = function(){
  result.error.status = undefined;
  result.error.code = undefined,
  result.error.data = undefined,
  result.error.message = undefined,
  result.data = undefined;
}