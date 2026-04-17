const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Tạo reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL, // Email người gửi (.env)
      pass: process.env.SMTP_PASSWORD, // App Password của Gmail (.env)
    },
  });

  // Cấu hình nội dung thư
  const message = {
    from: `"${process.env.FROM_NAME || 'Library System'}" <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html, // Chấp nhận mã HTML để email chuyên nghiệp hơn
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
