const Book = require('../models/Book.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, category, sort = '-createdAt' } = req.query;
    const query = { isActive: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [books, total] = await Promise.all([
      Book.find(query)
          .populate('category', 'name slug')
          .sort(sort)
          .skip(skip)
          .limit(Number(limit)),
      Book.countDocuments(query),
    ]);

    return successResponse(res, 200, 'Danh sách sách', {
      books,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, isActive: true })
                           .populate('category', 'name slug');
    if (!book) return errorResponse(res, 404, 'Không tìm thấy sách');
    return successResponse(res, 200, 'Chi tiết sách', book);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const createBook = async (req, res) => {
  try {
    const { title, author, isbn, category, description, coverImage, stock, totalCopies } = req.body;

    const book = await Book.create({
      title, author, isbn, category, description,
      coverImage: coverImage || '',
      stock: Number(stock),
      totalCopies: Number(totalCopies),
    });

    return successResponse(res, 201, 'Thêm sách thành công', book);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return errorResponse(res, 404, 'Không tìm thấy sách');

    const updated = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    return successResponse(res, 200, 'Cập nhật sách thành công', updated);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { stock: Number(stock) },
      { new: true, runValidators: true }
    );
    if (!book) return errorResponse(res, 404, 'Không tìm thấy sách');
    return successResponse(res, 200, 'Cập nhật số lượng thành công', book);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!book) return errorResponse(res, 404, 'Không tìm thấy sách');
    return successResponse(res, 200, 'Đã ẩn sách thành công');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = { getBooks, getBookById, createBook, updateBook, updateStock, deleteBook };