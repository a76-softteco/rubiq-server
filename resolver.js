function getFlightsByOrigin(origin, flights) {
    return flights.filter(flight => flight.origin === origin);
} 

function getMinItinerary(itineraries) {
    // maps list of itineraries to the list of total capacities
    const capacities = itineraries.map(itinerary => itinerary.reduce((sum, {capacity}) => sum + capacity, 0));
    // finds minimal total capacity
    const min = Math.min(...capacities);

    // returns an itinerary corresponding to the min capacity
    return itineraries[capacities.indexOf(min)];
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

function resolveReservation(reservation, flights) {
    const itineraries = searchItinerary(reservation, flights);

    if (itineraries.length === 0) {
        return null;
    }

    const itinerary = getMinItinerary(itineraries);
    
    // apply itinerary to flights
    for (const flight of itinerary) {
        flight.capacity -= reservation.count;
    }

    return itinerary.map(({id}) => id);
}

function resolveAll(reservations, flights) {

    // sort reservations decending by count to resolve the most valuable ones at first
    reservations.sort((a, b) => b.count - a.count);
    const result = {};

    for (const reservation of reservations) {
        result[reservation.id] = resolveReservation(reservation, flights);
    }

    return result;
}

module.exports = {
    getMinItinerary,
    searchItinerary,
    resolveReservation,
    resolveAll
    
}