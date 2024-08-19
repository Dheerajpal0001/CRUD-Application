const mongoose = require('mongoose');
require('dotenv').config();

console.log('MongoDB URI:', process.env.MONGO_URL);


const databaseConnection = ()=>{
    mongoose.connect(process.env.MONGO_URL).then(()=>{
        console.log("MongoDB connected Successfully");
    }).catch((error)=>{
        console.log(error);
    })
};

module.exports = databaseConnection;