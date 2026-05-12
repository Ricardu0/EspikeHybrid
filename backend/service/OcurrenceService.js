// services/OcurrenceService.js
const Ocurrence = require('../model/Ocurrence');
const User = require('../model/User');
const OcurrenceValidation = require('../model/OcurrenceValidation');

const createOcurrence = async (ocurrenceData, userType = 'user') => {
    // Check daily limit for common users
    if (userType !== 'admin' && userType !== 'mod') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const count = await Ocurrence.countDocuments({
            user_id: ocurrenceData.user_id,
            date_time: { $gte: startOfDay, $lte: endOfDay }
        });

        if (count >= 5) {
            throw new Error('DAILY_LIMIT_EXCEEDED');
        }
    }

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

const validateOcurrence = async (ocurrenceId, userId, isValid) => {
    const ocurrence = await Ocurrence.findById(ocurrenceId);
    if (!ocurrence) {
        throw new Error('Ocurrence não encontrada');
    }

    if (ocurrence.user_id.toString() === userId.toString()) {
        throw new Error('Você não pode avaliar sua própria ocorrência');
    }

    // Upsert validation
    const validation = await OcurrenceValidation.findOneAndUpdate(
        { ocurrence_id: ocurrenceId, user_id: userId },
        { isValid: isValid },
        { new: true, upsert: true }
    );

    // Update creator's moral score
    const creatorId = ocurrence.user_id;
    const modifier = isValid ? 1 : -2; // +1 moral for valid, -2 for invalid (punishment)

    await User.findByIdAndUpdate(creatorId, { $inc: { moralScore: modifier } });

    return validation;
};

module.exports = {
    createOcurrence,
    getAllOcurrences,
    getOcurrenceById,
    updateOcurrence,
    deleteOcurrence,
    validateOcurrence,
};
