import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Please select a subject'],
      index: true
    },
    examDate: {
      type: Date,
      required: [true, 'Please provide exam date']
    },
    startTime: {
      type: String,
      default: '10:00',
      match: [/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Please provide a valid time in HH:MM format']
    },
    endTime: {
      type: String,
      default: '13:00',
      match: [/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Please provide a valid time in HH:MM format']
    },
    venue: {
      type: String,
      trim: true,
      default: 'Exam Hall 1'
    },
    examType: {
      type: String,
      enum: ['Midterm', 'Final', 'Quiz', 'Practical', 'Unit Test', 'Other'],
      default: 'Midterm'
    },
    syllabus: {
      type: String,
      trim: true,
      default: ''
    },
    maxMarks: {
      type: Number,
      default: 100
    },
    obtainedMarks: {
      type: Number,
      default: null
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

examSchema.index({ userId: 1, examDate: 1 });

export default mongoose.model('Exam', examSchema);
