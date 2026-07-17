import mongoose from 'mongoose';
const borrowRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    borrowDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    returnDate: {
      type: Date,
      default: null,
    },
    fine: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Borrowed', 'Returned'],
      default: 'Borrowed',
    },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), //60 days
    },
  },
  { timestamps: true },
);

export const BorrowRecord = mongoose.model('BorrowRecord', borrowRecordSchema);
