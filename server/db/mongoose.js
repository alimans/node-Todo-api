var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp').then((doc) => {
  console.log('Sucessfully connected to db');
}, (er) => {
  console.log(er);
});

module.exports = {
  mongoose
};
