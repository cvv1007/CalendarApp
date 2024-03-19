const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    preferences: {
        commute_method: String,
        preparation_time: String,
        notification_preferences: {
            morning_alarm: Boolean,
            event_alarm: Boolean,
            event_notification: Boolean,
            traffic_alerts: Boolean,
            weather_alerts: Boolean,
        },
        maxMissedBus: String,
    },
    events: [mongoose.Schema.Types.Mixed],
    daySchedule: [mongoose.Schema.Types.Mixed],
});

module.exports = userSchema;
