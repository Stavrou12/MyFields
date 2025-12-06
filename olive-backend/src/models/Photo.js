const mongoose = require("mongoose");

const PhotoSchema = new mongoose.Schema({
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: "Field", required: true },
  url: { type: String, required: true },
  gps: {
    lat: Number,
    lng: Number,
  },
  isVideo: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Photo", PhotoSchema);