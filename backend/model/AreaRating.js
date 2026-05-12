// model/AreaRating.js
const mongoose = require('mongoose');

const areaRatingSchema = new mongoose.Schema({
    areaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    overall: { type: Number, default: 0, min: 0, max: 5 },
    risk: { type: Number, default: 0, min: 0, max: 5 },
    lighting: { type: Number, default: 0, min: 0, max: 5 },
    infrastructure: { type: Number, default: 0, min: 0, max: 5 },
    policing: { type: Number, default: 0, min: 0, max: 5 },
    comments: { type: String, default: '' },
}, { timestamps: true });

// Garante que cada usuário avalie a mesma área apenas uma vez (upsert via índice único)
areaRatingSchema.index({ areaId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('AreaRating', areaRatingSchema);
