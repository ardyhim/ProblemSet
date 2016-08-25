var mongoose = require('mongoose');
var db = mongoose.connection,
    Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/problemset');
var SchemaContact = new Schema({
  title: String,
  name: String,
  email: Array,
  phone: Array,
  andress: Array,
  company: String
});
exports.contact = db.model('contact', SchemaContact);

var SchemaUsers = new Schema({
  username: String,
  password: String
});
exports.users = db.model('users', SchemaUsers);
