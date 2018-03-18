var express = require('express');
var bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');


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

app.get('/todos/:id', (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send('id is not valid!');
  };
  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    };
    res.send({todo});
  }).catch((er) => res.status(400).send());
});

app.listen(3000, ()=> {
  console.log('Listening to port 3000');
});

module.exports = {app};
