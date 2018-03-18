const chai = require('chai');
const request =require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
  text: 'first test text'
}, {
  text: 'second test text'
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
