const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User.model');
const Category = require('../models/Category.model');
const Book = require('../models/Book.model');
const BorrowRecord = require('../models/BorrowRecord.model');

const categories = [
  { name: 'Công nghệ thông tin', slug: 'cong-nghe-thong-tin', description: 'Sách về lập trình, mạng máy tính, trí tuệ nhân tạo' },
  { name: 'Kinh tế', slug: 'kinh-te', description: 'Sách về kinh tế, tài chính, quản trị kinh doanh' },
  { name: 'Văn học', slug: 'van-hoc', description: 'Tiểu thuyết, truyện ngắn, thơ ca trong và ngoài nước' },
  { name: 'Khoa học tự nhiên', slug: 'khoa-hoc-tu-nhien', description: 'Toán học, vật lý, hóa học, sinh học' },
  { name: 'Kỹ năng sống', slug: 'ky-nang-song', description: 'Sách phát triển bản thân, kỹ năng mềm' },
  { name: 'Lịch sử', slug: 'lich-su', description: 'Lịch sử Việt Nam và thế giới' },
];

const users = [
  {
    name: 'Admin Thư Viện',
    email: 'admin@library.com',
    password: 'admin123',
    role: 'admin',
    studentId: '',
    phone: '0901234567',
  },
  {
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@student.edu.vn',
    password: '123456',
    role: 'reader',
    studentId: '2151010001',
    phone: '0912345678',
  },
  {
    name: 'Trần Thị Bình',
    email: 'binh.tran@student.edu.vn',
    password: '123456',
    role: 'reader',
    studentId: '2151010002',
    phone: '0923456789',
  },
  {
    name: 'Lê Hoàng Nam',
    email: 'nam.le@student.edu.vn',
    password: '123456',
    role: 'reader',
    studentId: '2151010003',
    phone: '0934567890',
  },
];

