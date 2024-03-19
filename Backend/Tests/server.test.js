const server = require('../server.js');
const request = require('supertest');

const db = require('../Databases/Database.js');
const Scheduler = require('../Interfaces/Scheduler.js');
const GoogleCalendar = require('../Interfaces/GoogleCalendar.js');
const inputs = require('./mockInputs.js');

// mock database functions to only test endpoint functionalities
jest.mock('../Databases/Database.js');
jest.mock('../Interfaces/GoogleCalendar.js');

// clean up server of tests
afterAll(() => {
    server.close();
})

// Backend tests
// 27 unit tests in server.test.js
// 6 unit test in scheduler.test.js
// 5 unit tests in message.test.js
// 22 unit tests in database.test.js

// Frontend tests
// 2 tests in CreateNewEventTest.java
// 1 test in ExampleInstrumentedTest.java
// 3 tests in preferenceTest.java
// 4 tests in SendMessageTest.java

const today = new Date();
const mockEvents = [
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
];
const mockUser = {
    username: 'user@gmail.com',
    events: mockEvents,
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
}
const mockDirections = {
    routes: [
        {
            legs: [
                {
                    distance: { value: 100, text: '100 m' },
                    duration: { value: 4200, text: '1 hours 10 mins' },
                    end_address: '2357 Main Mall, Vancouver',
                    start_address: '', // not important to mocked implementation
                    steps: [1, 2, 3], // details not important to implementation
                    arrival_time: { value: new Date(), text: '', timezone: 'America/Vancouver'},
                }
            ],
        },
    ],
}
const mockSchedule = [
    {
        event: mockEvents[0],
        route: JSON.parse(JSON.stringify(mockDirections.routes[0].legs[0], (key, value) => {
            if (key === 'steps' || key === 'arrival_time') {
                return undefined;
            }
            return value;
        })),
    },
    {
        event: mockEvents[1],
        route: JSON.parse(JSON.stringify(mockDirections.routes[0].legs[0], (key, value) => {
            if (key === 'steps' || key === 'arrival_time') {
                return undefined;
            }
            return value;
        })),
    }
];

// Interface POST /api/calendar/day_schedule
describe('create day schedule for a user', () => {

    // Input: username latitude longitude
    // Expected status code: 200
    // Expected behavior: create and store schedule in database
    // Expected output: return the schedule 
    it('should create a schedule for the current day', async () => {
        const data = { 
            username: 'user@gmail.com', 
            latitude: 49.1673,
            longitude: 123.1384,
        }
        db.getUser.mockResolvedValue(mockUser);
        db.addSchedule.mockResolvedValue(true);
        jest.spyOn(Scheduler, 'getDirections').mockImplementation(() => { return mockDirections });

        const res = await request(server)
            .post('/api/calendar/day_schedule')
            .send(data)
            .set('Accept', 'application/json');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockSchedule);

        expect(db.getUser).toHaveBeenCalledWith(data.username);
        expect(db.addSchedule).toHaveBeenCalledWith(data.username, res.body);
    })

    // Input: username latitude longitude
    // Expected status code: 200
    // Expected behavior: schedule is empty
    // Expected output: return the schedule 
    it('should not add route to event with no address', async () => {
        const data = { 
            username: 'user@gmail.com', 
            latitude: 49.1673,
            longitude: 123.1384,
        }
        const noAddressEvents = [
            {
                eventName: "CPEN442 Meeting",
                address: null,
                start: today.toISOString(),
                start_timeZone: "America/Vancouver",
                end: "2023-10-31 12:30",
                end_timeZone: "America/Vancouver",
            }
        ]
        const noAddressEventsUser = {
            username: 'user@gmail.com',
            events: noAddressEvents,
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
        }
        db.getUser.mockResolvedValue(noAddressEventsUser);
        db.addSchedule.mockResolvedValue(true);

        const res = await request(server)
            .post('/api/calendar/day_schedule')
            .send(data)
            .set('Accept', 'application/json');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    })

    // Test Case: unable to get directions somewhere
    // Input: username, invalid latitude and/or longitude
    // Expected status code: 500
    // Expected behavior: nothing
    // Expected output: error
    it('should throw error if getting direction fails', async () => {
        const data = { 
            username: 'user@gmail.com', 
            latitude: 'not a lat',
            longitude: 'not a long',
        }

        db.getUser.mockResolvedValue(mockUser);
        db.addSchedule.mockResolvedValue(true);
        jest.spyOn(Scheduler, 'getDirections').mockImplementation(() => { throw new Error('Bad LatLng') });

        const res = await request(server)
            .post('/api/calendar/day_schedule')
            .send(data)
            .set('Accept', 'application/json');
        
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
        expect(res.body).not.toHaveProperty('daySchedule');
    })

    // Test Case: invalid username
    // Input: invalid username, latitude, longitude
    // Expected status code: 404
    // Expected behavior: nothing
    // Expected output: error message
    it('should not work on invalid username', async () => {
        const data = { 
            username: 'notindb@gmail.com', 
            latitude: 49.1673,
            longitude: 123.1384,
        }

        db.getUser.mockResolvedValue(null);
        const res = await request(server)
            .post('/api/calendar/day_schedule')
            .send(data)
            .set('Accept', 'application/json');
        
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message');
        expect(res.body).not.toHaveProperty('daySchedule');
    })
})

