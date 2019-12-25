const {
    getMinItinerary, 
    searchItinerary, 
    resolveReservation,
    resolveAll
} = require('./resolver');

let flights;

beforeEach(() => {
    flights = [
        { id: 'F1', origin: 'A', destination: 'B', capacity: 8 },
        { id: 'F2', origin: 'A', destination: 'B', capacity: 4 },
        { id: 'F4', origin: 'A', destination: 'C', capacity: 5 },
        { id: 'F5', origin: 'A', destination: 'B', capacity: 7 },
        { id: 'F6', origin: 'A', destination: 'C', capacity: 6 }
    ];
})

const reservations = [
    { id: 'PNR04', count: 8, origin: 'A', destination: 'B' },
    { id: 'PNR02', count: 4, origin: 'A', destination: 'C' },
    { id: 'PNR10', count: 4, origin: 'C', destination: 'B' },
    { id: 'PNR01', count: 3, origin: 'A', destination: 'B' },
    { id: 'PNR07', count: 2, origin: 'A', destination: 'B' },
    { id: 'PNR08', count: 2, origin: 'A', destination: 'C' },
    { id: 'PNR09', count: 2, origin: 'A', destination: 'C' },
    { id: 'PNR05', count: 1, origin: 'A', destination: 'C' },
    { id: 'PNR06', count: 1, origin: 'A', destination: 'B' }
];

test('find min itinerary trivial', () => {
    const min = [{capacity: 4}];

    const itineraries = [
        [{capacity: 5}],
        min
    ];

    const result = getMinItinerary(itineraries);
    expect(result).toBe(min);
});

test('find min itinerary', () => {
    const min = [{capacity: 4}, {capacity: 3}];

    const itineraries = [
        [{capacity: 9}],
        min
    ];

    const result = getMinItinerary(itineraries);
    expect(result).toBe(min);
});

test('search itinerary', () => {
    const itinerary = searchItinerary(reservations[3], flights);

    expect(itinerary).toStrictEqual([
        [ { id: 'F1', origin: 'A', destination: 'B', capacity: 8 } ],
        [ { id: 'F2', origin: 'A', destination: 'B', capacity: 4 } ],
        [ { id: 'F5', origin: 'A', destination: 'B', capacity: 7 } ]
    ]);
});

test('resolve reservation', () => {
    const itinerary = resolveReservation(reservations[3], flights);

    expect(itinerary).toStrictEqual(['F2']);
    expect(flights).toStrictEqual([
        { id: 'F1', origin: 'A', destination: 'B', capacity: 8 },
        { id: 'F2', origin: 'A', destination: 'B', capacity: 1 },
        { id: 'F4', origin: 'A', destination: 'C', capacity: 5 },
        { id: 'F5', origin: 'A', destination: 'B', capacity: 7 },
        { id: 'F6', origin: 'A', destination: 'C', capacity: 6 }
    ]);
});

test('resolve reservation unresolved', () => {
    const unresolved = { id: 'PNR04', count: 10, origin: 'A', destination: 'B' };
    const itinerary = resolveReservation(unresolved, flights);

    expect(itinerary).toBe(null);
});

test('resolve all', () => {
    const result = resolveAll(reservations, flights);

    expect(result).toStrictEqual({
        PNR04: [ 'F1' ],
        PNR02: [ 'F4' ],
        PNR10: [ 'F2' ],
        PNR01: [ 'F5' ],
        PNR07: [ 'F5' ],
        PNR08: [ 'F6' ],
        PNR09: [ 'F6' ],
        PNR05: [ 'F4' ],
        PNR06: [ 'F5' ]
    });

    expect(flights).toStrictEqual([
        { id: 'F1', origin: 'A', destination: 'B', capacity: 0 },
        { id: 'F2', origin: 'A', destination: 'B', capacity: 0 },
        { id: 'F4', origin: 'A', destination: 'C', capacity: 0 },
        { id: 'F5', origin: 'A', destination: 'B', capacity: 1 },
        { id: 'F6', origin: 'A', destination: 'C', capacity: 2 }
    ]);
});


