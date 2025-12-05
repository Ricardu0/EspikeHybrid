// services/MarkerService.js
const Marker = require('../model/Marker');
const router = require('express').Router();

const createMarker = async (markerData) => {
    const marker = new Marker(markerData); // Cria a instância do marcador
    return await marker.save(); // Salva no banco de dados e retorna
};

const getAllMarkers = async () => {
    console.log("Buscando todos os marcadores...");
    try {
        const markers = await Marker.find({});
        console.log("Resultado da busca:", markers);
        return markers;
    } catch (error) {
        console.error("Erro ao buscar marcadores:", error);
        throw error;
    }
};

const getMarkerById = async (id) => {
     await Marker.findById(id);
};

const updateMarker = async (id, markerData) => {
    return await Marker.findByIdAndUpdate(
        id,
        markerData,
        { returnDocument: 'after' } // Use `returnDocument` no lugar de `{ new: true }`
    );
};

const deleteMarker = async (id) => {
     await Marker.findByIdAndDelete(id);
};

module.exports = {
    createMarker,
    getAllMarkers,
    getMarkerById,
    updateMarker,
    deleteMarker,
};
