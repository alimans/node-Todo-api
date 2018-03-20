const chai = require('chai');
const request =require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
  _id: new ObjectID(),
  text: 'first test text'
}, {
  _id: new ObjectID(),
  text: 'second test text',
  completed: true,
  completedAt: 343
}];

const expect = chai.expect;

beforeEach((done) => {
  Todo.remove({}).then(() =>  {
    return Todo.insertMany(todos);
  }).then(() => done()); // this will clean database before each test.
})

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