// Interface GET /api/calendar/day_schedule
describe('get day schedule for a user', () => {
    
    // Test Case: get day schedule out of database
    // Input: date today, username
    // Expected status code: 200
    // Expected behavior: retrieve schedule from db
    // Expected output: schedule object
    it('should be able to return the day schedule', async () => {
        let day = new Date(today);
        day.setHours(0, 0, 0, 0);

        db.getUser.mockResolvedValue({ daySchedule: mockSchedule });
        const res = await request(server)
            .get(`/api/calendar/day_schedule?user=${mockUser.username}&day=${day}`)

        expect(res.status).toBe(200);
        expect(db.getUser).toHaveBeenCalledWith(mockUser.username);
        expect(res.body[0].route).toStrictEqual(mockSchedule[0].route);
        expect(res.body[0].event).toStrictEqual(mockEvents[0]);
    })

    // Test Case: internal server error
    // Input: today, username
    // Expected status code: 500
    // Expected behavior: nothing
    // Expected output: error
    it('should handle internal server error', async () => {
        let day = new Date(today);
        day.setHours(0, 0, 0, 0);

        jest.spyOn(db, 'getUser').mockImplementation(() => { throw new Error('Database error'); });
        const res = await request(server)
            .get(`/api/calendar/day_schedule?user=${mockUser.username}&day=${day}`)

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    })

    // Test Case: inavlid user
    // Input: today, invalid username
    // Expected status code: 404
    // Expected behavior: nothing
    // Expected output: error message
    it('should not get on invalid username', async () => {
        let day = new Date(today);
        day.setHours(0, 0, 0, 0);

        db.getUser.mockResolvedValue(null);
        const res = await request(server)
            .get(`/api/calendar/day_schedule?user=${mockUser.username}&day=${day}`)

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message');
    })
})

