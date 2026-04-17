const BorrowRecord = require('../models/BorrowRecord.model');
const Book = require('../models/Book.model');
const User = require('../models/User.model');
const Reservation = require('../models/Reservation.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { createNotification } = require('../utils/notification.util');

const BORROW_LIMIT = 5;
const BORROW_DAYS  = 14;
const FINE_PER_DAY = 2000;

// ─── Helper: Tính lại trạng thái phiếu dựa trên trạng thái từng sách ─────────
const computeRecordStatus = (record) => {
  const activeItems = record.items.filter(i => i.itemStatus === 'borrowing');
  const allClosed   = record.items.every(i => ['returned', 'lost'].includes(i.itemStatus));

  if (allClosed) return 'returned';
  if (activeItems.length < record.items.length) return 'partial_returned'; // một phần đã trả

  // Tất cả vẫn đang mượn — kiểm tra quá hạn
  const now = new Date();
  const anyOverdue = activeItems.some(i => {
    const due = i.itemDueDate || record.dueDate;
    return due && new Date(due) < now;
  });
  return anyOverdue ? 'overdue' : 'approved';
};

// ─── Reader: Gửi yêu cầu mượn ────────────────────────────────────────────────
const createBorrowRequest = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0)
      return errorResponse(res, 400, 'Giỏ sách trống');

    // 1. Chặn nếu đang có phiếu quá hạn
    const hasOverdue = await BorrowRecord.findOne({ user: req.user._id, status: 'overdue' });
    if (hasOverdue)
      return errorResponse(res, 403, 'Bạn đang có sách quá hạn chưa trả. Vui lòng trả sách trước khi mượn thêm.');

    // 2. Kiểm tra giới hạn số sách đang mượn
    const activeRecords = await BorrowRecord.find({
      user: req.user._id,
      status: { $in: ['pending', 'approved', 'overdue', 'partial_returned'] },
    });
    const totalBorrowing = activeRecords.reduce((sum, r) =>
      sum + r.items.filter(i => i.itemStatus === 'borrowing').length, 0);
    if (totalBorrowing + items.length > BORROW_LIMIT)
      return errorResponse(res, 403, `Bạn chỉ được mượn tối đa ${BORROW_LIMIT} cuốn cùng lúc. Hiện đang có ${totalBorrowing} cuốn.`);

    // 3. Kiểm tra sách trùng lặp
    const borrowingBookIds = activeRecords.flatMap(r =>
      r.items.filter(i => i.itemStatus === 'borrowing').map(i => i.bookId.toString())
    );
    const duplicateIds = items.map(i => i.bookId.toString()).filter(id => borrowingBookIds.includes(id));
    if (duplicateIds.length > 0) {
      const duplicateBooks = await Book.find({ _id: { $in: duplicateIds } }, 'title');
      const duplicateTitles = duplicateBooks.map(b => b.title).join('", "');
      return errorResponse(res, 409, `Bạn đang mượn sách (chưa trả): "${duplicateTitles}"`);
    }

    // 4. Kiểm tra stock và Reservation
    const bookIds = items.map(i => i.bookId);
    const books = await Book.find({ _id: { $in: bookIds }, isActive: true });
    
    // Tìm các reservation đã được gọi tên của user này
    const notifiedReservations = await Reservation.find({
      user: req.user._id,
      book: { $in: bookIds },
      status: 'notified'
    });

    for (const item of items) {
      const book = books.find(b => b._id.toString() === item.bookId.toString());
      if (!book) return errorResponse(res, 404, `Không tìm thấy sách: "${item.title}"`);
      
      if (book.stock <= 0) {
        const hasResv = notifiedReservations.some(r => r.book.toString() === item.bookId.toString());
        if (!hasResv) {
          return errorResponse(res, 409, `Sách đã hết: "${item.title}". Vui lòng sử dụng tính năng Đặt trước sách.`);
        }
      }
    }

    // 5. Tạo phiếu — mỗi item mặc định itemStatus = 'borrowing'
    const record = await BorrowRecord.create({ user: req.user._id, items });

    // Thông báo cho Admin
    const admins = await User.find({ role: 'admin' }, '_id');
    await Promise.all(admins.map(admin =>
      createNotification(admin._id, 'Yêu cầu mượn sách mới',
        `${req.user.name} vừa gửi yêu cầu mượn ${items.length} cuốn sách. Vui lòng kiểm tra và duyệt.`,
        'info', '/admin/borrows')
    ));

    return successResponse(res, 201, 'Gửi yêu cầu mượn thành công', record);
  } catch (error) {
    console.error('LỖI CREATE BORROW:', error);
    return errorResponse(res, 500, error.message);
  }
};

