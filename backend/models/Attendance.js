import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: [true, 'Please provide class date'],
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Excused'],
      required: [true, 'Please select attendance status'],
      default: 'Present'
    },
    note: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

attendanceSchema.index({ userId: 1, subjectId: 1, date: -1 });

export default mongoose.model('Attendance', attendanceSchema);
