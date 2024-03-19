const { google } = require('googleapis');

const path = require('path');
const envFilePath = path.join(__dirname ,'/../.env');
require('dotenv').config({ path: envFilePath });

const maxImportEvents = 30;

class GoogleCalendar {
    constructor() {
        this.authClient = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URL
        );
        this.calendar = google.calendar({ version: 'v3', auth : process.env.GOOGLE_API_KEY });
    }

    /**
     * Get future events of a user from their google calendar
     * @param {String} code authentication code for the user
     * @returns array containing at most maxImportEvents of future events in google calendar
     */
    async getCalendarEvents(code) {
        const { tokens } = await this.authClient.getToken(code);
        this.authClient.setCredentials(tokens);

        const getCalendar = await this.calendar.events.list({
            calendarId: 'primary',
            auth: this.authClient,
            timeMin: new Date().toISOString(),
            maxResults: maxImportEvents,
            singleEvents: true,
            orderBy: 'startTime',
        });
        const events = getCalendar.data.items;

        let processedEvents = [];
        for (let e of events) {
            const formatStart = e.start.dateTime.slice(0, 16).replace('T', ' ');
            const formatEnd = e.end.dateTime.slice(0, 16).replace('T', ' ');

            const processedEvent = {
                eventName: e.summary,
                start: formatStart,
                start_timeZone: e.start.timeZone,
                end: formatEnd,
                end_timeZone: e.end.timeZone,
                address: e.location,
            }
            processedEvents.push(processedEvent);
        }
        return processedEvents;
    }
}

module.exports = GoogleCalendar;