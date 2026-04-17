const cron = require('node-cron');
const Reservation = require('../models/Reservation.model');
const Book = require('../models/Book.model');
const { createNotification } = require('../utils/notification.util');

// Chạy vào phút thứ 0 của mỗi giờ (ví dụ: 1:00, 2:00, 3:00...)
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    // Ngưỡng trễ là 24 giờ trước thời điểm hiện tại
    const expiryThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Tìm các đơn đặt trước đã được báo hiệu quá 24h
    const expiredReservations = await Reservation.find({
      status: 'notified',
      notifiedAt: { $lt: expiryThreshold },
    });

    let expiredCount = 0;

    for (const resv of expiredReservations) {
      resv.status = 'cancelled';
      await resv.save();

      createNotification(
        resv.user,
        'Hủy giữ chỗ tự động 🕒',
        `Quá 24h không xác nhận mượn, hệ thống đã hủy suất đặt trước sách của bạn để dành cho người khác.`,
        'danger',
        '/reservations'
      );

      // Nhường suất cho người kế tiếp hoặc đẩy lại vào kho
      const nextUser = await Reservation.findOne({ book: resv.book, status: 'waiting' }).sort('createdAt');
      
      if (nextUser) {
        nextUser.status = 'notified';
        nextUser.notifiedAt = now;
        await nextUser.save();

        const book = await Book.findById(resv.book);
        createNotification(
          nextUser.user,
          'Sách đặt trước đã có sẵn 📚',
          `Cuốn sách "${book.title}" bạn chờ đã có. Hãy vào hệ thống mượn ngay trong 24 giờ tới nhé!`,
          'success',
          '/reservations'
        );
      } else {
        // Cộng trả kho vì không còn ai hóng
        await Book.findByIdAndUpdate(resv.book, { $inc: { stock: 1 } });
      }
      expiredCount++;
    }

    if (expiredCount > 0) {
      console.log(`[CRON ${now.toLocaleTimeString('vi-VN')}] Đã thu hồi ${expiredCount} suất giữ chỗ quá hạn.`);
    }

  } catch (error) {
    console.error('[CRON] Lỗi job quét reservation:', error.message);
  }
});

console.log('[CRON] Reservation clean-up job đã được khởi tạo — chạy mỗi giờ');
