const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theater name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Theater location is required'],
      trim: true,
    },
    totalScreens: {
      type: Number,
      default: 1,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

theaterSchema.index({ name: 1, location: 1 }, { unique: true });

const Theater = mongoose.model('Theater', theaterSchema);
module.exports = Theater;