// ─── Reader: Xem lịch sử ──────────────────────────────────────────────────────
const getMyBorrows = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [records, total] = await Promise.all([
      BorrowRecord.find(query).sort('-createdAt').skip(skip).limit(Number(limit)),
      BorrowRecord.countDocuments(query),
    ]);
    return successResponse(res, 200, 'Lịch sử mượn sách', {
      records,
      pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ─── Admin: Xem tất cả phiếu ──────────────────────────────────────────────────
const getAllBorrows = async (req, res) => {
  try {
    const { page = 1, limit = 15, status, search } = req.query;
    const query = {};
    if (status) query.status = status;

    if (search) {
      const users = await User.find({
        $or: [
          { name:      { $regex: search, $options: 'i' } },
          { email:     { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } },
        ]
      }, '_id');
      query.user = { $in: users.map(u => u._id) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [records, total] = await Promise.all([
      BorrowRecord.find(query)
        .populate('user', 'name email studentId')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      BorrowRecord.countDocuments(query),
    ]);
    return successResponse(res, 200, 'Tất cả phiếu mượn', {
      records,
      pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ─── Admin: Duyệt phiếu ───────────────────────────────────────────────────────
const approveBorrow = async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.id);
    if (!record) return errorResponse(res, 404, 'Không tìm thấy phiếu mượn');
    if (record.status !== 'pending')
      return errorResponse(res, 400, 'Phiếu này không ở trạng thái chờ duyệt');

    const bookIds = record.items.map(i => i.bookId.toString());
    const books   = await Book.find({ _id: { $in: bookIds } });

    // Kiểm tra stock và giải quyết Reservation atomic
    for (const item of record.items) {
      const book = books.find(b => b._id.toString() === item.bookId.toString());
      if (!book) return errorResponse(res, 404, `Không tìm thấy sách "${item.title}"`);
      
      // Tìm xem user có suất giữ chỗ không
      const resv = await Reservation.findOneAndUpdate(
        { user: record.user, book: item.bookId, status: 'notified' },
        { status: 'fulfilled' }
      );

      if (resv) continue; // Nếu có suất giữ chỗ, không cần trừ stock hiện tại!
      
      if (book.stock <= 0) return errorResponse(res, 409, `Sách "${item.title}" đã hết trong kho`);
      
      const updated = await Book.findOneAndUpdate(
        { _id: item.bookId, stock: { $gt: 0 } },
        { $inc: { stock: -1 } }
      );
      if (!updated) {
        // Rollback các sách trước đó
        const processedIds = record.items.slice(0, record.items.indexOf(item)).map(i => i.bookId);
        if (processedIds.length > 0) await Book.updateMany({ _id: { $in: processedIds } }, { $inc: { stock: 1 } });
        return errorResponse(res, 409, `Sách "${item.title}" vừa hết trong kho`);
      }
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + BORROW_DAYS);

    // Gán itemDueDate cho từng sách
    record.items.forEach(item => {
      item.itemStatus  = 'borrowing';
      item.itemDueDate = dueDate;
    });
    record.status     = 'approved';
    record.borrowDate = new Date();
    record.dueDate    = dueDate;
    record.adminNote  = req.body?.adminNote || '';
    await record.save();

    createNotification(record.user, 'Phiếu mượn được duyệt ✅',
      `Phiếu mượn sách của bạn đã được duyệt! Vui lòng đến thư viện nhận sách. Hạn trả: ${dueDate.toLocaleDateString('vi-VN')}.`,
      'success', '/history');

    return successResponse(res, 200, 'Duyệt phiếu thành công', record);
  } catch (error) {
    console.error('LỖI APPROVE:', error);
    return errorResponse(res, 500, error.message);
  }
};

// ─── Admin: Xác nhận trả (hỗ trợ trả từng phần) ─────────────────────────────
const returnBorrow = async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.id);
    if (!record) return errorResponse(res, 404, 'Không tìm thấy phiếu mượn');
    if (!['approved', 'overdue', 'partial_returned'].includes(record.status))
      return errorResponse(res, 400, 'Phiếu không ở trạng thái đang mượn');

    const { bookIds, returnNote } = req.body;
    // Nếu không truyền bookIds → trả tất cả sách đang mượn
    const targetIds = bookIds?.length
      ? bookIds.map(String)
      : record.items.filter(i => i.itemStatus === 'borrowing').map(i => i.bookId.toString());

    if (targetIds.length === 0)
      return errorResponse(res, 400, 'Không có sách nào được chọn để trả');

    const now = new Date();
    let addedFine = 0;
    const bulkOps = [];
    let notifiedUsersForResvMsg = 0;

    for (const item of record.items) {
      if (!targetIds.includes(item.bookId.toString())) continue;
      if (item.itemStatus !== 'borrowing') continue;

      // Tính phí phạt theo hạn từng cuốn
      const due = item.itemDueDate || record.dueDate;
      if (due && now > new Date(due)) {
        const days = Math.ceil((now - new Date(due)) / (1000 * 60 * 60 * 24));
        addedFine += days * FINE_PER_DAY;
      }

      item.itemStatus     = 'returned';
      item.itemReturnDate = now;

      // Hàng đợi: Kiểm tra có ai đang chờ cuốn sách này không?
      const nextUserResv = await Reservation.findOne({ book: item.bookId, status: 'waiting' }).sort('createdAt');
      
      if (nextUserResv) {
        // Có người đang chờ -> Giữ sách (Không cộng stock) -> Chuyển status cho người chờ
        nextUserResv.status = 'notified';
        nextUserResv.notifiedAt = now;
        await nextUserResv.save();

        const bData = await Book.findById(item.bookId, 'title');
        createNotification(
          nextUserResv.user._id,
          'Sách đặt trước đã có mặt! 📚',
          `Cuốn sách "${bData.title}" bạn đưa vào hàng đợi đã có sẵn. Hãy vào mượn ngay trong vòng 24 giờ tới nhé!`,
          'success',
          '/reservations'
        );
        notifiedUsersForResvMsg++;
      } else {
        // Nếu không có người chờ -> Cộng stock như bình thường
        bulkOps.push({ updateOne: { filter: { _id: item.bookId }, update: { $inc: { stock: 1 } } } });
      }
    }

    if (bulkOps.length > 0) await Book.bulkWrite(bulkOps);

    record.fine     = (record.fine || 0) + addedFine;
    record.status   = computeRecordStatus(record);
    if (['returned'].includes(record.status)) record.returnDate = now;
    if (returnNote) record.adminNote = returnNote;
    await record.save();

    const returnedCount = bulkOps.length;
    const stillBorrowing = record.items.filter(i => i.itemStatus === 'borrowing').length;

    createNotification(record.user, 'Xác nhận trả sách ✅',
      addedFine > 0
        ? `Thư viện đã nhận lại ${returnedCount} cuốn sách. Phí phạt: ${addedFine.toLocaleString('vi-VN')}đ.${stillBorrowing > 0 ? ` Bạn còn ${stillBorrowing} cuốn chưa trả.` : ''}`
        : `Thư viện đã nhận lại ${returnedCount} cuốn sách.${stillBorrowing > 0 ? ` Bạn còn ${stillBorrowing} cuốn chưa trả.` : ' Cảm ơn bạn!'}`,
      addedFine > 0 ? 'warning' : 'success', '/history');

    return successResponse(res, 200, 'Xác nhận trả sách thành công', {
      record,
      fine: addedFine,
      fineText: addedFine > 0 ? `Phí phạt: ${addedFine.toLocaleString('vi-VN')}đ` : 'Không có phí phạt',
      returnedCount,
      stillBorrowing,
    });
  } catch (error) {
    console.error('LỖI RETURN:', error);
    return errorResponse(res, 500, error.message);
  }
};

// ─── Admin: Báo mất sách (hỗ trợ từng phần) ──────────────────────────────────
const reportLostBook = async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.id);
    if (!record) return errorResponse(res, 404, 'Không tìm thấy phiếu mượn');
    if (!['approved', 'overdue', 'partial_returned'].includes(record.status))
      return errorResponse(res, 400, 'Phiếu không ở trạng thái đang mượn');

    const { bookIds, note } = req.body;
    const targetIds = bookIds?.length
      ? bookIds.map(String)
      : record.items.filter(i => i.itemStatus === 'borrowing').map(i => i.bookId.toString());

    if (targetIds.length === 0)
      return errorResponse(res, 400, 'Không có sách nào được chọn');

    let lostFine = 0;
    const bulkOps = [];

    for (const item of record.items) {
      if (!targetIds.includes(item.bookId.toString())) continue;
      if (item.itemStatus !== 'borrowing') continue;

      lostFine += 30 * FINE_PER_DAY; // phí đền bù 30 ngày / cuốn
      item.itemStatus     = 'lost';
      item.itemReturnDate = new Date();

      // Trừ totalCopies (sách mất không cộng stock)
      bulkOps.push({ updateOne: { filter: { _id: item.bookId }, update: { $inc: { totalCopies: -1 } } } });
    }

    if (bulkOps.length > 0) await Book.bulkWrite(bulkOps);

    record.fine    = (record.fine || 0) + lostFine;
    record.status  = computeRecordStatus(record);
    if (record.status === 'returned') record.returnDate = new Date();
    record.adminNote = note || record.adminNote || 'Sách bị mất';
    await record.save();

    createNotification(record.user, 'Sách bị báo mất ⚠️',
      `Hệ thống ghi nhận ${targetIds.length} cuốn sách trong phiếu mượn bị mất. Phí đền bù: ${lostFine.toLocaleString('vi-VN')}đ.`,
      'danger', '/history');

    return successResponse(res, 200, 'Đã ghi nhận mất sách', {
      record,
      fine: lostFine,
      fineText: `Phí đền bù: ${lostFine.toLocaleString('vi-VN')}đ`,
    });
  } catch (error) {
    console.error('LỖI LOST:', error);
    return errorResponse(res, 500, error.message);
  }
};

