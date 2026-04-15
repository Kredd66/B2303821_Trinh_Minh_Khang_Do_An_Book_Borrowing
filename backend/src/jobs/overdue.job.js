const cron = require('node-cron');
const BorrowRecord = require('../models/BorrowRecord.model');

// Chạy lúc 00:05 mỗi ngày
cron.schedule('5 0 * * *', async () => {
  try {
    const now = new Date();

    // Chỉ cập nhật các phiếu approved bị quá hạn (không đụng lost/returned)
    const result = await BorrowRecord.updateMany(
      {
        status:  'approved',
        dueDate: { $lt: now },
      },
      { $set: { status: 'overdue' } }
    );

    if (result.modifiedCount > 0) {
      console.log(`[CRON ${now.toLocaleDateString('vi-VN')}] Cập nhật quá hạn: ${result.modifiedCount} phiếu`);
    }
  } catch (error) {
    console.error('[CRON] Lỗi cập nhật quá hạn:', error.message);
  }
});

console.log('[CRON] Overdue job đã được khởi tạo — chạy lúc 00:05 mỗi ngày');