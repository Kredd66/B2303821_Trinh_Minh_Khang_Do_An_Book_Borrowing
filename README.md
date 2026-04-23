# 📚 Hệ thống Quản lý Mượn sách trực tuyến (MEVN Stack)

Hệ thống Quản lý Mượn sách là một ứng dụng web hiện đại được xây dựng để hỗ trợ việc số hóa quy trình quản lý thư viện, giúp Độc giả dễ dàng tra cứu, mượn sách và giúp Thủ thư quản lý kho sách, phiếu mượn một cách hiệu quả.

---

## 🚀 Công nghệ sử dụng (Tech Stack)

Dự án được phát triển dựa trên mô hình **MEVN Stack**:
- **M**ongoDB: Cơ sở dữ liệu NoSQL linh hoạt, lưu trữ dữ liệu người dùng và sách.
- **E**xpress.js: Framework backend mạnh mẽ cho Node.js.
- **V**ue.js 3: Framework frontend hiện đại cho giao diện người dùng.
- **N**ode.js: Môi trường thực thi JavaScript phía server.

**Công cụ hỗ trợ khác:**
- **Tailwind CSS**: Framework CSS cho giao diện Responsive.
- **Pinia**: Quản lý State cho Vue.js.
- **JWT**: Xác thực và phân quyền người dùng.
- **Nodemailer**: Gửi email thông báo tự động.

---

## ✨ Tính năng chính

### 👤 Dành cho Độc giả (Reader)
- **Tra cứu sách**: Tìm kiếm theo tên, tác giả hoặc lọc theo thể loại.
- **Giỏ hàng mượn sách**: Chọn nhiều sách cùng lúc trước khi gửi yêu cầu.
- **Theo dõi lịch sử**: Xem trạng thái phiếu mượn (Đang chờ, Đang mượn, Đã trả, Quá hạn).
- **Đặt trước sách**: Xếp hàng chờ mượn khi sách hiện tại đã hết trong kho.
- **Quản lý cá nhân**: Cập nhật thông tin và khôi phục mật khẩu qua Email.

### 🛡️ Dành cho Quản trị viên (Admin/Staff)
- **Dashboard**: Thống kê tổng quan hoạt động của thư viện.
- **Quản lý Sách**: Thêm, sửa, xóa và quản lý số lượng tồn kho.
- **Duyệt phiếu mượn**: Quy trình duyệt/từ chối yêu cầu mượn sách từ độc giả.
- **Quản lý trả sách**: Xác nhận trả sách và ghi nhận ngày thực tế.
- **Quản lý Người dùng**: Theo dõi danh sách sinh viên và nhân viên.

---

## 🛠️ Hướng dẫn cài đặt và Chạy dự án

### 1. Yêu cầu hệ thống
- **Node.js** (Phiên bản 16.x trở lên)
- **MongoDB** (Cài đặt cục bộ hoặc dùng MongoDB Atlas)

### 2. Cấu hình Backend
Di chuyển vào thư mục `backend`:
```bash
cd backend
npm install
```
Tạo tệp `.env` dựa trên cấu hình mẫu (tham khảo `.env.example` nếu có):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/library_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```
Khởi tạo dữ liệu mẫu (Seeding data):
```bash
npm run seed
```
Chạy server backend:
```bash
npm run dev
```

### 3. Cấu hình Frontend
Di chuyển vào thư mục `frontend`:
```bash
cd frontend
npm install
```
Chạy ứng dụng khách:
```bash
npm run dev
```

---

## 📂 Cấu trúc thư mục dự án

```text
├── backend/
│   ├── src/
│   │   ├── config/      # Cấu hình DB, Cloudinary
│   │   ├── controllers/ # Xử lý logic nghiệp vụ
│   │   ├── models/      # Định nghĩa Schema MongoDB
│   │   ├── routes/      # Định nghĩa các API endpoints
│   │   ├── middlewares/ # Kiểm tra xác thực, upload ảnh
│   │   └── utils/       # Gửi mail, helper functions
│   └── server.js        # File chạy chính của server
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios config kết nối Backend
│   │   ├── components/  # Các component dùng chung
│   │   ├── views/       # Các trang chính (Admin, Reader)
│   │   ├── stores/      # Quản lý state (Auth, Cart)
│   │   └── router/      # Cấu hình định tuyến
│   └── App.vue
└── README.md
```

---

## 📝 Tác giả
- **Họ tên:** Trịnh Minh Khang
- **MSSV:** B2303821
- **Đề tài:** Phát triển ứng dụng Web - CT449

---
*Dự án này được thực hiện vì mục đích học tập và nghiên cứu.*
