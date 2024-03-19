const Scheduler = require('../Utils/Scheduler.js');

// mock google api function
const { Client } = require("@googlemaps/google-maps-services-js");
jest.mock("@googlemaps/google-maps-services-js", () => {
    const originalModule = jest.requireActual("@googlemaps/google-maps-services-js");
    const directionsMock = jest.fn();
    return {
        ...originalModule,
        Client: jest.fn(() => ({
            directions: directionsMock
        }))
    };
});

describe('Testing google API getDirections', () => {
    const today = new Date();

    const mockOrigin = '6551 No. 3 Rd, Richmond';
    const mockEvent = { 
        eventName: 'cpen321',
        start: today.toISOString(),
        end: '2023-11-30T12:00:00Z',
        address: '2357 Main Mall, Vancouver',
    }
    let mockPreferences = { 
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
    }
    const clientInstance = new Client();
    // distance got from google maps from richmond centre to mcml
    const mockData = { data: { routes: [{ legs: [{ distance: { value: 18199 }, }]}]} };
    clientInstance.directions.mockResolvedValue(mockData);

    it('should give a direction from this location to mcml by car', async () => {
        const direction = await Scheduler.getDirections(mockOrigin, mockEvent, mockPreferences);

        expect(direction.routes[0]).toHaveProperty('legs');
        expect(direction.routes[0].legs[0].distance.value).toBe(18199);
    })

    it('should also give route via transit', async () => {
        mockPreferences.commute_method = 'Transit';
        const direction = await Scheduler.getDirections(mockOrigin, mockEvent, mockPreferences);

        expect(direction.routes[0]).toHaveProperty('legs');
        expect(direction.routes[0].legs[0].distance.value).toBe(18199);
    })
})

describe('Test optimizer helper for routes', () => {
    const now = new Date();
    let mockRouteA, mockRouteB;

    beforeEach(() => { // resest mock objects to be equal before each test
        mockRouteA = {
            legs: [
                {
                    duration: { value: 2 },
                    steps: [1, 2, 3],
                    arrival_time: { value: now },
                }
            ]
        }
        mockRouteB = {
            legs: [
                {
                    duration: { value: 2 },
                    steps: [1, 2, 3],
                    arrival_time: { value: now },
                }
            ]
        }
    })

    it('should pick route with shortest duration', () => {
        mockRouteB.legs[0].duration.value = 1; // a takes longer
        let result = Scheduler.compareRoutes(mockRouteA, mockRouteB);
        expect(result).toBe(1);

        mockRouteB.legs[0].duration.value = 3;
        result = Scheduler.compareRoutes(mockRouteA, mockRouteB);
        expect(result).toBe(-1);
    })

    it('should then pick route with least steps', () => {
        mockRouteB.legs[0].steps = [1, 2]; // a has more steps
        let result = Scheduler.compareRoutes(mockRouteA, mockRouteB);
        expect(result).toBe(1);

        mockRouteB.legs[0].steps = [1, 2, 3, 4];
        result = Scheduler.compareRoutes(mockRouteA, mockRouteB);
        expect(result).toBe(-1);
    })

    it('should then pick route with earliest arrival time', () => {
        // a arrives later than b
        let arrivalB = new Date(now);
        arrivalB.setHours(arrivalB.getHours() - 1);
        mockRouteB.legs[0].arrival_time.value = arrivalB;

        console.log(mockRouteA.legs[0].arrival_time.value > mockRouteB.legs[0].arrival_time.value)
        let result = Scheduler.compareRoutes(mockRouteA, mockRouteB);
        expect(result).toBe(1);

        arrivalB.setHours(arrivalB.getHours() + 2)
        mockRouteB.legs[0].arrival_time.value = arrivalB;
        result = Scheduler.compareRoutes(mockRouteA, mockRouteB);
        expect(result).toBe(-1);
    })

    it('should return 0 when both routes are exactly equal', () => {
        let result = Scheduler.compareRoutes(mockRouteA, mockRouteB);
        expect(result).toBe(0);
    })
})