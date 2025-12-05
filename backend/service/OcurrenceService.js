// services/OcurrenceService.js
const Ocurrence = require('../model/Ocurrence');

const createOcurrence = async (ocurrenceData) => {
    const ocurrence = new Ocurrence(ocurrenceData);
    return await ocurrence.save();
};

const getAllOcurrences = async () => {
    return await Ocurrence.find();
};

const getOcurrenceById = async (id) => {
    return await Ocurrence.findById(id);
};

const updateOcurrence = async (id, ocurrenceData) => {
    return await Ocurrence.findByIdAndUpdate(id, ocurrenceData, { new: true });
};


const deleteOcurrence = async (id) => {
    return await Ocurrence.findByIdAndDelete(id);
};

module.exports = {
    createOcurrence,
    getAllOcurrences,
    getOcurrenceById,
    updateOcurrence,
    deleteOcurrence,
};
