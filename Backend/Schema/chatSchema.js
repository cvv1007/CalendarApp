const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    chatID: Number,
    chatName: String,
    messages: [{
        sender: String,
        message: String,
        timestamp: Date,
    }],
});

module.exports = chatSchema;
