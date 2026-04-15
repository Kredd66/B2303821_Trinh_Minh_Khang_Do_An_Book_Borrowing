const mongoose = require('mongoose');

const borrowItemSchema = new mongoose.Schema(
  {
    bookId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    title:      { type: String, required: true },
    author:     { type: String, required: true },
    coverImage: { type: String, default: '' },
  },
  { _id: false }
);

const borrowRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [borrowItemSchema], required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'returned', 'overdue', 'lost'], // thêm 'lost'
      default: 'pending',
    },
    borrowDate: { type: Date },
    dueDate:    { type: Date },
    returnDate: { type: Date },
    fine:       { type: Number, default: 0 },  // phí phạt (VNĐ)
    adminNote:  { type: String, default: '' },
  },
  { timestamps: true }
);

borrowRecordSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);