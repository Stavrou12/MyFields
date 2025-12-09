const mongoose = require("mongoose");

/* ===========================
   ACTIVITY SUB-SCHEMAS
=========================== */
const MediaItemSchema = new mongoose.Schema({
  url: String,
  isVideo: Boolean,
  uploadedAt: { type: Date, default: Date.now }
});

/* --- Oil Production --- */
const OilSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  year: Number,   // optional, derived from date
  kg: Number,
  liters: Number,
  trees: Number,
  quality: String,
  media: [MediaItemSchema] // ⬅️ NEW
});


/* --- Fertilization --- */
const FertilizationSchema = new mongoose.Schema({
  date: { type: Date, required: false },
  fertilizerType: String,       // "Organic" or "Chemical"
  fertilizerName: String,
  trees: { type: Number, required: false }, // optional
  notes: String,
  media: [MediaItemSchema] // ⬅️ NEW
});

/* --- Pruning --- */
const PruningSchema = new mongoose.Schema({
  date: { type: Date, required: false },
  pruningType: String, // Renewal / Formation / Fruiting / Regeneration
  treesPruned: { type: Number, required: false },
  notes: String,
  media: [MediaItemSchema] // ⬅️ NEW
});

/* --- Spraying --- */
const SprayingSchema = new mongoose.Schema({
  date: { type: Date, required: false },
  sprayType: String,            // e.g. Insecticide
  product: String,
  trees: { type: Number, required: false },
  notes: String,
  media: [MediaItemSchema] // ⬅️ NEW
});

/* ===========================
   MAIN FIELD SCHEMA
=========================== */

const FieldSchema = new mongoose.Schema(
  {
    name: String,

    location: {
      type: { type: String, default: "Polygon" },
      coordinates: []
    },

    soil: {
      type: String,
      ph: Number,
      moisture: Number,
      slope: Number
    },

    environment: {
      sunlight: String
    },

    notes: String,
    treeCount: { type: Number, default: 0 },

    oilProduction: [OilSchema],
    fertilization: [FertilizationSchema],
    pruning: [PruningSchema],
    spraying: [SprayingSchema],

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

FieldSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Field", FieldSchema);
