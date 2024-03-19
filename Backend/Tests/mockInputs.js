const sampleUser = {
    username: "sampleUser_So@gmail.com",
    preferences: {
        commute_method: "Transit",
        preparation_time: "30 minutes",
        notification_preferences: {
            morning_alarm: true,
            event_alarm: true,
            event_notification: true,
            traffic_alerts: true,
            weather_alerts: true
        },
        maxMissedBus: "1",
    },
    events: [
        {
            eventID: "06a9tvveju39v9c0et0egjgan7_20231031T183000Z",
            summary: "CPEN442 Meeting",
            eventName: "CPEN442 Meeting",
            description: null,
            creator_email: "sou.nozaki@gmail.com",
            status: "confirmed",
            kind: "calendar#event",
            location: null,
            start: "2023-10-31T11:30:00-07:00",
            start_timeZone: "America/Vancouver",
            end: "2023-10-31T12:30:00-07:00",
            end_timeZone: "America/Vancouver"
        },
        {
            eventID : "_64p36d1h6osj8dhk6gs3idpl70q62oj3cgq38d1l6op0_20231101T010000Z",
            summary : "APSC 496E 001",
            eventName: "ASPC 496E 001",
            description: "This section of New Venture Design capstone is for ECE students only. For more information about the course and how to apply, please go to https://design.engineering.ubc.ca/design-courses/new-venture-design/.\n\n",
            creator_email : "sou.nozaki@gmail.com",
            status : "confirmed",
            kind : "calendar#event",
            location : "David Lam Management Research Centre, Room 009",
            start : "2023-10-31T18:00:00-07:00",
            start_timeZone : "America/Vancouver",
            end : "2023-10-31T21:00:00-07:00",
            end_timeZone : "America/Vancouver"
        },
    ]
};

const sampleEvents = [
    {
        eventID: "06a9tvveju39v9c0et0egjgan7_20231031T183000Z",
        summary: "CPEN442 Meeting",
        eventName: "CPEN442 Meeting",
        description: null,
        creator_email: "sou.nozaki@gmail.com",
        status: "confirmed",
        kind: "calendar#event",
        location: null,
        start: {
            dateTime: "2023-10-31T11:30:00-07:00",
            timeZone: "America/Vancouver",
        },
        end: {
            dateTime: "2023-10-31T12:30:00-07:00",
            timeZone: "America/Vancouver",
        },
    },
    {
        eventID : "_64p36d1h6osj8dhk6gs3idpl70q62oj3cgq38d1l6op0_20231101T010000Z",
        summary : "APSC 496E 001",
        eventName: "APSC 496E 001",
        description: "This section of New Venture Design capstone is for ECE students only. For more information about the course and how to apply, please go to https://design.engineering.ubc.ca/design-courses/new-venture-design/.\n\n",
        creator_email : "sou.nozaki@gmail.com",
        status : "confirmed",
        kind : "calendar#event",
        location : "David Lam Management Research Centre, Room 009",
        start : {
            dateTime: "2023-10-31T18:00:00-07:00",
            timeZone: "America/Vancouver",
        },
        end : {
            dateTime: "2023-10-31T21:00:00-07:00",
            timeZone: "America/Vancouver",
        },
    },
]

const expectedEvents = [
    {
        eventName: "CPEN442 Meeting",
        address: null,
        start: "2023-10-31 11:30",
        start_timeZone: "America/Vancouver",
        end: "2023-10-31 12:30",
        end_timeZone: "America/Vancouver",
    },
    {
        eventName: "APSC 496E 001",
        address : "David Lam Management Research Centre, Room 009",
        start : "2023-10-31 18:00",
        start_timeZone : "America/Vancouver",
        end : "2023-10-31 21:00",
        end_timeZone : "America/Vancouver"
    },
]

module.exports = {
    sampleUser,
    sampleEvents,
    expectedEvents,
}