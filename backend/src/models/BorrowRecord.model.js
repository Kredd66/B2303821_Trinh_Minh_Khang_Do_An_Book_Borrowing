const mongoose = require('mongoose');

const borrowItemSchema = new mongoose.Schema(
  {
    bookId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    title:      { type: String, required: true },
    author:     { type: String, required: true },
    coverImage: { type: String, default: '' },
    // ─── Per-item tracking ───────────────────────────────────
    itemStatus:      { type: String, enum: ['borrowing', 'returned', 'lost'], default: 'borrowing' },
    itemDueDate:     { type: Date },    // có thể khác nhau sau gia hạn từng phần
    itemReturnDate:  { type: Date },
    renewalRequested: { type: Boolean, default: false },
    renewalCount:     { type: Number,  default: 0 },
  },
  { _id: false }
);

const borrowRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [borrowItemSchema], required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'partial_returned', 'returned', 'overdue', 'lost'],
      default: 'pending',
    },
    borrowDate: { type: Date },
    dueDate:    { type: Date },   // ngày hết hạn gốc khi duyệt
    returnDate: { type: Date },   // khi toàn bộ phiếu kết thúc
    fine:       { type: Number, default: 0 },
    adminNote:  { type: String,  default: '' },
  },
  { timestamps: true }
);

borrowRecordSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);