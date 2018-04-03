const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {User} = require('./../../models/user');
const {Todo} = require('./../../models/todo');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
    _id: userOneId,
    email: 'email01@example.com',
    password: 'useronePass',
    tokens: [{
      access: 'Auth',
      token: jwt.sign({_id: userOneId.toHexString(), access: 'Auth'}, process.env.JWT_SECRET).toString()
    }]
  },{
    _id: userTwoId,
    email: 'email02@example.com',
    password: 'userTwoPass',
    tokens: [{
      access: 'Auth',
      token: jwt.sign({_id: userTwoId.toHexString(), access: 'Auth'}, process.env.JWT_SECRET).toString()
    }]
  }]
const todos = [{
    _id: new ObjectID(),
    text: 'first test text',
    _creator: userOneId
  }, {
    _id: new ObjectID(),
    text: 'second test text',
    _creator: userTwoId,
    completed: true,
    completedAt: 343
  }];

const populateUsers = (done) => {
  User.remove({}).then(() =>  {// this will clean database before each test.
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();
    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

const populateTodos = (done) => {
  Todo.remove({}).then(() =>  {
    return Todo.insertMany(todos);
  }).then(() => done()); // this will clean database before each test.
};

module.exports = {
  users,
  todos,
  populateUsers,
  populateTodos
};