const getBooks = (categoryMap) => [
  // CNTT
  {
    title: 'Lập trình JavaScript hiện đại',
    author: 'Nguyễn Thanh Tùng',
    isbn: '978-604-77-1001-1',
    category: categoryMap['cong-nghe-thong-tin'],
    coverImage: 'https://covers.openlibrary.org/b/id/8739161-L.jpg',
    description: 'Hướng dẫn toàn diện về JavaScript ES6+, bao gồm async/await, module, và các tính năng hiện đại nhất.',
    stock: 5,
    totalCopies: 8,
  },
  {
    title: 'Cơ sở dữ liệu - Lý thuyết và thực hành',
    author: 'Trần Minh Châu',
    isbn: '978-604-77-1002-2',
    category: categoryMap['cong-nghe-thong-tin'],
    coverImage: 'https://covers.openlibrary.org/b/id/8739162-L.jpg',
    description: 'Giáo trình cơ sở dữ liệu quan hệ, SQL, NoSQL và thiết kế database cho sinh viên CNTT.',
    stock: 3,
    totalCopies: 6,
  },
  {
    title: 'Trí tuệ nhân tạo và Machine Learning',
    author: 'Phạm Quốc Hùng',
    isbn: '978-604-77-1003-3',
    category: categoryMap['cong-nghe-thong-tin'],
    coverImage: 'https://covers.openlibrary.org/b/id/8739163-L.jpg',
    description: 'Giới thiệu các thuật toán ML cơ bản: Linear Regression, Decision Tree, Neural Network với Python.',
    stock: 4,
    totalCopies: 5,
  },
  {
    title: 'Kiến trúc phần mềm - Design Patterns',
    author: 'Lê Văn Dũng',
    isbn: '978-604-77-1004-4',
    category: categoryMap['cong-nghe-thong-tin'],
    coverImage: 'https://covers.openlibrary.org/b/id/8739164-L.jpg',
    description: '23 Design Patterns kinh điển của Gang of Four, giải thích bằng ví dụ thực tế Java và Python.',
    stock: 2,
    totalCopies: 4,
  },
  {
    title: 'Mạng máy tính và Internet',
    author: 'Hoàng Thị Mai',
    isbn: '978-604-77-1005-5',
    category: categoryMap['cong-nghe-thong-tin'],
    coverImage: 'https://covers.openlibrary.org/b/id/8739165-L.jpg',
    description: 'Kiến thức nền tảng về mạng máy tính, giao thức TCP/IP, HTTP, bảo mật mạng.',
    stock: 0,
    totalCopies: 3,
  },
  {
    title: 'Lập trình Web với Node.js và Express',
    author: 'Nguyễn Minh Khoa',
    isbn: '978-604-77-1006-6',
    category: categoryMap['cong-nghe-thong-tin'],
    coverImage: 'https://covers.openlibrary.org/b/id/8739166-L.jpg',
    description: 'Xây dựng RESTful API với Node.js, Express, MongoDB. Triển khai ứng dụng lên cloud.',
    stock: 6,
    totalCopies: 6,
  },

  // Kinh tế
  {
    title: 'Kinh tế học vi mô',
    author: 'GS. Nguyễn Đức Thành',
    isbn: '978-604-77-2001-1',
    category: categoryMap['kinh-te'],
    coverImage: 'https://covers.openlibrary.org/b/id/8739167-L.jpg',
    description: 'Giáo trình kinh tế học vi mô dành cho sinh viên đại học, bao gồm cung cầu, thị trường, và phúc lợi xã hội.',
    stock: 7,
    totalCopies: 10,
  },
  {
    title: 'Quản trị kinh doanh căn bản',
    author: 'TS. Lê Thị Hoa',
    isbn: '978-604-77-2002-2',
    category: categoryMap['kinh-te'],
    coverImage: 'https://covers.openlibrary.org/b/id/8739168-L.jpg',
    description: 'Các nguyên lý quản trị, hoạch định chiến lược, quản lý nhân sự và tài chính doanh nghiệp.',
    stock: 4,
    totalCopies: 7,
  },
  {
    title: 'Tài chính doanh nghiệp',
    author: 'PGS. Trần Văn Hải',
    isbn: '978-604-77-2003-3',
    category: categoryMap['kinh-te'],
    coverImage: 'https://covers.openlibrary.org/b/id/8739169-L.jpg',
    description: 'Phân tích tài chính, định giá doanh nghiệp, quản lý vốn và đầu tư tài chính.',
    stock: 3,
    totalCopies: 5,
  },

  // Văn học
  {
    title: 'Số đỏ',
    author: 'Vũ Trọng Phụng',
    isbn: '978-604-77-3001-1',
    category: categoryMap['van-hoc'],
    coverImage: 'https://covers.openlibrary.org/b/id/8739170-L.jpg',
    description: 'Tiểu thuyết trào phúng xuất sắc của văn học Việt Nam, phản ánh xã hội thực dân nửa phong kiến.',
    stock: 8,
    totalCopies: 10,
  },
  {
    title: 'Tắt đèn',
    author: 'Ngô Tất Tố',
    isbn: '978-604-77-3002-2',
    category: categoryMap['van-hoc'],
    coverImage: 'https://covers.openlibrary.org/b/id/8739171-L.jpg',
    description: 'Tác phẩm hiện thực xuất sắc về cuộc sống người nông dân Việt Nam trước Cách mạng tháng Tám.',
    stock: 5,
    totalCopies: 8,
  },
  {
    title: 'Nhà Giả Kim',
    author: 'Paulo Coelho',
    isbn: '978-604-77-3003-3',
    category: categoryMap['van-hoc'],
    coverImage: 'https://covers.openlibrary.org/b/id/8739172-L.jpg',
    description: 'Câu chuyện về hành trình theo đuổi ước mơ của chàng chăn cừu Santiago trên sa mạc Sahara.',
    stock: 6,
    totalCopies: 9,
  },
  {
    title: 'Đắc Nhân Tâm',
    author: 'Dale Carnegie',
    isbn: '978-604-77-5001-1',
    category: categoryMap['ky-nang-song'],
    coverImage: 'https://covers.openlibrary.org/b/id/8739173-L.jpg',
    description: 'Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử, đã thay đổi cuộc đời hàng triệu người.',
    stock: 10,
    totalCopies: 12,
  },
  {
    title: 'Nghĩ giàu và làm giàu',
    author: 'Napoleon Hill',
    isbn: '978-604-77-5002-2',
    category: categoryMap['ky-nang-song'],
    coverImage: 'https://covers.openlibrary.org/b/id/8739174-L.jpg',
    description: 'Bí quyết thành công từ nghiên cứu cuộc đời 500 triệu phú nổi tiếng nhất nước Mỹ.',
    stock: 7,
    totalCopies: 10,
  },
  {
    title: 'Toán cao cấp - Tập 1',
    author: 'GS. Nguyễn Đình Trí',
    isbn: '978-604-77-4001-1',
    category: categoryMap['khoa-hoc-tu-nhien'],
    coverImage: 'https://covers.openlibrary.org/b/id/8739175-L.jpg',
    description: 'Giáo trình toán cao cấp dành cho sinh viên kỹ thuật: Giải tích, đại số tuyến tính, xác suất thống kê.',
    stock: 9,
    totalCopies: 15,
  },
  {
    title: 'Lịch sử Việt Nam từ nguồn gốc đến thế kỷ XIX',
    author: 'GS. Lê Thành Khôi',
    isbn: '978-604-77-6001-1',
    category: categoryMap['lich-su'],
    coverImage: 'https://covers.openlibrary.org/b/id/8739176-L.jpg',
    description: 'Công trình nghiên cứu toàn diện về lịch sử Việt Nam từ thời tiền sử đến cuối thế kỷ XIX.',
    stock: 4,
    totalCopies: 6,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Ket noi MongoDB thanh cong');

    // Xóa dữ liệu cũ
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Book.deleteMany({}),
      BorrowRecord.deleteMany({}),
    ]);
    console.log('Da xoa du lieu cu');

    // Tạo Categories
    const createdCategories = await Category.insertMany(categories);
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });
    console.log(`Da tao ${createdCategories.length} the loai`);

    // Tạo Users (hash password thủ công vì insertMany không trigger pre-save hook)
    const hashedUsers = await Promise.all(
      users.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 12),
      }))
    );
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`Da tao ${createdUsers.length} nguoi dung`);

    // Tạo Books
    const books = getBooks(categoryMap);
    const createdBooks = await Book.insertMany(books);
    console.log(`Da tao ${createdBooks.length} cuon sach`);

    // Tạo BorrowRecords mẫu
    const reader1 = createdUsers.find((u) => u.email === 'an.nguyen@student.edu.vn');
    const reader2 = createdUsers.find((u) => u.email === 'binh.tran@student.edu.vn');
    const reader3 = createdUsers.find((u) => u.email === 'nam.le@student.edu.vn');

    const book1 = createdBooks[0];
    const book2 = createdBooks[1];
    const book3 = createdBooks[5];
    const book4 = createdBooks[13];

    const pastDate = (daysAgo) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d;
    };

    const borrowRecords = [
      // Phiếu đang chờ duyệt
      {
        user: reader1._id,
        items: [
          { bookId: book1._id, title: book1.title, author: book1.author, coverImage: book1.coverImage },
          { bookId: book2._id, title: book2.title, author: book2.author, coverImage: book2.coverImage },
        ],
        status: 'pending',
        createdAt: pastDate(1),
      },
      // Phiếu đang mượn (approved)
      {
        user: reader2._id,
        items: [
          { bookId: book3._id, title: book3.title, author: book3.author, coverImage: book3.coverImage },
        ],
        status: 'approved',
        borrowDate: pastDate(5),
        dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // còn 9 ngày
        createdAt: pastDate(5),
      },
      // Phiếu quá hạn
      {
        user: reader3._id,
        items: [
          { bookId: book4._id, title: book4.title, author: book4.author, coverImage: book4.coverImage },
        ],
        status: 'overdue',
        borrowDate: pastDate(20),
        dueDate: pastDate(6), // đã quá hạn 6 ngày
        createdAt: pastDate(20),
      },
      // Phiếu đã trả
      {
        user: reader1._id,
        items: [
          { bookId: book4._id, title: book4.title, author: book4.author, coverImage: book4.coverImage },
        ],
        status: 'returned',
        borrowDate: pastDate(30),
        dueDate: pastDate(16),
        returnDate: pastDate(18),
        createdAt: pastDate(30),
      },
    ];

    await BorrowRecord.insertMany(borrowRecords);
    console.log(`Da tao ${borrowRecords.length} phieu muon mau`);

    console.log('\n===== SEED THANH CONG =====');
    console.log('Tai khoan Admin:');
    console.log('  Email   : admin@library.com');
    console.log('  Password: admin123');
    console.log('\nTai khoan Reader:');
    console.log('  Email   : an.nguyen@student.edu.vn  | Password: 123456');
    console.log('  Email   : binh.tran@student.edu.vn  | Password: 123456');
    console.log('  Email   : nam.le@student.edu.vn     | Password: 123456');
    console.log('===========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Loi seed:', error.message);
    process.exit(1);
  }
};

seed();