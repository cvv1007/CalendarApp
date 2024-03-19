const { Client } = require("@googlemaps/google-maps-services-js");
const path = require('path');
const dotenv = require('dotenv');

const envFilePath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envFilePath });

const googleAPIKey = process.env.GOOGLE_API_KEY;

class Scheduler {
    constructor() {
        this.client = new Client({});
    }

    /**
     * Get direction to an event from position when called
     * @param {String} origin user position or last event position
     * @param {Object} event event to get routes to
     * @param {Object} preferences
     * @returns an Object with array of routes returned by google API
     */
    async getDirections(origin, event, preferences) {
        let params = {
            origin,
            destination: event.address,
            travelMode: preferences.commute_method,
            alternatives: true,
            key: googleAPIKey,
        }
        if (preferences.commute_method.toLowerCase() === 'transit') {
            params.transitOptions = {
                arrivalTime: new Date(event.start),
            }
        }
        if (preferences.commute_method.toLowerCase() === 'driving') {
            params.drivingOptions = {
                departureTime: new Date(),
                trafficModel: 'pessimistic',
            }
        }
        const result = await this.client.directions({ params });
        return result.data;
    }

    /**
     * Create a schedule with routes for events taking place today
     * @param {Array} events 
     * @param {String} origin 
     * @param {Object} preferences 
     * @returns schedule array with route and associated event
     */
    async createDaySchedule(events, origin, preferences) {
        const today = new Date();
        const dayEvents = events.filter(e => {
            const eventDate = new Date(e.start);
            return (
                eventDate.getDate() === today.getDate() &&
                eventDate.getMonth() === today.getMonth() &&
                eventDate.getFullYear() === today.getFullYear()
            );
        });
        let schedule = [];
        let shouldSetOrigin = false;
        for (let i = 0; i < dayEvents.length; i++) {
            if (!dayEvents[i].address) {
                continue;
            }
            if (shouldSetOrigin) origin = dayEvents[i].address;
            shouldSetOrigin = true;

            const directions = await this.getDirections(origin, dayEvents[i], preferences);
            let routes = directions.routes;
            routes.sort(this.compareRoutes); 
            const route = {
                distance: routes[0].legs[0].distance,
                duration: routes[0].legs[0].duration,
                end_address: routes[0].legs[0].end_address,
                start_address: routes[0].legs[0].start_address,
            }
            const eventRoute = { event: dayEvents[i], route };
            schedule.push(eventRoute);
        }
        return schedule;
    }

    /**
     * Callback for sort to optimize for shortest duration, least steps, earliest arrival
     * @param {Object} a route A to compare 
     * @param {Object} b route B to compare
     * @returns -1 if a is better route, 1 if b is, 0 if equal
     */
    compareRoutes(a, b) {
        if (a.legs[0].duration.value < b.legs[0].duration.value) { // compare by duration use lowest
            return -1;
        } else if (a.legs[0].duration.value > b.legs[0].duration.value) {
            return 1;
        }
        if (a.legs[0].steps.length < b.legs[0].steps.length) { // compare by steps use least steps
            return -1;
        } else if (a.legs[0].steps.length > b.legs[0].steps.length) {
            return 1;
        }
        if (a.legs[0].arrival_time.value < b.legs[0].arrival_time.value) { // compare arrival time use earliest arrival
            return -1;
        } else if (a.legs[0].arrival_time.value > b.legs[0].arrival_time.value) {
            return 1;
        }
        return 0; // route a and b are equal in duration and steps
    }
}

module.exports = new Scheduler();
