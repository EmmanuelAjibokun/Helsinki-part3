const mongoose = require('mongoose');

// get commandline arguments
if (process.argv.length < 3) {
    console.log("give password as argument");
    process.exit(1);
}
const password = process.argv[2];
console.log("password: ", password)

const url = `mongodb+srv://emmanuel:${password}@cluster0.lsq7sow.mongodb.net/Phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));;

const phonebookSchema = new mongoose.Schema({
    id: String,
    name: String,
    number: String,
})

const Phone = new mongoose.model('Phone', phonebookSchema)


if (process.argv.length == 3) {
    console.log("Phonebook: ");
    Phone.find({})
        .then(person => {
            console.log("show phone details")
            person.forEach(person => {
                console.log(`${person.name} ${person.number}`)
            })
        })
        .catch(err => {
            console.log("Err fetching phones", err.message)
        })
        .finally(() => {
            mongoose.connection.close()
        })
}

if (process.argv.length == 5) {
    // console.log("Phonebook: ");
    const phone = new Phone({
        "id": "1",
        "name": process.argv[3], 
        "number": process.argv[4]
    })

    phone.save().then(result => {
        console.log("Details saved")
        mongoose.connection.close()
    })
}
