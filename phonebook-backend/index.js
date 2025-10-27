const express = require('express');
const requestLogger = require('./requestLogger');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const date = new Date();
const mongoose = require('mongoose');

const connectDB = require('./config/dbConn.js');
const Phone = require('./model/Person');

morgan.token("body", (req) => {
  return req.body ? JSON.stringify(req.body) : ""
})
const logger = morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.body(req, res)
  ].join(' ')
})

connectDB();

app.use(cors())
app.use(express.json());
app.use(logger);
app.use(express.static('dist'))


const generateId = () => {
  return Math.floor(Math.random() * 1000)
}

let phonebook = [
  { 
    "id": "1",
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": "2",
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": "3",
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": "4",
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get('/api/persons', (req, res) => {
  Phone.find({})
    .then(phonebook => {
      res.status(200).json(phonebook);
    })
})

app.get('/info', async (req, res) => {
  console.log(req.headers)
  let phones;
  await Phone.find({})
    .then(phonebook => {
      phones = phonebook;
    })
  const message = `<h3>Phonebook has info for ${phones.length} people</h3>`;
  const dateTime = `<h3>${date.toDateString()} ${date.toTimeString()}</h3>`;
  console.log("DateTime:", dateTime);
  res.status(200).send(`${message}${dateTime}`)
})

app.get('/api/persons/:id', async (req, res) => {
  const personId = req.params.id

  if (!mongoose.Types.ObjectId.isValid(personId)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  const foundPerson = await Phone.findById(personId);
  if(!foundPerson) {
    return res.sendStatus(404);
  } else {
    console.log(foundPerson)
    res.status(200).json(foundPerson);
  }
})

app.delete('/api/persons/:id', async (req, res) => {
  const personId = req.params.id

  if (!mongoose.Types.ObjectId.isValid(personId)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const personExist = await Phone.findById(personId);
  if(!personExist) {
    return res.status(404).send(`Person of ${personId} id, does not exist`);
  }
  await Phone.deleteOne({_id: personId})
  res.status(204).end()
})

app.post('/api/persons', async (req, res) => {
  console.log(req.body)
  const newPerson = req.body

  if (!newPerson.name || !newPerson.number) {
    return res.status(400).json({ "error": 'missing field' });
  }

  const personExist = await Phone.findOne({name: newPerson.name}).exec();
  if(personExist) {
    return res.status(400).json({ "error": 'name must be unique' });
  }
  // phonebook = phonebook.concat({id: String(generateId()), ...newPerson})
  const result = await Phone.create({
    name: newPerson.name,
    number: newPerson.number
  })
  // await the promise to ensure the phone is saved on the DB before console logging it

  console.log(result)
  res.status(201).json(result);
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})