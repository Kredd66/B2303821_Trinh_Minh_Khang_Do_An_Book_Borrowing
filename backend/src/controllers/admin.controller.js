const User = require('../models/User.model');
const Book = require('../models/Book.model');
const BorrowRecord = require('../models/BorrowRecord.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalBooks, totalBorrows, pendingBorrows, overdueBorrows] = await Promise.all([
      User.countDocuments({ role: 'reader' }),
      Book.countDocuments({ isActive: true }),
      BorrowRecord.countDocuments(),
      BorrowRecord.countDocuments({ status: 'pending' }),
      BorrowRecord.countDocuments({ status: 'overdue' })
    ]);

    // Lấy 5 đơn mượn gần nhất
    const recentBorrows = await BorrowRecord.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('user', 'name email');

    // Thống kê số lượng đơn mượn theo 7 ngày gần nhất
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    // Aggregation logic for daily data
    const dailyBorrowsRaw = await BorrowRecord.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+07:00" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format array for the chart
    const labels = [];
    const counts = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
      
      labels.push(d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
      const found = dailyBorrowsRaw.find(b => b._id === dateStr);
      counts.push(found ? found.count : 0);
    }

    return successResponse(res, 200, 'Thống kê tổng quan', {
      cards: {
        totalUsers,
        totalBooks,
        totalBorrows,
        pendingBorrows,
        overdueBorrows,
      },
      recentBorrows,
      chartData: {
        labels,
        data: counts
      }
    });

  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = { getDashboardStats };
