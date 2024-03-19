const mongoose = require('mongoose');
const deepMerge = require('deepmerge');

const userSchema = require('../Schema/userSchema');
const chatSchema = require('../Schema/chatSchema')

// models to interact with database collections
const UserModel = mongoose.model('user', userSchema);
const ChatModel = mongoose.model('chat', chatSchema);

// loading env variables
const path = require('path');
const envFilePath = path.join(__dirname ,'/../.env');
require('dotenv').config({ path: envFilePath });

const maxMessages = 5; // maximum messages displayed to user
const mongoURI = process.env.MONGO_URI;

class Database {
    constructor() {
        this.connect();
    }

    async connect() {
        if (process.env.TESTING === 'false') await mongoose.connect(mongoURI);
        console.log('Database class connected to MongoDB at: ' + mongoURI);
    }

    /**
     * Get data of a user by username/email
     * @param {String} username email of user
     * @returns User object in database
     */
    async getUser(username) {
        return await UserModel.findOne({ username });
    }

    /**
     * Add a new user to Users Database
     * @param {String} user username user signed in with through google
     * @returns true on success, false on null user
     */
    async addUser(user) {
        if (user.username == null) return false;
    
        user.preferences = user.preferences || {
            commute_method: 'Driving',
            preparation_time: '0',
            notification_preferences: {
                morning_alarm: true,
                event_alarm: true,
                event_notification: true,
                traffic_alerts: true,
                weather_alerts: true,
            },
            maxMissedBus: '1',
        };
        user.events = user.events || [];
        user.daySchedule = user.daySchedule || [];

        const newUser = new UserModel(user);
        await newUser.save();
        return true;
    }

    /**
     * Update preferences for user in database
     * @param {String} username 
     * @param {Object} preferences object with preference field to update
     * @returns true on success, false on no user
     */
    async updatePreferences(username, preferences) {
        let userToUpdate = await UserModel.findOne({ username });
        if (!userToUpdate) return false;

        userToUpdate.preferences = deepMerge(userToUpdate.preferences, preferences);
        await userToUpdate.save();
        return true;
    }

    /**
     * Add an array of events to events array in Database
     * @param {String} username 
     * @param {Array} events array with events to add to Database
     * @returns true on success, false on no user
     */
    async addEvents(username, events) {
        const user = await UserModel.findOne({ username });
        if (!user) return false;

        const coursePattern = /^[A-Z]{4}\d{3}/i;
        let newEvents = [];
        for (let e of events) {
            if (coursePattern.test(e.eventName)) e.hasChat = true;
            else e.hasChat = false;

            let included = false;
            for (let ue of user.events) {
                if (ue.eventName === e.eventName) included = true;
            }
            if (!included) newEvents.push(e);
        }
        user.events = [...user.events, ...newEvents];
        await user.save();
        return true;
	}

    /**
     * Add day schedule created by Scheduler to database
     * @param {String} username 
     * @param {Array} schedule array of events with the optimal route to the event for a day
     * @returns true on success, false on no user
     */
    async addSchedule(username, schedule) {
        let user = await UserModel.findOne({ username });
        if (!user) return false;

        user.daySchedule = schedule;
        await user.save();
        return true;
    }

    /**
     * Create a chat room with name chatName
     * @param {String} chatName 
     * @returns The created chat room
     */
    async createRoom(chatName) {
        const newRoom = new ChatModel({ chatName, messages: [] });
        const room = await newRoom.save();
        return room;
    }

    /**
     * Get a chatroom by name
     * @param {String} chatName 
     * @returns chatRoom Object with name, and messages array
     */
    async getRoom(chatName) {
        return await ChatModel.findOne({ chatName });
    }

    /**
     * Add a message object to chatroom in database
     * @param {String} chatName 
     * @param {Object} message object with message string, sender, and timestamp
     */
    async addMessage(chatName, message) {
        let chatDocument = await ChatModel.findOne({ chatName });
        if (!chatDocument) {
            const document = { chatName, messages: [] };
            chatDocument = new ChatModel(document);
        }
        chatDocument.messages.unshift(message);
        if (chatDocument.messages.length > maxMessages) {
            chatDocument.messages.pop();
        }
        await chatDocument.save();
    }
}

module.exports = new Database();