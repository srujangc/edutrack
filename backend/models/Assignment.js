import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Please provide assignment title'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    dueDate: {
      type: Date,
      required: [true, 'Please provide due date']
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending',
      index: true
    },
    completedAt: {
      type: Date,
      default: null
    },
    totalMarks: {
      type: Number,
      default: 100
    },
    obtainedMarks: {
      type: Number,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for sorting by deadline
assignmentSchema.index({ userId: 1, dueDate: 1 });

export default mongoose.model('Assignment', assignmentSchema);