// Interface GET /api/calendar/by_day
describe('get calendar events of a given day', () => {
    const events = [
        { 
            eventName: 'cpen321',
            start: '2023-11-18T09:00:00Z',
            end: '2023-11-18T12:00:00Z',
            address: '2357 Main Mall, Vancouver',
        },
        { 
            eventName: 'cpen321 v2',
            start: '2023-11-18T13:00:00Z',
            end: '2023-11-18T15:00:00Z',
            address: '2357 Main Mall, Vancouver',
        },
    ]

    // Input: username as email string, day string
    // Expected status code: 200
    // Expected behavior: a valid user gets events on 
    // Expected output: array of events on the specified day
    it('should get events of a given day', async () => {
        const user = 'user@gmail.com';
        const date = '2023-11-18';
        db.getUser.mockResolvedValue({ events });

        const res = await request(server)
            .get(`/api/calendar/by_day?user=${user}&day=${date}`)

        expect(res.status).toBe(200);
        expect(res.body).toEqual(events);

        expect(db.getUser).toHaveBeenCalledWith(user);
    })

    // Input: username as email string, day string
    // Expected status code: 500
    // Expected behavior: nothing
    // Expected output: error
    it('should handle error case', async () => {
        const user = 'user@gmail.com';
        const date = '2023-11-18';

        jest.spyOn(db, 'getUser').mockImplementation(() => { throw new Error('Database error'); });
        const res = await request(server)
          .get(`/api/calendar/by_day?user=${user}&day=${date}`)
    
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    });

    // Test Case: inavlid user
    // Input: invalid username, day string
    // Expected status code: 404
    // Expected behavior: nothing
    // Expected output: error message
    it('should not get on invalid username', async () => {
        const user = 'notindb@gmail.com';
        const date = '2023-11-18';

        db.getUser.mockResolvedValue(null);
        const res = await request(server)
          .get(`/api/calendar/by_day?user=${user}&day=${date}`)
    
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message');
    });
})

