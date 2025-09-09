const express = require('express');
const app = express();
const date = new Date();

app.use(express.json());


const phonebook = [
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
    console.log(req);
    res.status(200).json(phonebook);
})

app.get('/info', (req, res) => {
    console.log(req.headers)
    const message = `<h3>Phonebook has info for ${phonebook.length} people</h3>`;
    const dateTime = `<h3>${date.toDateString()} ${date.toTimeString()}</h3>`;
    console.log("DateTime:", dateTime);
    res.status(200).send(`${message}${dateTime}`)
})

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})