const BorrowRecord = require('../models/BorrowRecord.model');
const Book = require('../models/Book.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Reader gửi yêu cầu mượn từ giỏ sách localStorage
const createBorrowRequest = async (req, res) => {
  try {
    const { items } = req.body;
    // items: [{ bookId, title, author, coverImage }]

    if (!items || items.length === 0)
      return errorResponse(res, 400, 'Giỏ sách trống');

    // Kiểm tra stock từng cuốn
    const bookIds = items.map((i) => i.bookId);
    const books = await Book.find({ _id: { $in: bookIds }, isActive: true });

    const outOfStock = [];
    for (const item of items) {
      const book = books.find((b) => b._id.toString() === item.bookId);
      if (!book) { outOfStock.push(item.title); continue; }
      if (book.stock <= 0) outOfStock.push(book.title);
    }

    if (outOfStock.length > 0)
      return errorResponse(res, 409, `Sách sau đây đã hết: ${outOfStock.join(', ')}`);

    const record = await BorrowRecord.create({ user: req.user._id, items });
    return successResponse(res, 201, 'Gửi yêu cầu mượn thành công', record);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Reader xem lịch sử của mình
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

// Admin xem tất cả phiếu
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

// Admin duyệt phiếu → stock - 1 mỗi cuốn, set dueDate
const approveBorrow = async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.id);
    if (!record) return errorResponse(res, 404, 'Không tìm thấy phiếu mượn');
    if (record.status !== 'pending')
      return errorResponse(res, 400, 'Phiếu này không ở trạng thái chờ duyệt');

    const bookIds = record.items.map((i) => i.bookId);
    const books = await Book.find({ _id: { $in: bookIds } });
    for (const item of record.items) {
      const book = books.find((b) => b._id.toString() === item.bookId.toString());
      if (!book || book.stock <= 0)
        return errorResponse(res, 409, `Sách "${item.title}" đã hết trong kho`);
    }

    const bulkOps = record.items.map((item) => ({
      updateOne: { filter: { _id: item.bookId }, update: { $inc: { stock: -1 } } },
    }));
    await Book.bulkWrite(bulkOps);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    record.status = 'approved';
    record.borrowDate = new Date();
    record.dueDate = dueDate;
    if (req.body.adminNote) record.adminNote = req.body.adminNote;
    await record.save();

    return successResponse(res, 200, 'Duyệt phiếu thành công', record);
  } catch (error) {
    console.error('LỖI APPROVE:', error); // <-- thêm dòng này
    return errorResponse(res, 500, error.message);
  }
};

// Admin xác nhận trả sách → stock + 1
const returnBorrow = async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.id);
    if (!record) return errorResponse(res, 404, 'Không tìm thấy phiếu mượn');
    if (!['approved', 'overdue'].includes(record.status))
      return errorResponse(res, 400, 'Phiếu này chưa được duyệt hoặc đã trả rồi');

    // Cộng stock từng cuốn
    const bulkOps = record.items.map((item) => ({
      updateOne: { filter: { _id: item.bookId }, update: { $inc: { stock: 1 } } },
    }));
    await Book.bulkWrite(bulkOps);

    record.status = 'returned';
    record.returnDate = new Date();
    await record.save();

    return successResponse(res, 200, 'Xác nhận trả sách thành công', record);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = { createBorrowRequest, getMyBorrows, getAllBorrows, approveBorrow, returnBorrow };