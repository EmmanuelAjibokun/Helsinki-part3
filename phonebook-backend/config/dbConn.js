const mongoose = require("mongoose");

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI


const connectDB = async() => {
    try {
        console.log("Connecting to: ", url)
        await mongoose.connect(url)
    } catch(err) {
        console.error(err);
    }
}

module.exports = connectDB;