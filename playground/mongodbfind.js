// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb'); // new way in ES6: object destructring

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err){
    return console.log('Unable to connect to MongoDB server.');
  };
  console.log('Connected to MongoDB server.');
  var db = client.db('TodoApp');  // new in version ^3.0.0: client is returned (it was db in previous revision)
  // db.collection('Users').find().toArray().then((doc) => {
  //   console.log(doc);
  // }, (err) => {
  //   if (err) {
  //     console.log('Unable to find', err);
  //   }
  // });
  db.collection('Users').find({name: 'Ali'}).toArray().then((doc) => {
    console.log(doc);
  }, (err) => {
    if (err) {
      console.log('Unable to find', err);
    }
  });


  client.close(); // new in version ^3.0.0: client.close is correct (it was db.close in previous revision)
});
