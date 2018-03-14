// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb'); // new way in ES6: object destructring

var obj = new ObjectID();
console.log(obj);  // creating new random id in mongodb ways.

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err){
    return console.log('Unable to connect to MongoDB server.');
  };
  console.log('Connected to MongoDB server.');
  var db = client.db('TodoApp');  // new in version ^3.0.0: client is returned (it was db in previous revision)
  // db.collection('Todos').insertOne({
  //   text: 'Something to do',
  //   completed: false
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable to insert todo', err);
  //   }
  //   console.log(JSON.stringify(result.ops, undefined, 2));
  // });
  db.collection('Users').insertOne({
    name: 'Ali',
    age: 39,
    location: 'Canada'
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert todo', err);
    }
    console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
  });
  client.close(); // new in version ^3.0.0: client.close is correct (it was db.close in previous revision)
});
