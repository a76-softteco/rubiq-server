const parseFile = ({ data }, format) => data.toString()
    .split('\n')
    .map(rec => format(rec.split(',')));

const getFile = (req, name, format) => {
    const file = req.files.file.find(file => file.name === name);

    return parseFile(file, format);
};

const getReservation = req => getFile(req, 'reservation', ([id, count, origin, destination]) => ({id, count: +count, origin, destination}));
const getFlight = req => getFile(req, 'flight', ([id, origin, destination, capacity]) => ({id, origin, destination, capacity: +capacity}));

module.exports = {
    getReservation,
    getFlight
}