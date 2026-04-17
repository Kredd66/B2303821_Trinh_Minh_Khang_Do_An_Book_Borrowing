const Notification = require('../models/Notification.model');
const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Lấy danh sách thông báo của user hiện tại
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    return successResponse(res, 200, 'Thông báo của bạn', { notifications, unreadCount });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Đánh dấu một thông báo đã đọc
const markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true }
    );
    return successResponse(res, 200, 'Đã đánh dấu đã đọc');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Đánh dấu tất cả đã đọc
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    return successResponse(res, 200, 'Đã đánh dấu tất cả là đã đọc');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Xóa tất cả thông báo đã đọc
const clearRead = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id, isRead: true });
    return successResponse(res, 200, 'Đã xóa thông báo đã đọc');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead, clearRead };
