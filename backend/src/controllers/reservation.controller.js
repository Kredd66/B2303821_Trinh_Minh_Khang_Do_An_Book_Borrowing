const Reservation = require('../models/Reservation.model');
const Book = require('../models/Book.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { createNotification } = require('../utils/notification.util');

// Đặt trước sách (chỉ khi stock = 0)
const createReservation = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user._id;

    const book = await Book.findById(bookId);
    if (!book || !book.isActive) return errorResponse(res, 404, 'Không tìm thấy sách');
    
    if (book.stock > 0) 
      return errorResponse(res, 400, 'Sách vẫn còn trong kho, hãy mượn trực tiếp!');

    // Lọc xem user có đang kẹt lượt chờ nào không
    const activeRes = await Reservation.findOne({
      user: userId, book: bookId, status: { $in: ['waiting', 'notified'] }
    });
    if (activeRes)
      return errorResponse(res, 400, 'Bạn đã đặt trước sách này và đang trong hàng đợi.');

    const reservation = await Reservation.create({ user: userId, book: bookId });
    return successResponse(res, 201, 'Đã đặt chỗ thành công. Bạn sẽ nhận thông báo khi sách có sẵn.', reservation);

  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Xem lịch sử đặt trước của Reader
const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('book', 'title author coverImage')
      .sort('-createdAt');
    return successResponse(res, 200, 'Danh sách đặt trước', reservations);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Hủy đặt chỗ
const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return errorResponse(res, 404, 'Không tìm thấy đơn đặt trước');
    if (reservation.user.toString() !== req.user._id.toString())
      return errorResponse(res, 403, 'Không có quyền thao tác');
    if (!['waiting', 'notified'].includes(reservation.status))
      return errorResponse(res, 400, 'Chỉ có thể hủy đơn đang đợi hoặc vừa được cấp suất chờ.');

    const oldStatus = reservation.status;
    reservation.status = 'cancelled';
    await reservation.save();

    // Nếu người này đang giữ suất (notified) -> phải nhả suất!
    if (oldStatus === 'notified') {
      const nextUser = await Reservation.findOne({ book: reservation.book, status: 'waiting' }).sort('createdAt');
      if (nextUser) {
        nextUser.status = 'notified';
        nextUser.notifiedAt = new Date();
        await nextUser.save();

        const book = await Book.findById(reservation.book);
        createNotification(
          nextUser.user,
          'Sách đặt trước đã có sẵn 📚',
          `Cuốn sách "${book.title}" bạn chờ đã có. Hãy vào hệ thống mượn ngay trong 24 giờ tới nhé!`,
          'success',
          '/reservations'
        );
      } else {
        // Không còn ai đợi -> trả lại kho
        await Book.findByIdAndUpdate(reservation.book, { $inc: { stock: 1 } });
      }
    }

    return successResponse(res, 200, 'Đã hủy đơn đặt trước');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = { createReservation, getMyReservations, cancelReservation };
