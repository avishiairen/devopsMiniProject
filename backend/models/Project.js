const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['Planning', 'Active', 'On Hold', 'Completed'],
        message: 'Status must be Planning, Active, On Hold, or Completed',
      },
      default: 'Planning',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
