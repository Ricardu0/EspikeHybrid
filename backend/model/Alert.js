const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    alert_message: {
        type: String,
        required: true
    },
    severity_level: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: true
    },
    alert_radius: {
        type: Number,
        required: true,
        min: 0
    },
    latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
    },
    longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
    },
    alert_time: {
        type: Date,
        default: Date.now
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
