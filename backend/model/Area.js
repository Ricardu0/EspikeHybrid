// model/Area.js
const mongoose = require('mongoose');

// Este sub-schema armazena as médias das avaliações
const ratingAverageSchema = new mongoose.Schema({
    overall: { type: Number, default: 0 },
    risk: { type: Number, default: 0 },
    lighting: { type: Number, default: 0 },
    infrastructure: { type: Number, default: 0 },
    policing: { type: Number, default: 0 }
}, { _id: false });

const areaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    // Armazena as coordenadas do polígono: [[lat, lng], [lat, lng], ...]
    coordinates: {
        type: Array,
        required: true,
    },
    // Armazena a média de todas as avaliações
    ratings: {
        type: ratingAverageSchema,
        default: () => ({
            overall: 0,
            risk: 0,
            lighting: 0,
            infrastructure: 0,
            policing: 0
        })
    },
    // Contador para facilitar o cálculo da média
    ratingCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true }); // Adiciona createdAt e updatedAt

module.exports = mongoose.model('Area', areaSchema);