// Interface GET /api/message_history
describe('get the message history of a specific chat', () => {
    const mockMessages = [
        {message: 'hi', sender: 'me', timestamp: 123},
        {message: 'hi', sender: 'you', timestamp: 123},
        {message: 'bye', sender: 'me', timestamp: 123}
    ];
    const mockChatName = 'cpen321';

    // Test Case: get messages of a room
    // Input: chatName
    // Expected status code: 200
    // Expected behavior: fetch messages from db
    // Expected output: array of message objects
    it('should get message history of a chatroom', async () => {
        db.getRoom.mockResolvedValue({ messages: [
            {message: 'hi', sender: 'me', timestamp: 123},
            {message: 'hi', sender: 'you', timestamp: 123},
            {message: 'bye', sender: 'me', timestamp: 123}
        ] });

        const res = await request(server).get(`/api/message_history?chatName=${mockChatName}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockMessages);

        expect(db.getRoom).toHaveBeenCalledWith(mockChatName);
    })

    // Test Case: internal server error
    // Input: chatName
    // Expected status code: 500
    // Expected behavior: nothing
    // Expected output: error
    it('should return error if issue with database or connection', async () => {
        jest.spyOn(db, 'getRoom').mockImplementation(() => { throw new Error('Database error'); });
        const res = await request(server).get(`/api/message_history?chatName=${mockChatName}`);

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
        expect(res.body).not.toBeInstanceOf(Array);
    })
})

// Interface GET /api/chatrooms
describe('get chatrooms associated with a user', () => {
    const today = new Date();
    const mockUser = 'user@gmail.com';
    const mockEvents = [
        { 
            eventName: 'cpen321',
            start: today.toISOString(),
            end: '2023-11-30T12:00:00Z',
            address: '2357 Main Mall, Vancouver',
            hasChat: true,
        },
        { 
            eventName: 'event2',
            start: today.toISOString(),
            end: '2023-11-30T12:00:00Z',
            address: '6200 University Blvd, Vancouver',
            hasChat: false,
        },
    ];

    // Test Case: retrieve chatroom associated with a user
    // Input: username
    // Expected status code: 200 
    // Expected behavior: fetch chatrooms filtered on ones user has
    // Expected output: array of chatrooms
    it('should get chatrooms of a user', async () => {
        db.getUser.mockResolvedValue({ events: mockEvents });
        jest.spyOn(db, 'getRoom').mockImplementation((eventName) => { 
            return { chatName: eventName, messages: [] }
        });
        jest.spyOn(db, 'createRoom').mockImplementation((eventName) => { 
            return { chatName: eventName, messages: [] }
        });

        const res = await request(server).get(`/api/chatrooms?user=${mockUser}`);

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
    })

    // Test Case: first message to chatroom, create the room
    // Input: username
    // Expected status code: 200
    // Expected behavior: creates chatroom for event in db
    // Expected output: array of chatrooms of user
    it('should create chatroom instance if not existing already', async () => {
        db.getUser.mockResolvedValue({ events: mockEvents });
        jest.spyOn(db, 'getRoom').mockImplementation(() => { 
            return null;
        });
        jest.spyOn(db, 'createRoom').mockImplementation((eventName) => { 
            return { chatName: eventName, messages: [] }
        });

        const res = await request(server).get(`/api/chatrooms?user=${mockUser}`);

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
    })

    // Test Case: internal server error
    // Input: username
    // Expected status code: 500
    // Expected behavior: nothing
    // Expected output: error
    it('should handle database errors', async () => {
        jest.spyOn(db, 'getUser').mockImplementation(() => { throw new Error('Database Error'); });
        const res = await request(server).get(`/api/chatrooms?user=${mockUser}`);

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    })
})

// Interface POST /login/google
// this endpoint is not supposed to take anything else other than username
describe('logging in or registering with google signin', () => {
    // Input: sampleUser is valid user
    // Expected status code: 200
    // Expected behavior: user is added to the database, and output is register new user
    // Expected output: { result: 'register' }
    it('should register a new user on first time login', async () => {
        db.getUser.mockResolvedValue(null);
        db.addUser.mockResolvedValue(true);

        const response = await request(server)
            .post('/login/google')
            .send(inputs.sampleUser)
            .set('Accept', 'application/json');

        expect(response.statusCode).toBe(200);
        expect(response.body.result).toBe('register');
        expect(db.addUser).toHaveBeenCalledWith(inputs.sampleUser);
    });

    // Input: invalidUser
    // Expected status code: 500
    // Expected behavior: user is not added
    // Expected output: error message
    it('should not allow invalid user to register/login', async () => {
        const invalidUser = { username: null };
        db.getUser.mockResolvedValue(null);
        jest.spyOn(db, 'addUser').mockImplementation(() => { throw new Error("No such user exists"); }); // expected addUser behaviour
        
        const response = await request(server)
            .post('/login/google')
            .send(invalidUser)
            .set('Accept', 'application/json');

        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty('error');
    });

    // Input: sampleUser is valid user
    // Expected status code: 200
    // Expected behavior: user is added to the database, and output is login user
    // Expected output: 'login'
    it('should log in an existing user', async () => {
        db.getUser.mockResolvedValue(inputs.sampleUser);

        const response = await request(server)
            .post('/login/google')
            .send(inputs.sampleUser)
            .set('Accept', 'application/json');

        expect(response.statusCode).toBe(200);
        expect(response.body.result).toBe('login');
    });

    // Input: user is null
    // Expected status code: 404
    // Expected behavior: nothing
    // Expected output: error
    it('should fail on null user', async () => {
        let nullUser = inputs.sampleUser;
        nullUser.username = null;
        db.getUser.mockResolvedValue(null);
        db.addUser.mockResolvedValue(false);

        const response = await request(server)
            .post('/login/google')
            .send(nullUser)
            .set('Accept', 'application/json');

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('error');
    });
})

// Interface GET /api/preferences
describe('get a user preferences', () => {

    // Test case: Retrieving user preferences
    // Input: sampleUser is an existing user in the database
    // Expected status code: 200
    // Expected behavior: correct preferences are retrieved from the database
    // Expected output: sampleUser.preferences
    it('gets user preferences', async () => {
        db.getUser.mockResolvedValue(inputs.sampleUser);
    
        const response = await request(server)
            .get(`/api/preferences?user=${inputs.sampleUser.username}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(inputs.sampleUser.preferences);
    });

    // Test case: Retrieving preferences for a non-existing user
    // Input: nonExistingUser is a user not present in the database
    // Expected status code: 404 (Not Found) or similar
    // Expected behavior: No user found in the database
    // Expected output: error message
    it('should fail to retrieve preference of non-existing user', async () => {
        const invalidUser = 'invalid username';
        db.getUser.mockResolvedValue(null);

        const response = await request(server)
            .get(`/api/preferences?user=${invalidUser}`);

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('error');
    });

    // Test case: connection error to database or server error
    // Input: sampleUser username
    // Expected status code: 500
    // Expected behavior: internal server error
    // Expected output: error message
    it('should fail on server error/database connection issues', async () => {
        jest.spyOn(db, 'getUser').mockImplementation(() => { throw new Error('Database Error'); });

        const response = await request(server).get(`/api/preferences?user=${inputs.sampleUser.username}`);

        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty('error');
    });

})

// Interface PUT /api/preferences
describe('update a user preferences', () => {
    const preferencesUpdate = {
        commute_method: "bike", // changed
        traffic_alerts: true,
        preparation_time: "30 minutes",
        notification_preferences: {
            morning_alarm: true,
            event_alarm: true,
            event_notification: true,
            traffic_alerts: true,
            weather_alerts: false // unchanged
        },
        maxMissedBus: "2", // changed
        home_location: "updated home location",
        school_location: "new school!",
        work_location: "456 Business Ave, Your City", // unchanged
        snooze_duration: "10 minutes",
        vibration_alert: true
    }

    // Test case: Updating user preferences
    // Input: sampleUser is an existing user, preferencesUpdate contains new preferences
    // Expected status code: 200
    // Expected behavior: user's preferences are updated in the database
    // Expected output: { result: 'success' }
    it('should update user preferences', async () => {
        db.updatePreferences.mockResolvedValue(true);
        
        const data = {
            username: inputs.sampleUser.username,
            preferences: preferencesUpdate,
        }
        const res = await request(server)
            .put('/api/preferences')
            .send(data)
            .set('Accept', 'application/json');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ result: 'success' });
        expect(db.updatePreferences).toHaveBeenCalledWith(inputs.sampleUser.username, preferencesUpdate);
    })

    // Test case: Updating preferences for a non-existing user
    // Input: nonExistingUser is a user not present in the database, preferencesUpdate contains new preferences
    // Expected status code: 404 (Not Found) or similar
    // Expected behavior: No user found in the database
    // Expected output: error message
    it('should not update preferences for a non-existing user', async () => {
        db.updatePreferences.mockResolvedValue(false);

        const response = await request(server)
            .put('/api/preferences')
            .send({ username: "This username does not exist", preferences: preferencesUpdate })
            .set('Accept', 'application/json');

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toMatch(/No such user exists/);
    });

    // Test case: connection error to database or server error
    // Input: sampleUser username, preferencesUpdate contains new preferences
    // Expected status code: 500
    // Expected behavior: internal server error
    // Expected output: error message
    it('should fail on connection error to database or server error', async () => {
        jest.spyOn(db, 'updatePreferences').mockImplementation(() => { throw new Error('Database Error') });

        const data = {
            username: inputs.sampleUser.username,
            preferences: preferencesUpdate,
        }
        const res = await request(server)
            .put('/api/preferences')
            .send(data)
            .set('Accept', 'application/json');

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error')
    })
})

