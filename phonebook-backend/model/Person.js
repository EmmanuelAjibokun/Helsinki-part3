const mongoose = require('mongoose');
const schema = mongoose.Schema;

const phonebookSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        require: true,
    },
    number: {
        type: String,
        validate: {
            validator: function(v) {
                // Pattern: 2–3 digits, dash, then 5+ digits
                const pattern = /^\d{2,3}-\d+$/;
                return v.length >= 8 && pattern.test(v);
            },
            message: props => `${props.value} is not a valid phone number! Format: 2–3 digits, dash, and more digits (e.g. 09-1234556)`
        }
    }
})

phonebookSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject.__v
        delete returnedObject._id
    }
})

module.exports = mongoose.model('Phone', phonebookSchema);