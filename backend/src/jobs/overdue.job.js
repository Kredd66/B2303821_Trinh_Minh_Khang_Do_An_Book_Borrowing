const cron = require('node-cron');
const BorrowRecord = require('../models/BorrowRecord.model');
const { createNotification } = require('../utils/notification.util');

// Chạy lúc 00:05 mỗi ngày
cron.schedule('5 0 * * *', async () => {
  try {
    const now = new Date();
    // Bỏ qua phần giờ phút giây để so sánh ngày cho chính xác
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Lấy tất cả phiếu đang mượn hoặc đã quá hạn
    const activeRecords = await BorrowRecord.find({
      status: { $in: ['approved', 'partial_returned', 'overdue'] },
    });

    let overdueCount = 0;
    let reminderCount = 0;

    for (const record of activeRecords) {
      let isOverdue = false;
      let newlyOverdue = false;
      
      const dueBooks = [];
      const tomorrowDueBooks = [];
      const threeDaysDueBooks = [];

      for (const item of record.items) {
        if (item.itemStatus !== 'borrowing') continue;
        const due = new Date(item.itemDueDate || record.dueDate);
        const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
        
        const diffTime = dueDateOnly - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          isOverdue = true;
          dueBooks.push(item.title);
          // Gửi thông báo nhắc nhở quá hạn (Gửi vào ngày quá hạn 1, 3, 7)
          if (diffDays === -1 || diffDays === -3 || diffDays === -7) {
            createNotification(
              record.user,
              'Sách quá hạn 🚨',
              `Sách "${item.title}" của bạn đã quá hạn ${Math.abs(diffDays)} ngày. Vui lòng mang trả thư viện ngay lập tức để tránh phí phạt tăng cao!`,
              'danger',
              '/history'
            );
          }
        } else if (diffDays === 1) {
          tomorrowDueBooks.push(item.title);
        } else if (diffDays === 3) {
          threeDaysDueBooks.push(item.title);
        }
      } // end item loop

      // Nếu có sách sắp đến hạn (1 ngày)
      if (tomorrowDueBooks.length > 0) {
        createNotification(
          record.user,
          'Sách hết hạn vào ngày mai ⏰',
          `Bạn có ${tomorrowDueBooks.length} cuốn sách ("${tomorrowDueBooks.join('", "')}") sẽ hết hạn vào ngày mai. Xin vui lòng mang trả thư viện đúng hạn.`,
          'warning',
          '/history'
        );
        reminderCount++;
      }

      // Nếu có sách sắp đến hạn (3 ngày)
      if (threeDaysDueBooks.length > 0) {
        createNotification(
          record.user,
          'Nhắc nhở hạn trả sách 📅',
          `Sách "${threeDaysDueBooks.join('", "')}" của bạn sẽ hết hạn trong 3 ngày tới. Bạn có thể xin gia hạn nếu cần.`,
          'info',
          '/history'
        );
        reminderCount++;
      }

      // Cập nhật trạng thái phiếu nếu có sách quá hạn và trước đó chưa bị đổi
      if (isOverdue && record.status !== 'overdue') {
        record.status = 'overdue';
        await record.save();
        overdueCount++;
      } else if (!isOverdue && record.status === 'overdue') {
        // Trường hợp tất cả sách quá hạn đã trả, phiếu quay lại approved/partial_returned sẽ được computeRecordStatus cover lúc return,
        // Nhưng nếu vì lý do nào đó cron thấy không còn sách quá hạn thì cập nhật lại (hiếm khi xảy ra ở đây)
      }
    }

    console.log(`[CRON ${now.toLocaleDateString('vi-VN')}] Đã nhắc nhở ${reminderCount} lần, Cập nhật ${overdueCount} phiếu quá hạn.`);
  } catch (error) {
    console.error('[CRON] Lỗi cập nhật quá hạn:', error.message);
  }
});

console.log('[CRON] Notification & Overdue job đã được khởi tạo — chạy lúc 00:05 mỗi ngày');