// Interface POST /api/calendar
describe('create a user events and add it to the user data', () => {
    const today = new Date();
    const mockUser = 'user@gmail.com';
    const mockEvents = [
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
    ];

    // Test Case: adding events to user
    // Input: array of events, username
    // Expected status code: 200
    // Expected behavior: events pushed to events array of user on db
    // Expected output: success message
    it('should be able to push array of events', async () => {
        const data = {
            username: mockUser,
            events: mockEvents,
        }
        db.addEvents.mockResolvedValue(true);
        
        const res = await request(server)
            .post('/api/calendar')
            .send(data)
            .set('Accept', 'application/json');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'Events add successful' });
        expect(db.addEvents).toHaveBeenCalledWith(mockUser, mockEvents);
    })

    // Test Case: internal server error
    // Input: username, events array
    // Expected status code: 500
    // Expected behavior: nothing
    // Expected output: error
    it('should fail on server error', async () => {
        const data = {
            username: mockUser,
            events: mockEvents,
        }
        jest.spyOn(db, 'addEvents').mockImplementation(() => { throw new Error('Database Error') });
        
        const res = await request(server)
            .post('/api/calendar')
            .send(data)
            .set('Accept', 'application/json');

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error');
    });

    // Test Case: invalid username
    // Input: invalid username, events array
    // Expected status code: 500
    // Expected behavior: nothing
    // Expected output: error
    it('should handle error case', async () => {
        const user = 'nouser@gmail.com';
        const data = {
            username: user,
            events: mockEvents,
        }

        db.addEvents.mockResolvedValue(false);
        const res = await request(server)
            .post('/api/calendar')
            .send(data)
            .set('Accept', 'application/json');

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message');
    });
});

