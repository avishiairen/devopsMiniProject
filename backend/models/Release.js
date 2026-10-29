const mongoose = require('mongoose');

const releaseSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: [true, 'Version number is required'],
      trim: true,
      maxlength: [30, 'Version cannot exceed 30 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Release notes cannot exceed 1000 characters'],
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Release must belong to a project'],
    },
    plannedDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Release', releaseSchema);
