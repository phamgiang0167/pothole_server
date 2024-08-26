import mongoose from "mongoose";
const { Schema } = mongoose;

const HoleSchema = new Schema({
  width: {
    type: Number,
    required: true,
  },
  length: {
    type: Number,
    required: true,
  },
});

const PotholeSchema = new Schema({
  totalHoles: {
    type: Number,
    required: true,
  },
  holes: [HoleSchema],
  avgWidth: {
    type: Number,
    required: true,
  },
  avgLength: {
    type: Number,
    required: true,
  },
  badnessLevel: {
    type: Number,
    required: true,
  },
  shouldAcross: {
    type: Boolean,
    required: true,
  },
  analysisImage: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  reportedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
  },
});
export default mongoose.model("Pothole", PotholeSchema);
