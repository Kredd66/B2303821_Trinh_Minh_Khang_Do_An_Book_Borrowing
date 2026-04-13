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

module.exports = { register, login, getMe };