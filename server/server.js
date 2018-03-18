var express = require('express');
var bodyParser = require('body-parser');


var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {Todo} = require('./models/todo');


var app = express();
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var newTodo = new Todo({
    text: req.body.text
  });
  newTodo.save().then((doc) => {
    res.send(doc);
  }, (er) => {
    res.status(400).send(er);
  });
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos })
  }, (er) => {
    res.status(400).send(er);
  })
});

app.listen(3000, ()=> {
  console.log('Listening to port 3000');
});

module.exports = {app};
