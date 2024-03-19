/* Test for functions in Database.js */
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const db = require('../Utils/Database');

// models to interact with memory server
const UserModel = mongoose.model('user', require('../Schema/userSchema'));
const ChatModel = mongoose.model('chat', require('../Schema/chatSchema'));

const inputs = require('./mockInputs.js');

let mongoServer;
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = await mongoServer.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Test database interactions', () => {
    const mockUser = 'user@gmail.com';

    test('getUser gets correct user given username', async () => {
        await UserModel.create({ username: mockUser });

        const gotUser = await db.getUser('user@gmail.com');
        expect(gotUser.username).toBe(mockUser);
    })

    test('getUser fails with nonexisting username', async () => {
        const res = await db.getUser('nouser@gmail.com');
        expect(res).toBeNull();
    })

    test('addUser adds a valid username to database', async () => {
        const newUser = { username: 'newuser@gmail.com' };
        const res = await db.addUser(newUser);

        const findUser = await UserModel.findOne(newUser);
        expect(findUser).toBeDefined();
        expect(findUser.username).toBe(newUser.username);
        expect(res).toBeTruthy();
    })

    test('addUser fails on invalid user', async () => {
        const invalidUser = { username: null };
        const res = await db.addUser(invalidUser);
        const findUser = await UserModel.findOne(invalidUser);
        expect(findUser).toBeNull();
        expect(res).toBeFalsy();
    })

    const preferenceUser = {
        username: 'testpreferences@gmail.com',
        password: 'testpassword',
        preferences: { 
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
        },
        events: [],
        daySchedule: [],
    };

    test('updatePreferences works on correct inputs', async () => {
        const newUser = new UserModel(preferenceUser);
        await newUser.save();

        const updatedPreferences = { 
            commute_method: 'Transit',
            preparation_time: '30',
            notification_preferences: {
                event_alarm: false,
                event_notification: false,
            },
            maxMissedBus: '5',
        }
        const expectedPreferences = { 
            commute_method: 'Transit',
            preparation_time: '30',
            notification_preferences: {
                morning_alarm: true, // unchanged
                event_alarm: false,
                event_notification: false,
                traffic_alerts: true, // unchanged
                weather_alerts: true, // unchanged
            },
            maxMissedBus: '5',
        }
        await db.updatePreferences(preferenceUser.username, updatedPreferences);
        const findUser = await UserModel.findOne({ username: preferenceUser.username });
        expect(findUser.preferences).toEqual(expectedPreferences);
    })

    test('fail to updatePreferences for non-existing user', async () => {
        const badUser = 'doesntexist@gmail.com';
        const updatedPreferences = { 
            commute_method: 'Bicycle',
        }
        const res = await db.updatePreferences(badUser, updatedPreferences);
        const findUser = await UserModel.findOne({ username: badUser });
        expect(findUser).toBeNull();
        expect(res).toBeFalsy();
    })

    const today = new Date();
    const eventsToAdd = [
        { 
            eventName: 'cpen321',
            start: today.toISOString(),
            end: '2023-11-30T12:00:00Z',
            address: '2357 Main Mall, Vancouver',
        },
        { 
            eventName: 'event2',
            start: today.toISOString(),
            end: '2023-11-30T12:00:00Z',
            address: '6200 University Blvd, Vancouver',
        },
        {
            eventName: "CPEN442 Meeting", // existing event
            start: today.toISOString(),
            end: '2023-11-30T12:00:00Z',
            address: '6200 University Blvd, Vancouver',
        }
    ];

    test('addEvents to a valid user', async () => {
        await db.addUser(inputs.sampleUser);
        await db.addEvents(inputs.sampleUser.username, eventsToAdd);
        
        const findUser = await UserModel.findOne({ username: inputs.sampleUser.username });
        expect(findUser.events.length).toBe(4); // 2 events already in, adding 2 new events, 1 existing already
        
        let expectedAddedEvent = eventsToAdd[0];
        expectedAddedEvent.hasChat = true;
        expect(findUser.events).toContainEqual(expectedAddedEvent);
    })

    test('addEvents fail on invalid user', async () => {
        const badUser = 'invalid@gmail.com';
        const res = await db.addEvents(badUser, eventsToAdd);

        const findUser = await UserModel.findOne({ username: badUser });
        expect(findUser).toBeNull();
        expect(res).toBeFalsy();
    })

    const scheduleToAdd = [ { event: 'event1', route: 'route 1' }, ];
    test('addSchedule for valid user', async () => {
        const res = await db.addSchedule(inputs.sampleUser.username, scheduleToAdd);

        const findUser = await UserModel.findOne({ username: inputs.sampleUser.username });
        expect(findUser.daySchedule).toEqual(scheduleToAdd);
        expect(res).toBeTruthy();
    })

    test('addSchedule fails on invalid user', async () => {
        const badUser = 'invalid@gmail.com';
        const res = await db.addSchedule(badUser, scheduleToAdd);

        const findUser = await UserModel.findOne({ username: badUser });
        expect(findUser).toBeNull();
        expect(res).toBeFalsy();
    })

    const testMessageLimit = 5;
    const mockChat = { chatName: 'cpen321', messages: [
        { message: 'hi', sender: 'me', timestamp: 123 }, 
        { message: 'hi', sender: 'me', timestamp: 123 }, 
        { message: 'hi', sender: 'me', timestamp: 123 }, 
        { message: 'hi', sender: 'me', timestamp: 123 }, 
        { message: 'lastmessage', sender: 'me', timestamp: 123 }, // test value for message limit is 5
    ] };

    test('createRoom makes new room in database', async () => {
        const newRoomName = 'cpen491';

        const res = await db.createRoom('cpen491');
        expect(res.chatName).toBe(newRoomName);
        expect(res.messages.length).toBe(0);
    })

    test('getRoom returns the room object from database', async () => {
        const newChat = new ChatModel(mockChat);
        await newChat.save();

        const res = await db.getRoom(mockChat.chatName);
        expect(res.chatName).toBe(mockChat.chatName);
        expect(res.messages.length).toBe(testMessageLimit);
    })

    const message = { message: 'newmessage', sender: 'test', timestamp: 321 };

    test('addMessage adds a message to a chat', async () => {
        await db.addMessage(mockChat.chatName, message);

        const findChat = await ChatModel.findOne({ chatName: mockChat.chatName });
        expect(findChat.chatName).toBe(mockChat.chatName);
        expect(findChat.messages.length).toBe(testMessageLimit);
        expect(findChat.messages).toContainEqual(expect.objectContaining({ message: 'newmessage' }));
        expect(findChat.messages).not.toContainEqual(expect.objectContaining({ message: 'lastmessage' }));
    })

    test('addMessage creates room if not exist and adds message', async () => {
        const newRoom = 'cpen355';
        await db.addMessage(newRoom, message);

        const findChat = await ChatModel.findOne({ chatName: 'cpen355' });
        expect(findChat.chatName).toBe(newRoom);
        expect(findChat.messages.length).toBe(1);
        expect(findChat.messages).toContainEqual(expect.objectContaining({ message: 'newmessage' }));
    })

    // connect coverage, run this last since it disconnects from memoryserver
    test('connect function on database', async () => {
        await mongoose.disconnect();
        process.env.TESTING = 'false';

        jest.mock('mongoose');
        const connectSpy = jest.spyOn(mongoose, 'connect').mockImplementation(() => { return true });

        await db.connect();
        expect(connectSpy).toHaveBeenCalledWith(process.env.MONGO_URI);
        
        jest.unmock('mongoose');
        process.env.TESTING = 'true';
    })
})

