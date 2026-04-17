const { body, param, validationResult } = require('express-validator');

// ─── Helper: Chạy sau mỗi validator chain ──────────────────────
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Auth ──────────────────────────────────────────────────────
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên không được để trống')
    .isLength({ min: 2, max: 100 }).withMessage('Tên phải từ 2–100 ký tự'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không đúng định dạng')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự'),

  body('studentId')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Mã sinh viên tối đa 20 ký tự'),

  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9\s\-\+\(\)]*$/).withMessage('Số điện thoại không hợp lệ')
    .isLength({ max: 15 }).withMessage('Số điện thoại tối đa 15 ký tự'),

  handleValidation,
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không đúng định dạng')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống'),

  handleValidation,
];

const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Tên phải từ 2–100 ký tự'),

  body('studentId')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Mã sinh viên tối đa 20 ký tự'),

  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9\s\-\+\(\)]*$/).withMessage('Số điện thoại không hợp lệ')
    .isLength({ max: 15 }).withMessage('Số điện thoại tối đa 15 ký tự'),

  handleValidation,
];

const validateChangePassword = [
  body('oldPassword')
    .notEmpty().withMessage('Mật khẩu cũ không được để trống'),

  body('newPassword')
    .notEmpty().withMessage('Mật khẩu mới không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu mới tối thiểu 6 ký tự'),

  handleValidation,
];

// ─── Book ──────────────────────────────────────────────────────
const validateCreateBook = [
  body('title')
    .trim()
    .notEmpty().withMessage('Tên sách không được để trống')
    .isLength({ min: 1, max: 300 }).withMessage('Tên sách tối đa 300 ký tự'),

  body('author')
    .trim()
    .notEmpty().withMessage('Tên tác giả không được để trống')
    .isLength({ max: 200 }).withMessage('Tên tác giả tối đa 200 ký tự'),

  body('category')
    .notEmpty().withMessage('Thể loại không được để trống')
    .isMongoId().withMessage('ID thể loại không hợp lệ'),

  body('stock')
    .notEmpty().withMessage('Số lượng tồn kho không được để trống')
    .isInt({ min: 0 }).withMessage('Số lượng tồn kho phải là số nguyên không âm'),

  body('totalCopies')
    .notEmpty().withMessage('Tổng số bản không được để trống')
    .isInt({ min: 0 }).withMessage('Tổng số bản phải là số nguyên không âm')
    .custom((value, { req }) => {
      if (Number(value) < Number(req.body.stock)) {
        throw new Error('Tổng số bản phải lớn hơn hoặc bằng số tồn kho');
      }
      return true;
    }),

  body('isbn')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('ISBN tối đa 20 ký tự'),

  body('coverImage')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !/^https?:\/\/.+/.test(value)) {
        throw new Error('URL ảnh bìa phải bắt đầu bằng http:// hoặc https://');
      }
      return true;
    }),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Mô tả tối đa 2000 ký tự'),

  handleValidation,
];

const validateUpdateBook = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Tên sách không được để trống nếu được cung cấp')
    .isLength({ max: 300 }).withMessage('Tên sách tối đa 300 ký tự'),

  body('author')
    .optional()
    .trim()
    .notEmpty().withMessage('Tên tác giả không được để trống nếu được cung cấp')
    .isLength({ max: 200 }).withMessage('Tên tác giả tối đa 200 ký tự'),

  body('category')
    .optional()
    .isMongoId().withMessage('ID thể loại không hợp lệ'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Số lượng tồn kho phải là số nguyên không âm'),

  body('totalCopies')
    .optional()
    .isInt({ min: 0 }).withMessage('Tổng số bản phải là số nguyên không âm'),

  body('coverImage')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !/^https?:\/\/.+/.test(value)) {
        throw new Error('URL ảnh bìa phải bắt đầu bằng http:// hoặc https://');
      }
      return true;
    }),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Mô tả tối đa 2000 ký tự'),

  handleValidation,
];

const validateUpdateStock = [
  body('stock')
    .notEmpty().withMessage('Số lượng không được để trống')
    .isInt({ min: 0 }).withMessage('Số lượng phải là số nguyên không âm'),

  handleValidation,
];

// ─── Category ──────────────────────────────────────────────────
const validateCategory = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên thể loại không được để trống')
    .isLength({ min: 2, max: 100 }).withMessage('Tên thể loại phải từ 2–100 ký tự'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Mô tả tối đa 500 ký tự'),

  handleValidation,
];

// ─── Borrow ────────────────────────────────────────────────────
const validateCreateBorrow = [
  body('items')
    .isArray({ min: 1 }).withMessage('Giỏ sách phải có ít nhất 1 cuốn')
    .isArray({ max: 5 }).withMessage('Giỏ sách tối đa 5 cuốn'),

  body('items.*.bookId')
    .notEmpty().withMessage('ID sách không được để trống')
    .isMongoId().withMessage('ID sách không hợp lệ'),

  body('items.*.title')
    .trim()
    .notEmpty().withMessage('Tên sách không được để trống'),

  body('items.*.author')
    .trim()
    .notEmpty().withMessage('Tác giả không được để trống'),

  handleValidation,
];

const validateMongoId = [
  param('id')
    .isMongoId().withMessage('ID không hợp lệ'),

  handleValidation,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateCreateBook,
  validateUpdateBook,
  validateUpdateStock,
  validateCategory,
  validateCreateBorrow,
  validateMongoId,
};
