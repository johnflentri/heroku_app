const Sequelize = require('sequelize');

const databaseURL =
  process.env.DATABASE_URL ||
  "postgres://postgres:secret@localhost:5432/postgres";

const sequelize = new Sequelize(databaseURL);

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 4000

app.get('/', (req, res) => res.send('Hello'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.post('/', (req, res) => {
  console.log(req.body)
  res.json({
    message: "We received your request body!",
  })
})

const User = sequelize.define('user', {
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  }
});
const Task = sequelize.define('task', {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING
  },
  completed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
})

sequelize.sync()
  .then(() => console.log('Tables created successfully'))
  .catch(err => {
    console.error('Unable to create tables, shutting down...', err);
    process.exit(1);
  })

app.post('/echo', (req, res) => {
  console.log('hi')
  res.json(req.body)
})

app.post('/users', (req, res, next) => {
  User.create(req.body)
    .then(user => res.json(user))
    .catch(err => next(err))
})

app.get('/users/:userId', (req, res) => {
  User.findByPk(req.params.userId)
    .then(user => {
      if (!user) {
        res.status(404).end()
      } else {
        console.log(user)
        res.json(user)
      }
    })
})

app.put("/user/:userId", (req, res, next) => {
  console.log(req.params)
  User.findByPk(req.params.userId)
    .then(user => {
      if (!user) {
        res.status(404).end()
      } else {
        console.log(req.body)
        return user.update(req.body)
          .then(user => { res.json(user) })
      }
    })
})

app.get('/users/:userId/tasks/:taskId', (req, res, next) => {
  Task.findOne({
    where: {
      id: req.params.taskId,
      userId: req.params.userId
    }
  })
    .then(task => {
      if (task) {
        return res.json(task)
      }
      return res.status(404).end()
    })
    .catch(next)
})

app.post('/users/userId/tasks/:taskId', (req, res, next) => {
  console.log(req.body);
  Task.create(req.body)
    .then(task => res.json(task))
    .catch(err => next(err))
})