// Interface POST /api/calendar/import
describe('get google calendar data and add to events array', () => {
    // Test Case: success import
    // Input: username, authentication code
    // Expected status code: 200
    // Expected behavior: google calendar events in database
    // Expected output: success message
    it('should get google calendar and it is added to database', async () => {
        const username = 'user@gmail.com';
        const authCode = 'validCode';
        const data = { username, auth_code: authCode };
        
        const getCalendarEventsSpy = jest.spyOn(GoogleCalendar.prototype, 'getCalendarEvents');
        getCalendarEventsSpy.mockResolvedValue({ event: 'eventobject' });
        db.addEvents.mockResolvedValue(true);

        const res = await request(server)
            .post('/api/calendar/import')
            .send(data)
            .set('Accept', 'application/json');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toStrictEqual({ result: 'success' });
        expect(db.addEvents).toHaveBeenCalledWith(username, { event: 'eventobject' });
    })

    // Test Case: import failure
    // Input: username, invalid authentication code
    // Expected status code: 500
    // Expected behavior: nothing
    // Expected output: error
    it('should fail on bad code (outdated or api error)', async () => {
        const username = 'user@gmail.com';
        const authCode = 'invalidCode';
        const data = { username, auth_code: authCode };
        
        const getCalendarEventsSpy = jest.spyOn(GoogleCalendar.prototype, 'getCalendarEvents');
        getCalendarEventsSpy.mockRejectedValue(new Error('Google API error'));
        db.addEvents.mockResolvedValue(true);

        const res = await request(server)
            .post('/api/calendar/import')
            .send(data)
            .set('Accept', 'application/json');

        expect(res.statusCode).toEqual(500);
        expect(res.body).toHaveProperty('error');
    })

    // Test Case: invalid username
    // Input: invalid username, authentication code
    // Expected status code: 404
    // Expected behavior: nothing
    // Expected output: error message
    it('should get google calendar and it is added to database', async () => {
        const username = 'notindb@gmail.com';
        const authCode = 'validCode';
        const data = { username, auth_code: authCode };
        
        const getCalendarEventsSpy = jest.spyOn(GoogleCalendar.prototype, 'getCalendarEvents');
        getCalendarEventsSpy.mockResolvedValue({ event: 'eventobject' });
        db.addEvents.mockResolvedValue(false);

        const res = await request(server)
            .post('/api/calendar/import')
            .send(data)
            .set('Accept', 'application/json');

        expect(res.statusCode).toEqual(404);
        expect(res.body).toStrictEqual({ error: "Fail to add events, no user" });
    })

})