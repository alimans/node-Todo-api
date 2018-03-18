var {mongoose} = require('./../db/mongoose');

// Schema for User collection
 var User = mongoose.model('User', {
   name: {
     type: String,
     required: true,
     minlength: 1,
     trim: true
   },
   age: {
     type: Number,
   },
   email: {
     type: String,
     required: true,
     minlength: 1,
     trim: true
   }
 });

 module.exports = {
   User
 };
