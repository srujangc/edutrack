import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema(
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
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: [true, 'Please select day of the week']
    },
    classroom: {
      type: String,
      trim: true,
      default: 'LH-101'
    },
    startTime: {
      type: String,
      required: [true, 'Please provide start time (HH:MM format)'],
      match: [/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Please provide a valid time in HH:MM format']
    },
    endTime: {
      type: String,
      required: [true, 'Please provide end time (HH:MM format)'],
      match: [/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Please provide a valid time in HH:MM format']
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

timetableSchema.index({ userId: 1, day: 1, startTime: 1 });

export default mongoose.model('Timetable', timetableSchema);
