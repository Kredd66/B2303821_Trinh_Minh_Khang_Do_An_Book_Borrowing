const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, required: true, minlength: 6, select: false },
    role:      { type: String, enum: ['reader', 'admin'], default: 'reader' },
    studentId: { type: String, trim: true, default: '' },
    phone:     { type: String, trim: true, default: '' },
    isActive:  { type: Boolean, default: true },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Hash password trước khi save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// So sánh password khi login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Tạo token khôi phục mật khẩu
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token để lưu DB (chống leak db bị lộ token)
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  // Token sống 15 phút
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  
  return resetToken; // Trả về dạng raw để gửi qua email
};

module.exports = mongoose.model('User', userSchema);