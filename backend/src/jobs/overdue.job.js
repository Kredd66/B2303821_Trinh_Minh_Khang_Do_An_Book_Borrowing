const cron = require('node-cron');
const BorrowRecord = require('../models/BorrowRecord.model');

// Chạy lúc 00:05 mỗi ngày
cron.schedule('5 0 * * *', async () => {
  try {
    const result = await BorrowRecord.updateMany(
      { status: 'approved', dueDate: { $lt: new Date() } },
      { $set: { status: 'overdue' } }
    );
    console.log(`[CRON] Cập nhật quá hạn: ${result.modifiedCount} phiếu`);
  } catch (error) {
    console.error('[CRON] Lỗi cập nhật quá hạn:', error.message);
  }
});