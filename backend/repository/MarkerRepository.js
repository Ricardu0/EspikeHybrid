// repository/MarkerRepository.js
const Marker = require('../model/Marker.JS');
const Ocurrence = require('../model/Ocurrence');
const MarkerRepository = require('../repository/MarkerRepository');

async function findAll() {
    return await MarkerRepository.find();
}

async function findById(id) {
    return await MarkerRepository.findById(id);
}

async function create(markerData) {
    const marker = new MarkerRepository(markerData);
    return await marker.save();
}

async function update(id, markerData) {
    return await MarkerRepository.findByIdAndUpdate(id, markerData, { new: true });
}

async function deleteById(id) {
    return await MarkerRepository.findByIdAndDelete(id);
}
const createMarkerWithOccurrences = async (markerData, occurrencesData) => {
    const marker = new Marker(markerData);
    await marker.save();

    for (const occurrenceData of occurrencesData) {
        const ocurrence = new Ocurrence({ ...occurrenceData, latitude: marker.latitude, longitude: marker.longitude });
        await ocurrence.save();
        marker.ocurrences.push(occurrence._id); // Adiciona a referência da ocorrência ao marcador
    }

    await marker.save(); // Atualiza o marcador com as ocorrências
    return marker;

};

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteById,
    createMarkerWithOccurrences,
};
