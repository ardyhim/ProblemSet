var express = require('express');
var router = express.Router();
var md5 = require('md5');
var jwt = require('jsonwebtoken');
var db = require('../mongodb/mongo');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('api');
});

function isAuthenticated(req, res, next) {
  var token = req.body.token || req.query.token || req.headers.token;
  if (token) {
    jwt.verify(token, 'jwtsecret', function(err, decoded) {
      if (err) {
        res.json({
          message: 'Gagal auth token'
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(430).send({
      message: 'Tidak ada token'
    });
  }
}

// users

router.post('/login', function(req, res, next) {
  db.users.findOne({
    username: req.body.username
  }, function(err, data) {
    if (data) {
      if (data.password === md5(req.body.password)) {
        var token = jwt.sign(data, 'jwtsecret', {
          algorithm: 'HS256',
        });
        res.json({
          message: 'Berhasil login',
          success: true,
          token: token
        });
      } else {
        res.json({
          message: 'Password tidak cocok'
        });
      }
    } else {
      res.json({
        message: 'Username tidak di temukan'
      });
    }
  });
});

router.post('/register', function(req, res, next) {

  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  var validEorros = req.validationErrors();
  if (validEorros) {
    res.json({
      success: false,
      message: validEorros
    });
  } else {
    var users = new db.users({
      username: req.body.username,
      password: md5(req.body.password)
    });
    users.save(function(err) {
      if (err) return res.status(401).send();
      return res.json({
        message: 'Berhasil register',
        success: true
      });
    });
  }

});


// contact
router.get('/contact/:paginate', function(req, res, next){
  db.contact.find({}).skip(parseInt(req.params.paginate)).limit(10).exec(function(err, data){
    if(data){
      res.json({success: true, data: data});
    }
  });
});

router.get('/contact/search/:filter/:keyword/:paginate', function(req, res, next){
  if (req.params.filter === "title") {
    db.contact.aggregate([
      {$match: {title: {$regex: req.params.keyword}} }
    ]).exec(function(err, data){
      res.json(data);
    });
  }else if (req.params.filter === "name") {
    db.contact.aggregate([
      {$match: {name: {$regex: req.params.keyword}} }
    ]).exec(function(err, data){
      res.json(data);
    });
  }else if (req.params.filter === "company") {
    db.contact.aggregate([
      {$match: {company: {$regex: req.params.keyword}} }
    ]).exec(function(err, data){
      res.json(data);
    });
  }else if (req.params.filter === "phone") {
    db.contact.aggregate([
      {$match: {phone: {$regex: req.params.keyword}} }
    ]).exec(function(err, data){
      res.json(data);
    });
  }else if (req.params.filter === "email") {
    db.contact.aggregate([
      {$match: {email: {$regex: req.params.keyword}}}
    ]).exec(function(err, data){
      res.json(data);
    });
  }else if (req.params.filter === "andress") {
    db.contact.aggregate([
      {$match: {andress: {$regex: req.params.keyword}}}
    ]).skip(parseInt(req.params.paginate)).limit(10).exec(function(err, data){
      res.json(data);
    });
  }
});

router.post('/contact', function(req, res, next){
  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('phone', 'Phone is required').notEmpty();
  req.checkBody('andress', 'Andress is required').notEmpty();
  req.checkBody('company', 'Company is required').notEmpty();
  var validEorros = req.validationErrors();
  if (validEorros) {
    res.json({
      success: false,
      message: validEorros
    });
  } else {
    var users = new db.contact({
      title: req.body.title,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      andress: req.body.andress,
      company: req.body.company
    });
    users.save(function(err) {
      if (err) return res.status(401).send();
      return res.json({
        message: 'Berhasil tambah contact',
        success: true
      });
    });
  }
});

router.put('/contact/:id', function(req, res, next){
  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty().isEmail();
  req.checkBody('phone', 'Phone is required').notEmpty();
  req.checkBody('andress', 'Andress is required').notEmpty();
  req.checkBody('company', 'Company is required').notEmpty();
  var validEorros = req.validationErrors();
  if (validEorros) {
    res.json({
      success: false,
      message: validEorros
    });
  } else {
    var data = {
      title: req.body.title,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      andress: req.body.andress,
      company: req.body.company
    };
    db.contact.findOneAndUpdate({_id:req.params.id}, data, function(err, data){
      if(err) return res.status(401).send();
      res.json({success: true, message: "Berhasil update contact"});
    });
  }
});

router.delete('/contact/:id', function(req, res, next){
  db.contact.findOneAndRemove({_id: req.params.id}, function(err, data){
    if(err) return res.status(401).send();
    res.json({success: true, message: "Berhasil delete contact"});
  });
  // res.json({success: true,message:'test'});
});

module.exports = router;
