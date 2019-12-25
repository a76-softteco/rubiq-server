const express = require('express');
const app = express();

const cors = require('cors');
const fileUpload = require('express-fileupload');

const {
    getReservation,
    getFlight
} = require('./parser');

const {
    resolveAll
} = require('./resolver');

app.use(cors());
app.use(fileUpload());

app.post('/resolve-reservation', function(req, resp) {
    const reservations = getReservation(req);
    const flights = getFlight(req);

    const resolution = resolveAll(reservations, flights);
    resp.json({
        resolution, 
        flights
    });
});

app.listen(8000, () => console.log('Application is launching on port 8000'));