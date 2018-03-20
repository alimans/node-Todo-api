var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI).then((doc) => {
  console.log('Sucessfully connected to db');
}, (er) => {
  console.log(er);
});

module.exports = {
  mongoose
};
