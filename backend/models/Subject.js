import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Please provide subject name'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Please provide subject code (e.g. CS501)'],
      trim: true,
      uppercase: true
    },
    semester: {
      type: String,
      trim: true,
      default: 'Semester 5'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    facultyName: {
      type: String,
      trim: true,
      default: 'Prof. Faculty'
    },
    color: {
      type: String,
      default: '#3b82f6' // Tailwind blue-500
    },
    credits: {
      type: Number,
      default: 3,
      min: 1,
      max: 10
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure uniqueness of subject code per user
subjectSchema.index({ userId: 1, code: 1 }, { unique: true });

export default mongoose.model('Subject', subjectSchema);