// ─── Reader: Hủy phiếu pending ────────────────────────────────────────────────
const cancelBorrow = async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.id);
    if (!record) return errorResponse(res, 404, 'Không tìm thấy phiếu mượn');
    if (record.user.toString() !== req.user._id.toString())
      return errorResponse(res, 403, 'Bạn không có quyền hủy phiếu này');
    if (record.status !== 'pending')
      return errorResponse(res, 400, 'Chỉ có thể hủy phiếu đang chờ duyệt');

    await record.deleteOne();
    return successResponse(res, 200, 'Đã hủy yêu cầu mượn thành công');
  } catch (error) {
    console.error('LỖI CANCEL:', error);
    return errorResponse(res, 500, error.message);
  }
};

// ─── Reader: Xin gia hạn (hỗ trợ từng phần) ─────────────────────────────────
const requestRenewal = async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.id);
    if (!record) return errorResponse(res, 404, 'Không tìm thấy phiếu mượn');
    if (record.user.toString() !== req.user._id.toString())
      return errorResponse(res, 403, 'Bạn không có quyền thao tác trên phiếu này');
    if (!['approved', 'partial_returned'].includes(record.status))
      return errorResponse(res, 400, 'Chỉ có thể gia hạn sách đang mượn');

    const { bookIds } = req.body;
    const targetIds = bookIds?.length
      ? bookIds.map(String)
      : record.items.filter(i => i.itemStatus === 'borrowing').map(i => i.bookId.toString());

    if (targetIds.length === 0)
      return errorResponse(res, 400, 'Không có sách nào được chọn để gia hạn');

    let anyUpdated = false;
    for (const item of record.items) {
      if (!targetIds.includes(item.bookId.toString())) continue;
      if (item.itemStatus !== 'borrowing') continue;
      if (item.renewalCount >= 1) continue; // đã gia hạn rồi
      if (item.renewalRequested)  continue; // đang chờ duyệt
      item.renewalRequested = true;
      anyUpdated = true;
    }

    if (!anyUpdated)
      return errorResponse(res, 400, 'Không có sách nào hợp lệ để xin gia hạn (đã gia hạn hoặc đang chờ duyệt)');

    await record.save();

    const admins = await User.find({ role: 'admin' }, '_id');
    await Promise.all(admins.map(admin =>
      createNotification(admin._id, 'Yêu cầu gia hạn sách ⏳',
        `${req.user.name} vừa gửi yêu cầu gia hạn thêm 7 ngày. Vui lòng xem xét và duyệt.`,
        'info', '/admin/borrows')
    ));

    return successResponse(res, 200, 'Đã gửi yêu cầu gia hạn thành công');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ─── Admin: Duyệt gia hạn (hỗ trợ từng phần) ────────────────────────────────
