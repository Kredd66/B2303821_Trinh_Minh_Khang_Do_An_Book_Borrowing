const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    status: {
      type: String,
      enum: ['waiting', 'notified', 'fulfilled', 'cancelled'],
      default: 'waiting',
    },
    notifiedAt: { type: Date }, // mốc thời gian giữ hàng 24h
  },
  { timestamps: true }
);

// Một user chỉ được phép có 1 lượt chờ tích cực (waiting hoặc notified) trên 1 cuốn sách.
reservationSchema.index({ user: 1, book: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
