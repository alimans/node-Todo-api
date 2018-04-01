const {mongoose} = require('./../db/mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs')

// Schema for User collection
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email.'
    }
  },
  password:{
    type: String,
    required: true,
    minlength:6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});
// UserSchema.methods used for adding methods to "instance methods"
UserSchema.methods.toJSON = function () { // this is overriding the toJSON for returning modified model element
  var user = this;
  var userObject = user.toObject();
  return _.pick(userObject, ['_id', 'email']);
};

 UserSchema.methods.generateAuthToken = function () {
   var user = this;
   var access = 'Auth';
   var token = jwt.sign({_id: user._id.toHexString(), access}, '123abc').toString();

   user.tokens.push({access, token});

   return user.save().then(() => {
     return token;
   });
 };

 UserSchema.methods.removeToken = function (token) {
   var user = this;

   return user.update({
     $pull: {
       tokens: {token}
     }
   });
 };
// UserSchema.statics used for adding methods to "Model methods"
UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, '123abc');
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'Auth'
  });
};

UserSchema.statics.findByCredentials = function (email, pass) {
  var User = this;

  return User.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject();
    };
    return new Promise((resolve, reject) => {
      bcrypt.compare(pass,  user.password, (err, res) => {
        if (!res) {
          reject();
        };
        resolve(user);
      });
    });
  });
};

UserSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (er, salt) => {
      bcrypt.hash(user.password, salt, (er, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

 var User = mongoose.model('User', UserSchema );

 module.exports = {
   User
 };
