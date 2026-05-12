const mongoose = require('mongoose');

const ocurrenceValidationSchema = new mongoose.Schema({
    ocurrence_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ocurrence',
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isValid: {
        type: Boolean,
        required: true, // true para 'Validar', false para 'Invalidar'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// Para garantir que um usuário só valide/invalide a mesma ocorrência uma vez
ocurrenceValidationSchema.index({ ocurrence_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('OcurrenceValidation', ocurrenceValidationSchema);
