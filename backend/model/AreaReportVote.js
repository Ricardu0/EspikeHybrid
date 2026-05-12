const mongoose = require('mongoose');

const areaReportVoteSchema = new mongoose.Schema({
    report_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AreaReport',
        required: true,
    },
    voter_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isUpvote: {
        type: Boolean,
        required: true, // true = upvote (+1 moral), false = downvote (-2 moral)
    },
}, { timestamps: true });

// Um usuário vota apenas uma vez por relato
areaReportVoteSchema.index({ report_id: 1, voter_id: 1 }, { unique: true });

module.exports = mongoose.model('AreaReportVote', areaReportVoteSchema);
