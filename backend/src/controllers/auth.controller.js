const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const sendEmail = require('../utils/sendEmail');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const register = async (req, res) => {
  try {
    const { name, email, password, studentId, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return errorResponse(res, 409, 'Email đã được sử dụng');

    if (studentId) {
      const existingStudent = await User.findOne({ studentId });
      if (existingStudent) return errorResponse(res, 409, 'Mã số sinh viên (MSSV) này đã được đăng ký cho một tài khoản khác');
    }

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

    if (studentId) {
      // Tìm xem có User nào (trừ bản thân) đang xài mã này không
      const duplicatedStudent = await User.findOne({ studentId, _id: { $ne: req.user._id } });
      if (duplicatedStudent) return errorResponse(res, 409, 'Mã số sinh viên này đã bị người khác sử dụng!');
    }

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

// =========================== KHÔI PHỤC MẬT KHẨU ===========================

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return errorResponse(res, 404, 'Không có người dùng nào đăng ký với email này');

    // Lấy nguyên mẫu token gửi qua mail
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Tạo đường dẫn
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const message = `
      <div style="max-w: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #0C447C; text-align: center;">Khôi phục mật khẩu Thư viện</h2>
        <p>Chào <b>${user.name}</b>,</p>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu. Vui lòng click vào nút bên dưới để tạo mật khẩu mới:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #f59e0b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Đổi mật khẩu ngay</a>
        </div>
        <p style="color: #666; font-size: 13px;">Nếu bạn không yêu cầu, vui lòng bỏ qua email này. Liên kết sẽ hết hạn sau 15 phút.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Cấp lại Mật khẩu - Book Borrowing System',
        html: message,
      });

      return successResponse(res, 200, 'Đã gửi liên kết khôi phục qua Email');
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Lỗi khi gửi email:', err);
      return errorResponse(res, 500, 'Lỗi gửi email. Có thể bạn chưa cấu hình địa chỉ email gửi phía server.');
    }
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    // Mã hoá ngược lại cái params raw gửi lên để so sánh với cái dưới DB
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return errorResponse(res, 400, 'Token không hợp lệ hoặc đã hết hạn');

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return successResponse(res, 200, 'Đổi mật khẩu thành công. Bây giờ bạn có thể đăng nhập.');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword, getAllUsers, toggleUserStatus, forgotPassword, resetPassword };