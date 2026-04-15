const router = require('express').Router();
const {
  createBorrowRequest,
  getMyBorrows,
  getAllBorrows,
  approveBorrow,
  returnBorrow,
  reportLostBook,
} = require('../controllers/borrow.controller');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

router.post('/',               protect,          createBorrowRequest);
router.get('/my',              protect,          getMyBorrows);
router.get('/',                protect, isAdmin, getAllBorrows);
router.patch('/:id/approve',   protect, isAdmin, approveBorrow);
router.patch('/:id/return',    protect, isAdmin, returnBorrow);
router.patch('/:id/lost',      protect, isAdmin, reportLostBook); // Mới

module.exports = router;