const approveRenewal = async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.id);
    if (!record) return errorResponse(res, 404, 'Không tìm thấy phiếu mượn');

    const { bookIds } = req.body;
    const targetIds = bookIds?.length
      ? bookIds.map(String)
      : record.items.filter(i => i.renewalRequested).map(i => i.bookId.toString());

    if (targetIds.length === 0)
      return errorResponse(res, 400, 'Không có sách nào đang chờ duyệt gia hạn');

    let anyUpdated = false;
    for (const item of record.items) {
      if (!targetIds.includes(item.bookId.toString())) continue;
      if (!item.renewalRequested) continue;

      const newDue = new Date(item.itemDueDate || record.dueDate);
      newDue.setDate(newDue.getDate() + 7);
      item.itemDueDate      = newDue;
      item.renewalRequested = false;
      item.renewalCount    += 1;
      anyUpdated = true;
    }

    if (!anyUpdated)
      return errorResponse(res, 400, 'Không có sách nào hợp lệ để duyệt gia hạn');

    // Cập nhật lại record.dueDate = max itemDueDate của các sách đang mượn
    const activeDueDates = record.items
      .filter(i => i.itemStatus === 'borrowing' && i.itemDueDate)
      .map(i => new Date(i.itemDueDate));
    if (activeDueDates.length > 0) record.dueDate = new Date(Math.max(...activeDueDates));

    await record.save();

    createNotification(record.user, 'Yêu cầu gia hạn được duyệt ✅',
      `Thư viện đã chấp thuận yêu cầu gia hạn. ${targetIds.length} cuốn sách đã được kéo dài thêm 7 ngày.`,
      'success', '/history');

    return successResponse(res, 200, 'Đã duyệt gia hạn thêm 7 ngày');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  createBorrowRequest,
  getMyBorrows,
  getAllBorrows,
  approveBorrow,
  returnBorrow,
  reportLostBook,
  cancelBorrow,
  requestRenewal,
  approveRenewal,
};