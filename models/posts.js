const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// dotenv.config();

// mongoose.connect(process.env.MONGO_URL);

const postSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date: {
        type: Date,
        default: Date.now
    },
    title: String,
    description: String,
    image: String,
    // content: String,
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ]
})

module.exports = mongoose.model("post", postSchema);