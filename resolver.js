function getFlightsByOrigin(origin, flights) {
    return flights.filter(flight => flight.origin === origin);
} 

function applyItinerary(itinerary, {count}) {
    for (const flight of itinerary) {
        flight.capacity -= count;
    }
}

function recoverItinerary(itinerary, {count}) {
    for (const flight of itinerary) {
        flight.capacity += count;
    }
}

function getMinItinerary(itineraries) {
    // maps list of itineraries to the list of total capacities
    const capacities = itineraries.map(itinerary => itinerary.reduce((sum, {capacity}) => sum + capacity, 0));
    // finds minimal total capacity
    const min = Math.min(...capacities);

    // returns an itinerary corresponding to the min capacity
    return itineraries[capacities.indexOf(min)];
}

function getOptimalItinerary(itineraries, reservations, flights, index) {
    const unresolved = [];
    const currentReservation = reservations[index];

    for (let itIndex = 0; itIndex < itineraries.length; itIndex++) {
        const itinerary = itineraries[itIndex];
        // Let's current iteration doesn't cause any unresolved reservations
        unresolved[itIndex] = 0;
        // Apply itinerary
        applyItinerary(itinerary, currentReservation);
        
        // For each not processed reservation we need to investigate how current itinerary usage affects its resolution
        for (let resIndex = index + 1; resIndex < reservations.length; resIndex++) {
            const reservation = reservations[resIndex];

            // Search all posible itineraries
            const nextItineraries = searchItinerary(reservation, flights);
            
            // If not found any itinerary for reservation
            if (nextItineraries.length === 0) {
                // Increase unresolved counter by the reservation count
                unresolved[itIndex] += reservation.count;
            }
        }
        // Recover itinerary
        recoverItinerary(itinerary, currentReservation);
    }

    const min = Math.min(...unresolved);
    const candidates = itineraries.filter((_, index) => unresolved[index] === min);
    
    // Additional optimization perhaps not necessary and just a first result is good enough
    return getMinItinerary(candidates);
}

function nextItinerary(reservation, flights, origin, itinerary, result) {
    // Either proves that an itinerary is suitable to reach the reservation's destination, or tries to extend it by the next possible flight
    // The itinerary is represented as an ordered array of flights

    const { destination, count } = reservation;

    if (origin !== destination) {
        // if destination has not been reached yet
        for (const flight of getFlightsByOrigin(origin, flights)) {
            // for each flight departured from the intermidiate point of the itinerary

            if (flight.capacity >= count && itinerary.indexOf(flight) === -1) {
                // if flight's capacity can serve reservation and itinerary doesn't have loops 
                // then extend itinerary
                itinerary.push(flight);
                // and continue the process with updated itinerary and new origin
                nextItinerary(reservation, flights, flight.destination, itinerary, result);
            }
        }
    } else {
        // if destination has been reached put the itinerary to the result set
        result.push(itinerary);
    }
}

function searchItinerary(reservation, flights) {
    const { origin, count } = reservation;
    const result = [];
    for (const flight of getFlightsByOrigin(origin, flights)) {
        // for each flight departured from the reservation's origin
        if (flight.capacity >= count) { 
            // if flight's capacity can serve reservation
            nextItinerary(reservation, flights, flight.destination, [flight], result);
        }
    }

    return result;
}

function resolveReservation(reservations, flights, index) {
    const reservation = reservations[index];
    const itineraries = searchItinerary(reservation, flights);

    if (itineraries.length === 0) {
        return null;
    }

    const itinerary = getOptimalItinerary(itineraries, reservations, flights, index);
    applyItinerary(itinerary, reservation);

    return itinerary.map(({id}) => id);
}

function resolveAll(reservations, flights) {
    // sort reservations decending by count to resolve the most valuable ones at first
    reservations.sort((a, b) => b.count - a.count);

    const result = {};

    for (let index = 0; index < reservations.length; index++) {
        const {id} = reservations[index];
        result[id] = resolveReservation(reservations, flights, index);
    }

    return result;
}

module.exports = {
    getMinItinerary,
    searchItinerary,
    resolveReservation,
    resolveAll
    
}