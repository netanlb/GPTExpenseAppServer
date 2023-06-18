const mongoose = require('mongoose');
const Schema = mongoose.Schema;

 

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
  },
  register_date: {
    type: Date,
    dafault: Date.now
  }
})

 

module.exports = User = mongoose.model('user', UserSchema);