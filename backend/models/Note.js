import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
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
      default: null,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide note title'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Please provide note content']
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    color: {
      type: String,
      default: '#ffffff'
    }
  },
  {
    timestamps: true
  }
);

noteSchema.index({ userId: 1, isFavorite: -1, updatedAt: -1 });

export default mongoose.model('Note', noteSchema);
