const chai = require('chai');
const request =require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed')

const expect = chai.expect;

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () =>{
  it('should create a new todo', (done) => {
    var text = 'Test todo text';
    request(app)
    .post('/todos')
    .send({text}) // it is es6 syntax. it is short form of {text: text}
    .expect(200)
    .expect((res) => {
      expect(res.body.text).to.equal(text);
    })
    .end((err, res) => {
      if (err) {
        return done(err);
      }
      Todo.find({text}).then((todos) => {
        expect(todos.length).to.equal(1);
        expect(todos[0].text).to.equal(text);
        done();
      }).catch((err) => done(err));
    });
  });

  it('should not create a new todo', (done) => {
    request(app)
    .post('/todos')
    .send({})
    .expect(400)
    .end((err, res) => {
      if (err) {
        return done(err)
      }

      Todo.find().then((todos) => {
        expect(todos.length).to.equal(2);
        done();
      }).catch((err) => done(err));
    });

  });
});

describe('GET /todos' , () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).to.equal(2);
      }).end((err, res) => {
        if (err) {
          return done(err);
        };
          done();

      });
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).to.equal(todos[0]._id.toHexString());
        expect(res.body.todo.text).to.equal(todos[0].text);
      }).end(done)
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${(new ObjectID).toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 object id is invalid', (done) => {
    request(app)
      .get(`/todos/3434`)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove todo', (done) => {
    request(app)
      .delete(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).to.equal(todos[0]._id.toHexString());
        expect(res.body.todo.text).to.equal(todos[0].text);
      }).end((err, res) =>{
        if (err) {
          return done(err);
        };
        Todo.findById(todos[0]._id).then((todo) => {
          expect(todo).to.be.null;
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${(new ObjectID).toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .get(`/todos/3434`)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update todo', (done) => {
    var hexId = todos[0]._id.toHexString();
    todos[0].text = 'Patched by test';
    todos[0].completed = true;
    request(app)
      .patch(`/todos/${hexId}`)
      .send(todos[0])
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).to.equal('Patched by test');
        expect(res.body.todo.completed).to.be.true;
        expect(res.body.todo.completedAt).to.be.a('number');
      }).end((err, res) => {
        if (err) {
          return done(err);
        };
        done();
      });
  });

  it('should clear completedAt when completed is not completed', (done) => {
    var hexId = todos[1]._id.toHexString();
    todos[0].text = 'Patched by test2';
    todos[0].completed = false;
    request(app)
      .patch(`/todos/${hexId}`)
      .send(todos[0])
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).to.equal('Patched by test2');
        expect(res.body.todo.completed).to.be.false;
        expect(res.body.todo.completedAt).to.be.null;
      }).end((err, res) => {
        if (err) {
          return done(err);
        };
        done();
      });
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated' , (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).to.equal(users[0]._id.toHexString());
        expect(res.body.email).to.equal(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated' , (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).to.be.empty;
        expect(res.body._id).to.be.undefined;
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'sth@sth.com';
    var password = 'pass123';

    request(app)
     .post('/users')
     .send({email, password})
     .expect(200)
     .expect((res) => {
       expect(res.body._id).to.exist;
       expect(res.body.email).to.equal(email);
     }).end((er) => {
       if (er) {
         return done(er);
       };
       User.findOne({email}).then((user) => {
         expect(user).to.exist;
         expect(user.password).to.not.equal(password);
         done();
       }).catch((er) => {
         done(er);
       });
     });
  });

  it('should return validation errors if request invalid', (done) => {
    var email = 'sthsth.com';
    var password = 'pass123';

    request(app)
     .post('/users')
     .send({email, password})
     .expect(400)
     .end(done);
  });

  it('should not create user if email is in use', (done) => {
    var email = users[0].email;
    var password = 'pass123';

    request(app)
     .post('/users')
     .send({email, password})
     .expect(400)
     .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login users and return auth token', (done) => {
    var email = users[1].email;
    var password = users[1].password;

    request(app)
     .post('/users/login')
     .send({email, password})
     .expect(200)
     .expect((res) => {
       expect(res.header['x-auth']).to.exist;
       expect(res.body._id).to.exist;
       expect(res.body.email).to.equal(email);
     }).end((er, res) => {
       if (er) {
         return done(er);
       };
       User.findById(users[1]._id).then((user) => {
         expect(user.tokens[0]).to.include({
           'access': 'Auth',
           'token': res.header['x-auth']
         });
         done();
       }).catch((er) => {
         done(er);
       });

     });
  });

  it('should reject invalid login', (done) => {
    var email = users[1].email;
    var password = 'invalidpassword';
    request(app)
    .post('/users/login')
    .send({email, password})
    .expect(400)
    .expect((res) => {
      expect(res.header['x-auth']).to.be.undefined;
      expect(res.body._id).to.be.undefined;
    }).end((er, res) => {
      if (er) {
        return done(er);
      };
      User.findById(users[1]._id).then((user) => {
        expect(user.tokens.length).to.be.equal(0);
        done();
      }).catch((er) => {
        done(er);
      });
    });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout' , (done) => {
    var token = users[0].tokens[0].token;
    request(app)
    .delete('/users/me/token')
    .set('x-auth', token)
    .expect(200)
    .expect((res) => {
      expect(res.header['x-auth']).to.be.undefined;
    }).end((er, res) => {
      if (er) {
        return done(er);
      };
      User.findById(users[0]._id).then((user) => {
        expect(user.tokens.length).to.be.equal(0);
        done();
      }).catch((er) => {
        done(er);
      });
    });
  });
});
