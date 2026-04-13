const mongoose = require('mongoose');

// Snapshot từng cuốn sách tại thời điểm mượn
const borrowItemSchema = new mongoose.Schema(
  {
    bookId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    title:      { type: String, required: true },  // snapshot
    author:     { type: String, required: true },  // snapshot
    coverImage: { type: String, default: '' },     // snapshot
  },
  { _id: false }
);

const borrowRecordSchema = new mongoose.Schema(
  {
    user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items:      { type: [borrowItemSchema], required: true },
    status:     {
      type: String,
      enum: ['pending', 'approved', 'returned', 'overdue'],
      default: 'pending',
    },
    borrowDate: { type: Date },
    dueDate:    { type: Date },
    returnDate: { type: Date },
    adminNote:  { type: String, default: '' },
  },
  { timestamps: true }
);

// Index để query nhanh theo user và status
borrowRecordSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);