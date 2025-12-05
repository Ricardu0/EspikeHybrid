// models/Ocurrence.js
const mongoose = require('mongoose');

const ocurrenceSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    occurrence_type: {
        type: String,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    date_time: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        default: 'ativo',
    },
});

module.exports = mongoose.model('Ocurrence', ocurrenceSchema);
