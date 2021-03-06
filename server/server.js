require('./config/config');  // just to run config file

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');


var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {Todo} = require('./models/todo');
var {authenticate} = require('./middleware/authenticate');


var app = express();
const port = process.env.PORT;
app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
  var newTodo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });
  newTodo.save().then((doc) => {
    res.send(doc);
  }, (er) => {
    res.status(400).send(er);
  });
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({todos })
  }, (er) => {
    res.status(400).send(er);
  })
});

app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send('id is not valid!');
  };
  Todo.findOne({
    _id: id,
    _creator: req.user._id
    }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    };
    res.send({todo});
  }).catch((er) => res.status(400).send());
});

app.delete('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send('id is not valid!');
  };
  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    };
    res.send({todo});
  }).catch((er) => res.status(400).send());
});

app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);
  if (!ObjectID.isValid(id)) {
    return res.status(404).send('id is not valid!');
  };
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }
  Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    };
    res.send({todo});
  }).catch((er) => res.status(400).send());
});

app.post('/users', (req, res) => {
  var reqUser = _.pick(req.body, ['email', 'password'])
  var user = new User(reqUser);
  user.save().then(() => {
      return user.generateAuthToken();
    }).then((token) => {
      res.header('x-Auth', token).send(user);
    }).catch((er) => {
      res.status(400).send(er);
    });
});

app.post('/users/login', (req, res) => {
  var reqUser = _.pick(req.body, ['email', 'password'])

  User.findByCredentials(reqUser.email, reqUser.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-Auth', token).send(user);
    });
  }).catch((er) => {
    res.status(400).send(er);
  });
});


app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.listen(port, ()=> {
  console.log(`Listening to port ${port}`);
});

module.exports = {app};
