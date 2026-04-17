const Notification = require('../models/Notification.model');

/**
 * Tạo thông báo (internal helper - dùng trong các controller khác)
 * @param {ObjectId} userId - người nhận
 * @param {string}   title
 * @param {string}   message
 * @param {'info'|'success'|'warning'|'danger'} type
 * @param {string}   link - optional deeplink
 */
const createNotification = async (userId, title, message, type = 'info', link = '') => {
  try {
    await Notification.create({ user: userId, title, message, type, link });
  } catch (err) {
    console.error('[Notification] Lỗi tạo thông báo:', err.message);
  }
};

module.exports = { createNotification };
