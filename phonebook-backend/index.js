const express = require('express')
// const requestLogger = require('./requestLogger')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const date = new Date()
const mongoose = require('mongoose')

const connectDB = require('./config/dbConn.js')
const Phone = require('./model/Person')
const errorHandler = require('./middleware/errorHandler.js')

morgan.token('body', (req) => {
  return req.body ? JSON.stringify(req.body) : ''
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

connectDB()

app.use(cors())
app.use(express.json())
app.use(logger)
app.use(express.static('dist'))


// const generateId = () => {
//   return Math.floor(Math.random() * 1000)
// }


app.get('/api/persons', (req, res) => {
  Phone.find({})
    .then(phonebook => {
      res.status(200).json(phonebook)
    })
})

app.get('/info', async (req, res) => {
  console.log(req.headers)
  let phones
  await Phone.find({})
    .then(phonebook => {
      phones = phonebook
    })
  const message = `<h3>Phonebook has info for ${phones.length} people</h3>`
  const dateTime = `<h3>${date.toDateString()} ${date.toTimeString()}</h3>`
  console.log('DateTime:', dateTime)
  res.status(200).send(`${message}${dateTime}`)
})

app.get('/api/persons/:id', async (req, res, next) => {
  const personId = req.params.id

  if (!mongoose.Types.ObjectId.isValid(personId)) {
    return res.status(400).json({ error: 'Invalid ID format' })
  }
  await Phone.findById(personId)
    .then( person => {
      if(!person) {
        return res.sendStatus(404)
      } else {
        console.log(person)
        res.status(200).json(person)
      }
    })
    .catch(err => {
      next(err)
    })
})

app.delete('/api/persons/:id', async (req, res, next) => {
  const personId = req.params.id

  if (!mongoose.Types.ObjectId.isValid(personId)) {
    return res.status(400).json({ error: 'Invalid ID format' })
  }

  const personExist = await Phone.findById(personId)
  if(!personExist) {
    return res.status(404).send(`Person of ${personId} id, does not exist`)
  }
  await Phone.deleteOne({ _id: personId })
    .then(() => {
      res.status(204).end()
    })
    .catch(err => {
      next(err)
    })
})

app.post('/api/persons', async (req, res) => {
  try {
    const newPerson = req.body
    console.log('Incoming data:', newPerson)

    // Basic field validation
    if (!newPerson.name || !newPerson.number) {
      return res.status(400).json({ error: 'Name and number are required' })
    }

    // Check for duplicates
    const personExist = await Phone.findOne({ name: newPerson.name }).exec()
    if (personExist) {
      return res.status(400).json({ error: 'Name must be unique' })
    }

    // Create the new record (Mongoose will validate schema)
    const result = await Phone.create({
      name: newPerson.name,
      number: newPerson.number
    })

    console.log('Created:', result)
    res.status(201).json(result)

  } catch (error) {
    // Catch Mongoose validation errors and return clean JSON
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message })
    }

    console.error('Unexpected server error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/persons/:id', async (req, res, next) => {
  const personId = req.params.id
  const person = req.body

  if (!person.name || !person.number) {
    return res.status(400).json({ 'error': 'missing field' })
  }

  try {
    const updatedPerson = await Phone.findByIdAndUpdate(
      personId,
      { name: person.name, number: person.number },
      { new: true, runValidators: true, context: 'query' } // ensures validation and returns updated doc
    )

    if (!updatedPerson) {
      return res.status(404).json({ error: 'Person not found' })
    }

    res.status(200).json(updatedPerson)

  } catch (error) {
    // Catch Mongoose validation errors and return clean JSON
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message })
    }

    console.error('Unexpected server error:', error)
    res.status(500).json({ error: 'Internal server error' })
    next(error)
  }
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})