// repository/occurrenceRepository.js
const Occurrence = require('../model/Ocurrence');

async function findAll() {
    return Occurrence.find();
}

async function findById(id) {
    return Occurrence.findById(id);
}

async function create(occurrenceData) {
    const occurrence = new Occurrence(occurrenceData);
    return occurrence.save();
}

async function update(id, occurrenceData) {
    return Occurrence.findByIdAndUpdate(id, occurrenceData, { new: true });
}

async function deleteById(id) {
    return await Occurrence.findByIdAndDelete(id);
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteById
};
