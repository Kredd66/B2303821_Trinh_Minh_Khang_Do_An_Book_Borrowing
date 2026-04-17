const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const register = async (req, res) => {
  try {
    const { name, email, password, studentId, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return errorResponse(res, 409, 'Email đã được sử dụng');

    const user = await User.create({ name, email, password, studentId, phone });
    const token = signToken(user._id);

    return successResponse(res, 201, 'Đăng ký thành công', {
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return errorResponse(res, 401, 'Email hoặc mật khẩu không đúng');
    }

    if (user.isActive === false) {
      return errorResponse(res, 403, 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ cửa hàng.');
    }

    const token = signToken(user._id);
    return successResponse(res, 200, 'Đăng nhập thành công', {
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const getMe = async (req, res) => {
  return successResponse(res, 200, 'Thông tin người dùng', req.user);
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, studentId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, studentId },
      { new: true, runValidators: true }
    );
    return successResponse(res, 200, 'Cập nhật thông tin thành công', user);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(oldPassword))) {
      return errorResponse(res, 401, 'Mật khẩu cũ không chính xác');
    }
    user.password = newPassword;
    await user.save();
    return successResponse(res, 200, 'Đổi mật khẩu thành công');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 15, search } = req.query;
    const query = { role: 'reader' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort('-createdAt').skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    return successResponse(res, 200, 'Danh sách người dùng', {
      users,
      pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, 'Không tìm thấy người dùng');
    if (user.role === 'admin') return errorResponse(res, 403, 'Không thể thao tác lên tài khoản admin');
    
    user.isActive = !user.isActive;
    await user.save();
    
    return successResponse(res, 200, user.isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản', user);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword, getAllUsers, toggleUserStatus };