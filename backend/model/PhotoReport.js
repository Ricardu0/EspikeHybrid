const mongoose = require("mongoose");

const PhotoReportSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  description: { type: String },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  latitude: { type: String },
  longitude: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PhotoReport", PhotoReportSchema);
