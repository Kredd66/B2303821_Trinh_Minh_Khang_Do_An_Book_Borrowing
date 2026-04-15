const BorrowRecord = require('../models/BorrowRecord.model');
const Book = require('../models/Book.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const BORROW_LIMIT = 5;
const BORROW_DAYS  = 14;
const FINE_PER_DAY = 2000;

// ─── Reader: Gửi yêu cầu mượn ────────────────────────────────
const createBorrowRequest = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0)
      return errorResponse(res, 400, 'Giỏ sách trống');

    // 1. Chặn nếu đang có phiếu quá hạn
    const hasOverdue = await BorrowRecord.findOne({
      user: req.user._id,
      status: 'overdue',
    });
    if (hasOverdue)
      return errorResponse(res, 403, 'Bạn đang có sách quá hạn chưa trả. Vui lòng trả sách trước khi mượn thêm.');

    // 2. Kiểm tra giới hạn số sách đang mượn
    const activeRecords = await BorrowRecord.find({
      user: req.user._id,
      status: { $in: ['pending', 'approved'] },
    });
    const totalBorrowing = activeRecords.reduce((sum, r) => sum + r.items.length, 0);
    if (totalBorrowing + items.length > BORROW_LIMIT)
      return errorResponse(res, 403, `Bạn chỉ được mượn tối đa ${BORROW_LIMIT} cuốn cùng lúc. Hiện đang có ${totalBorrowing} cuốn.`);

    // 3. Kiểm tra sách trùng
    const borrowingBookIds = activeRecords.flatMap((r) =>
      r.items.map((i) => i.bookId.toString())
    );
    const duplicates = items.filter((i) => borrowingBookIds.includes(i.bookId.toString()));
    if (duplicates.length > 0)
      return errorResponse(res, 409, `Bạn đang mượn sách: "${duplicates.map((d) => d.title).join('", "')}"`);

    // 4. Kiểm tra stock
    const bookIds = items.map((i) => i.bookId);
    const books   = await Book.find({ _id: { $in: bookIds }, isActive: true });

    for (const item of items) {
      const book = books.find((b) => b._id.toString() === item.bookId.toString());
      if (!book)           return errorResponse(res, 404, `Không tìm thấy sách: "${item.title}"`);
      if (book.stock <= 0) return errorResponse(res, 409, `Sách đã hết: "${item.title}"`);
    }

    // 5. Tạo phiếu
    const record = await BorrowRecord.create({ user: req.user._id, items });
    return successResponse(res, 201, 'Gửi yêu cầu mượn thành công', record);

  } catch (error) {
    console.error('LỖI CREATE BORROW:', error);
    return errorResponse(res, 500, error.message);
  }
};

// ─── Reader: Xem lịch sử ─────────────────────────────────────
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

// ─── Admin: Xem tất cả phiếu ─────────────────────────────────
const getAllBorrows = async (req, res) => {
  try {
    const { page = 1, limit = 15, status } = req.query;
    const query = {};
    if (status) query.status = status;

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

// ─── Admin: Duyệt phiếu ──────────────────────────────────────
const approveBorrow = async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.id);
    if (!record) return errorResponse(res, 404, 'Không tìm thấy phiếu mượn');
    if (record.status !== 'pending')
      return errorResponse(res, 400, 'Phiếu này không ở trạng thái chờ duyệt');

    const bookIds = record.items.map((i) => i.bookId.toString());
    const books   = await Book.find({ _id: { $in: bookIds } });

    // Kiểm tra stock
    for (const item of record.items) {
      const book = books.find((b) => b._id.toString() === item.bookId.toString());
      if (!book)           return errorResponse(res, 404, `Không tìm thấy sách "${item.title}"`);
      if (book.stock <= 0) return errorResponse(res, 409, `Sách "${item.title}" đã hết trong kho`);
    }

    // Dùng $inc atomic để tránh race condition (không cần transaction)
    // findOneAndUpdate với điều kiện stock > 0 để an toàn
    for (const item of record.items) {
      const updated = await Book.findOneAndUpdate(
        { _id: item.bookId, stock: { $gt: 0 } },
        { $inc: { stock: -1 } }
      );
      if (!updated) {
        // Rollback các cuốn đã trừ trước đó
        const processedIds = record.items
          .slice(0, record.items.indexOf(item))
          .map((i) => i.bookId);
        if (processedIds.length > 0) {
          await Book.updateMany(
            { _id: { $in: processedIds } },
            { $inc: { stock: 1 } }
          );
        }
        return errorResponse(res, 409, `Sách "${item.title}" vừa hết trong kho`);
      }
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + BORROW_DAYS);

    record.status     = 'approved';
    record.borrowDate = new Date();
    record.dueDate    = dueDate;
    record.adminNote  = req.body?.adminNote || '';
    await record.save();

    return successResponse(res, 200, 'Duyệt phiếu thành công', record);

  } catch (error) {
    console.error('LỖI APPROVE:', error);
    return errorResponse(res, 500, error.message);
  }
};

// ─── Admin: Xác nhận trả sách ────────────────────────────────
const returnBorrow = async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.id);
    if (!record) return errorResponse(res, 404, 'Không tìm thấy phiếu mượn');
    if (!['approved', 'overdue'].includes(record.status))
      return errorResponse(res, 400, 'Phiếu này chưa được duyệt hoặc đã trả rồi');

    // Tính phí phạt
    let fine = 0;
    if (record.dueDate && new Date() > new Date(record.dueDate)) {
      const diffMs   = new Date() - new Date(record.dueDate);
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      fine = diffDays * FINE_PER_DAY;
    }

    // Cộng stock atomic
    const bulkOps = record.items.map((item) => ({
      updateOne: {
        filter: { _id: item.bookId },
        update: { $inc: { stock: 1 } },
      },
    }));
    await Book.bulkWrite(bulkOps);

    record.status     = 'returned';
    record.returnDate = new Date();
    record.fine       = fine;
    if (req.body?.returnNote) record.adminNote = req.body.returnNote;
    await record.save();

    return successResponse(res, 200, 'Xác nhận trả sách thành công', {
      record,
      fine,
      fineText: fine > 0
        ? `Phí phạt: ${fine.toLocaleString('vi-VN')}đ`
        : 'Không có phí phạt',
    });

  } catch (error) {
    console.error('LỖI RETURN:', error);
    return errorResponse(res, 500, error.message);
  }
};

// ─── Admin: Báo mất sách ─────────────────────────────────────
const reportLostBook = async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.id);
    if (!record) return errorResponse(res, 404, 'Không tìm thấy phiếu mượn');
    if (!['approved', 'overdue'].includes(record.status))
      return errorResponse(res, 400, 'Phiếu không ở trạng thái đang mượn');

    const lostFine = record.items.length * 30 * FINE_PER_DAY;

    // Trừ totalCopies (sách mất thì không cộng stock)
    const bulkOps = record.items.map((item) => ({
      updateOne: {
        filter: { _id: item.bookId },
        update: { $inc: { totalCopies: -1 } },
      },
    }));
    await Book.bulkWrite(bulkOps);

    record.status     = 'lost';
    record.returnDate = new Date();
    record.fine       = lostFine;
    record.adminNote  = req.body?.note || 'Sách bị mất';
    await record.save();

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

module.exports = {
  createBorrowRequest,
  getMyBorrows,
  getAllBorrows,
  approveBorrow,
  returnBorrow,
  reportLostBook,
};