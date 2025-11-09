const mongoose = require('mongoose');
const schema = mongoose.Schema;

const phonebookSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        require: true,
    },
    number: String,
})

phonebookSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject.__v
        delete returnedObject._id
    }
})

module.exports = mongoose.model('Phone', phonebookSchema);