const {
    getMinItinerary, 
    searchItinerary, 
    resolveReservation,
    resolveAll
} = require('./resolver');

// This function applies the result backward to recover flights to initial state thereby it proves that resolution is correct
function proveResolution(reservations, flights, result) {
    for (const reservation of reservations) {
        const itinerary = result[reservation.id];

        if (itinerary) {
            for (const id of itinerary) {
                const flight = flights.find(f => f.id === id);
                flight.capacity += reservation.count;
            }
        }
    }
}

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

const getFlights = () => [
    { id: 'F1', origin: 'A', destination: 'B', capacity: 8 },
    { id: 'F2', origin: 'A', destination: 'B', capacity: 4 },
    { id: 'F4', origin: 'A', destination: 'C', capacity: 5 },
    { id: 'F5', origin: 'C', destination: 'B', capacity: 7 },
    { id: 'F6', origin: 'A', destination: 'C', capacity: 6 }
];

const getReservations = () => [
    { id: 'PNR01', count: 3, origin: 'A', destination: 'B' },
    { id: 'PNR02', count: 4, origin: 'A', destination: 'C' },
    { id: 'PNR04', count: 8, origin: 'A', destination: 'B' },
    { id: 'PNR05', count: 1, origin: 'A', destination: 'C' },
    { id: 'PNR06', count: 1, origin: 'A', destination: 'B' },
    { id: 'PNR07', count: 2, origin: 'A', destination: 'B' },
    { id: 'PNR08', count: 2, origin: 'A', destination: 'C' },
    { id: 'PNR09', count: 2, origin: 'A', destination: 'C' },
    { id: 'PNR10', count: 4, origin: 'C', destination: 'B' }
];

test('search itinerary', () => {
    const flights = getFlights();
    const reservation =  { id: 'PNR01', count: 3, origin: 'A', destination: 'B' };
    const itinerary = searchItinerary(reservation, flights);

    expect(itinerary).toStrictEqual([
        [ { id: 'F1', origin: 'A', destination: 'B', capacity: 8 } ],
        [ { id: 'F2', origin: 'A', destination: 'B', capacity: 4 } ],
        [
          { id: 'F4', origin: 'A', destination: 'C', capacity: 5 },
          { id: 'F5', origin: 'C', destination: 'B', capacity: 7 }
        ],
        [
          { id: 'F6', origin: 'A', destination: 'C', capacity: 6 },
          { id: 'F5', origin: 'C', destination: 'B', capacity: 7 }
        ]
    ]);
});

test('resolve reservation', () => {
    const flights = getFlights();
    const reservations =  [{ id: 'PNR01', count: 3, origin: 'A', destination: 'B' }];
    const itinerary = resolveReservation(reservations, flights, 0);

    expect(itinerary).toStrictEqual(['F2']);
    expect(flights).toStrictEqual([
        { id: 'F1', origin: 'A', destination: 'B', capacity: 8 },
        { id: 'F2', origin: 'A', destination: 'B', capacity: 1 },
        { id: 'F4', origin: 'A', destination: 'C', capacity: 5 },
        { id: 'F5', origin: 'C', destination: 'B', capacity: 7 },
        { id: 'F6', origin: 'A', destination: 'C', capacity: 6 }
    ]);
});

test('resolve reservation unresolved', () => {
    const unresolved = [{ id: 'PNR04', count: 10, origin: 'A', destination: 'B' }];
    const flights = getFlights();
    const itinerary = resolveReservation(unresolved, flights, 0);

    expect(itinerary).toBe(null);
});

test('resolve all', () => {
    const flights = getFlights();
    const reservations = getReservations();
    const result = resolveAll(reservations, flights);

    expect(result).toStrictEqual({
        PNR04: [ 'F1' ],
        PNR02: [ 'F4' ],
        PNR10: [ 'F5' ],
        PNR01: [ 'F2' ],
        PNR07: [ 'F6', 'F5' ],
        PNR08: [ 'F6' ],
        PNR09: [ 'F6' ],
        PNR05: [ 'F4' ],
        PNR06: [ 'F2' ]
    });
    
    // Apply resolution backward to recover initial flights state
    proveResolution(reservations, flights, result);
    
    // Check if recovering equals to the initial state
    expect(flights).toStrictEqual(getFlights());
});

test('resolve all complex itinerary', () => {
    const getTestFlights = () => [
        { id: 'F1', origin: 'A', destination: 'B', capacity: 8 },
        { id: 'F2', origin: 'B', destination: 'C', capacity: 4 },
        { id: 'F4', origin: 'A', destination: 'C', capacity: 5 }
    ];

    const reservations = [
        { id: 'PNR04', count: 4, origin: 'A', destination: 'C' },
        { id: 'PNR02', count: 3, origin: 'A', destination: 'C' },
        { id: 'PNR10', count: 3, origin: 'A', destination: 'C' },
    ];

    const flights = getTestFlights();

    const result = resolveAll(reservations, flights);
    expect(result).toStrictEqual({ PNR04: [ 'F4' ], PNR02: [ 'F1', 'F2' ], PNR10: null });
    
    // Apply resolution backward to recover initial flights state
    proveResolution(reservations, flights, result);
    
    // Check if recovering equals to the initial state
    expect(flights).toStrictEqual(getTestFlights());
});

test('search complex itinerary', () => {
    const flights = [
        { id: 'F1', origin: 'A', destination: 'B', capacity: 8 },
        { id: 'F2', origin: 'B', destination: 'C', capacity: 4 },
        { id: 'F4', origin: 'A', destination: 'C', capacity: 5 }
    ];

    const reservation = { id: 'PNR02', count: 3, origin: 'A', destination: 'C' };
    const result = searchItinerary(reservation, flights);

    expect(result).toStrictEqual([
        [
            { id: 'F1', origin: 'A', destination: 'B', capacity: 8 },
            { id: 'F2', origin: 'B', destination: 'C', capacity: 4 }
        ],
        [ { id: 'F4', origin: 'A', destination: 'C', capacity: 5 } ]
    ]);
});

test('resolve unbalanced flights', () => {
    const getTestFlights = () => [
        { id: 'F1', origin: 'A', destination: 'B', capacity: 5 },
        { id: 'F2', origin: 'B', destination: 'C', capacity: 4 },
        { id: 'F4', origin: 'A', destination: 'C', capacity: 100 }
    ];

    const flights = getTestFlights();

    const reservations = [
        { id: 'PNR01', count: 2, origin: 'B', destination: 'C' },
        { id: 'PNR02', count: 4, origin: 'A', destination: 'C' }
    ];

    const result = resolveAll(reservations, flights);

    expect(result).toStrictEqual({
        PNR02: ['F4'],
        PNR01: ['F2']
    });

    // Apply resolution backward to recover initial flights state
    proveResolution(reservations, flights, result);
    
    // Check if recovering equals to the initial state
    expect(flights).toStrictEqual(getTestFlights());
});
